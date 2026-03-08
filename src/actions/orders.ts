"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  orders,
  orderItems,
  orderStatusLog,
  cartItems,
  carts,
  menuItems,
  promoCodes,
  promoUsages,
  deliverySlots,
  users,
} from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe";
import { getCart, clearCart } from "./cart";
import type { OrderStatus, DeliverySlot } from "@/types";

const DELIVERY_FEE = 5.99;
const TAX_RATE = 0.085;
// 100 points = $1 discount
const LOYALTY_POINTS_RATE = 0.01;

export type CreateOrderInput = {
  type: "delivery" | "pickup";
  addressId?: number;
  deliverySlotId?: number;
  promoCode?: string;
  loyaltyPointsToRedeem?: number;
  tipAmount?: number;
  scoopLabConfigId?: number;
};

async function requireUser(): Promise<{ id: number; role: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: must be logged in");
  }
  return { id: parseInt(session.user.id, 10), role: session.user.role };
}

// ─── createOrder ─────────────────────────────────────────────────────────────

export async function createOrder(
  input: CreateOrderInput
): Promise<{ orderId: string; paymentIntentClientSecret: string }> {
  const user = await requireUser();

  // 1. Get cart
  const cart = await getCart();
  if (cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  // 2. Calculate totals
  const subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
  const taxAmount = subtotal * TAX_RATE;
  const deliveryFee = input.type === "delivery" ? DELIVERY_FEE : 0;
  const tipAmount = input.tipAmount ?? 0;

  // 3. Promo code validation
  let promoDiscount = 0;
  let promoCodeRecord: { id: number; discountType: "percentage" | "fixed"; discountValue: string } | undefined;

  if (input.promoCode) {
    const [promo] = await db
      .select()
      .from(promoCodes)
      .where(
        and(
          eq(promoCodes.code, input.promoCode.toUpperCase()),
          eq(promoCodes.isActive, true)
        )
      );

    if (!promo) throw new Error("Invalid or inactive promo code");
    if (promo.expiresAt && promo.expiresAt < new Date()) throw new Error("Promo code has expired");
    if (promo.usageLimit !== null && promo.totalUsed >= promo.usageLimit) {
      throw new Error("Promo code usage limit reached");
    }
    if (promo.minOrderValue !== null && subtotal < parseFloat(promo.minOrderValue)) {
      throw new Error(`Minimum order value of $${promo.minOrderValue} required for this promo`);
    }

    // Check per-customer usage
    if (promo.perCustomerLimit !== null) {
      const [usageCount] = await db
        .select({ count: promoUsages.id })
        .from(promoUsages)
        .where(
          and(
            eq(promoUsages.promoCodeId, promo.id),
            eq(promoUsages.userId, user.id)
          )
        );
      if (usageCount && promo.perCustomerLimit <= 1) {
        throw new Error("You have already used this promo code");
      }
    }

    promoCodeRecord = { id: promo.id, discountType: promo.discountType, discountValue: promo.discountValue };

    if (promo.discountType === "percentage") {
      promoDiscount = subtotal * (parseFloat(promo.discountValue) / 100);
    } else {
      promoDiscount = Math.min(parseFloat(promo.discountValue), subtotal);
    }
  }

  // 4. Loyalty points discount
  let loyaltyDiscount = 0;
  const pointsToRedeem = input.loyaltyPointsToRedeem ?? 0;
  if (pointsToRedeem > 0) {
    loyaltyDiscount = pointsToRedeem * LOYALTY_POINTS_RATE;
  }

  const totalDiscount = promoDiscount + loyaltyDiscount;
  const total = Math.max(0, subtotal + taxAmount + deliveryFee + tipAmount - totalDiscount);
  const totalInCents = Math.round(total * 100);

  // 5. Get delivery address if needed
  let deliveryAddress: { street?: string; city?: string; state?: string; zip?: string } | null = null;
  if (input.type === "delivery") {
    if (!input.addressId) throw new Error("Delivery address is required for delivery orders");
    // Delivery address lookup would go here — storing as null for now
    // as addresses table isn't in schema; can be added later
    deliveryAddress = {};
  }

  // 6. Get user's Stripe customer ID
  const [userRecord] = await db
    .select({ stripCustomerId: users.stripCustomerId, email: users.email })
    .from(users)
    .where(eq(users.id, user.id));

  // 7. Create Stripe PaymentIntent
  const paymentIntentParams: Parameters<typeof stripe.paymentIntents.create>[0] = {
    amount: totalInCents,
    currency: "usd",
    metadata: {
      userId: user.id.toString(),
      orderType: input.type,
    },
  };

  if (userRecord?.stripCustomerId) {
    paymentIntentParams.customer = userRecord.stripCustomerId;
  }

  const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

  if (!paymentIntent.client_secret) {
    throw new Error("Failed to create payment intent");
  }

  // 8. Create order
  const editWindowExpiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

  const [order] = await db
    .insert(orders)
    .values({
      userId: user.id,
      status: "pending",
      orderType: input.type,
      deliveryAddress: deliveryAddress,
      deliverySlotId: input.deliverySlotId ?? null,
      subtotal: subtotal.toFixed(2),
      discountAmount: totalDiscount.toFixed(2),
      tipAmount: tipAmount.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      total: total.toFixed(2),
      loyaltyPointsRedeemed: pointsToRedeem,
      promoCodeId: promoCodeRecord?.id ?? null,
      stripePaymentIntentId: paymentIntent.id,
      editWindowExpiresAt,
    })
    .returning({ id: orders.id });

  // 9. Insert order items from cart
  const orderItemValues = cart.items.map((item) => ({
    orderId: order.id,
    menuItemId: item.menuItem.id,
    scoopLabConfigId: item.scoopLabConfig ? undefined : undefined, // scoopLabConfigId stored in cart item
    quantity: item.quantity,
    unitPrice: item.menuItem.price,
    linePrice: item.subtotal.toFixed(2),
    itemNameSnapshot: item.menuItem.name,
  }));

  await db.insert(orderItems).values(orderItemValues);

  // 10. Log initial status
  await db.insert(orderStatusLog).values({
    orderId: order.id,
    toStatus: "pending",
    note: "Order created",
  });

  // 11. Record promo usage
  if (promoCodeRecord) {
    await db.insert(promoUsages).values({
      promoCodeId: promoCodeRecord.id,
      userId: user.id,
      orderId: order.id,
    });

    await db
      .update(promoCodes)
      .set({ totalUsed: (await db.select({ totalUsed: promoCodes.totalUsed }).from(promoCodes).where(eq(promoCodes.id, promoCodeRecord.id)))[0].totalUsed + 1 })
      .where(eq(promoCodes.id, promoCodeRecord.id));
  }

  // 12. Increment delivery slot booked count
  if (input.deliverySlotId) {
    const [slot] = await db
      .select({ bookedCount: deliverySlots.bookedCount })
      .from(deliverySlots)
      .where(eq(deliverySlots.id, input.deliverySlotId));

    if (slot) {
      await db
        .update(deliverySlots)
        .set({ bookedCount: slot.bookedCount + 1 })
        .where(eq(deliverySlots.id, input.deliverySlotId));
    }
  }

  // 13. Clear cart after order
  await clearCart();

  revalidatePath("/orders");
  revalidatePath("/cart");

  return {
    orderId: order.id.toString(),
    paymentIntentClientSecret: paymentIntent.client_secret,
  };
}

// ─── getOrder ────────────────────────────────────────────────────────────────

export async function getOrder(orderId: string): Promise<typeof orders.$inferSelect | null> {
  const user = await requireUser();
  const orderIdNum = parseInt(orderId, 10);

  const [order] = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.id, orderIdNum),
        user.role === "admin" ? undefined : eq(orders.userId, user.id)
      )
    );

  return order ?? null;
}

// ─── getUserOrders ────────────────────────────────────────────────────────────

export async function getUserOrders(): Promise<(typeof orders.$inferSelect)[]> {
  const user = await requireUser();

  const userOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, user.id))
    .orderBy(orders.createdAt);

  return userOrders;
}

// ─── updateOrderStatus ────────────────────────────────────────────────────────

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<typeof orders.$inferSelect> {
  const user = await requireUser();
  if (user.role !== "admin") throw new Error("Forbidden: admin only");

  const orderIdNum = parseInt(orderId, 10);

  const [existing] = await db
    .select({ id: orders.id, status: orders.status })
    .from(orders)
    .where(eq(orders.id, orderIdNum));

  if (!existing) throw new Error("Order not found");

  const [updated] = await db
    .update(orders)
    .set({
      status,
      updatedAt: new Date(),
      ...(status === "confirmed" ? { confirmedAt: new Date() } : {}),
      ...(status === "delivered" ? { deliveredAt: new Date() } : {}),
      ...(status === "cancelled" ? { cancelledAt: new Date() } : {}),
    })
    .where(eq(orders.id, orderIdNum))
    .returning();

  await db.insert(orderStatusLog).values({
    orderId: orderIdNum,
    fromStatus: existing.status,
    toStatus: status,
    changedByAdminId: user.id,
  });

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);

  return updated;
}

// ─── cancelOrder ─────────────────────────────────────────────────────────────

export async function cancelOrder(orderId: string): Promise<void> {
  const user = await requireUser();
  const orderIdNum = parseInt(orderId, 10);

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderIdNum), eq(orders.userId, user.id)));

  if (!order) throw new Error("Order not found");

  if (order.status === "cancelled") throw new Error("Order is already cancelled");
  if (!["pending", "confirmed"].includes(order.status)) {
    throw new Error("Order cannot be cancelled at this stage");
  }

  // Check 2 minute window
  if (order.editWindowExpiresAt && order.editWindowExpiresAt < new Date()) {
    throw new Error("Cancellation window has passed (2 minutes from order creation)");
  }

  // Cancel Stripe PaymentIntent if present
  if (order.stripePaymentIntentId) {
    try {
      await stripe.paymentIntents.cancel(order.stripePaymentIntentId);
    } catch {
      // PaymentIntent may already be captured — ignore
    }
  }

  const previousStatus = order.status;

  await db
    .update(orders)
    .set({
      status: "cancelled",
      cancelledAt: new Date(),
      cancellationReason: "Customer cancelled",
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderIdNum));

  await db.insert(orderStatusLog).values({
    orderId: orderIdNum,
    fromStatus: previousStatus,
    toStatus: "cancelled",
    note: "Customer cancelled within edit window",
  });

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
}

// ─── applyPromoCode ───────────────────────────────────────────────────────────

export async function applyPromoCode(
  orderId: string,
  code: string
): Promise<{ discount: number }> {
  const user = await requireUser();
  const orderIdNum = parseInt(orderId, 10);

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderIdNum), eq(orders.userId, user.id)));

  if (!order) throw new Error("Order not found");
  if (order.status !== "pending") throw new Error("Promo codes can only be applied to pending orders");

  const [promo] = await db
    .select()
    .from(promoCodes)
    .where(
      and(
        eq(promoCodes.code, code.toUpperCase()),
        eq(promoCodes.isActive, true)
      )
    );

  if (!promo) throw new Error("Invalid or inactive promo code");
  if (promo.expiresAt && promo.expiresAt < new Date()) throw new Error("Promo code has expired");
  if (promo.usageLimit !== null && promo.totalUsed >= promo.usageLimit) {
    throw new Error("Promo code usage limit reached");
  }

  const subtotal = parseFloat(order.subtotal);
  if (promo.minOrderValue !== null && subtotal < parseFloat(promo.minOrderValue)) {
    throw new Error(`Minimum order value of $${promo.minOrderValue} required`);
  }

  let discount: number;
  if (promo.discountType === "percentage") {
    discount = subtotal * (parseFloat(promo.discountValue) / 100);
  } else {
    discount = Math.min(parseFloat(promo.discountValue), subtotal);
  }

  const newDiscountAmount = parseFloat(order.discountAmount) + discount;
  const newTotal = Math.max(
    0,
    subtotal + parseFloat(order.taxAmount) + parseFloat(order.tipAmount) - newDiscountAmount
  );

  await db
    .update(orders)
    .set({
      promoCodeId: promo.id,
      discountAmount: newDiscountAmount.toFixed(2),
      total: newTotal.toFixed(2),
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderIdNum));

  // Update Stripe PaymentIntent amount
  if (order.stripePaymentIntentId) {
    await stripe.paymentIntents.update(order.stripePaymentIntentId, {
      amount: Math.round(newTotal * 100),
    });
  }

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/checkout");

  return { discount: Math.round(discount * 100) / 100 };
}

// ─── scheduleDelivery ─────────────────────────────────────────────────────────

export async function scheduleDelivery(
  orderId: string,
  deliverySlotId: number
): Promise<void> {
  const user = await requireUser();
  const orderIdNum = parseInt(orderId, 10);

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderIdNum), eq(orders.userId, user.id)));

  if (!order) throw new Error("Order not found");
  if (!["pending", "confirmed"].includes(order.status)) {
    throw new Error("Cannot schedule delivery for this order status");
  }

  const [slot] = await db
    .select()
    .from(deliverySlots)
    .where(and(eq(deliverySlots.id, deliverySlotId), eq(deliverySlots.isActive, true)));

  if (!slot) throw new Error("Delivery slot not found or inactive");
  if (slot.bookedCount >= slot.maxOrders) throw new Error("This delivery slot is fully booked");

  // Release previously booked slot if any
  if (order.deliverySlotId && order.deliverySlotId !== deliverySlotId) {
    const [prevSlot] = await db
      .select({ bookedCount: deliverySlots.bookedCount })
      .from(deliverySlots)
      .where(eq(deliverySlots.id, order.deliverySlotId));

    if (prevSlot && prevSlot.bookedCount > 0) {
      await db
        .update(deliverySlots)
        .set({ bookedCount: prevSlot.bookedCount - 1 })
        .where(eq(deliverySlots.id, order.deliverySlotId));
    }
  }

  await db
    .update(orders)
    .set({ deliverySlotId, updatedAt: new Date() })
    .where(eq(orders.id, orderIdNum));

  await db
    .update(deliverySlots)
    .set({ bookedCount: slot.bookedCount + 1 })
    .where(eq(deliverySlots.id, deliverySlotId));

  revalidatePath(`/orders/${orderId}`);
}

// ─── getDeliverySlots ─────────────────────────────────────────────────────────

export async function getDeliverySlots(date?: string): Promise<DeliverySlot[]> {
  await requireUser();

  const targetDate = date ?? new Date().toISOString().split("T")[0];

  const slots = await db
    .select()
    .from(deliverySlots)
    .where(
      and(
        eq(deliverySlots.slotDate, targetDate),
        eq(deliverySlots.isActive, true)
      )
    )
    .orderBy(deliverySlots.startTime);

  return slots.map((slot) => ({
    id: slot.id,
    date: slot.slotDate,
    startTime: slot.startTime,
    endTime: slot.endTime,
    available: slot.bookedCount < slot.maxOrders,
    maxOrders: slot.maxOrders,
    currentOrders: slot.bookedCount,
  }));
}
