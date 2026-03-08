"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  carts,
  cartItems,
  menuItems,
  scoopLabConfigs,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { CartWithItems, CartItemDetail, CheckoutTotals } from "@/types";

const DELIVERY_FEE = 5.99;
const TAX_RATE = 0.085;

// ─── Private helper ─────────────────────────────────────────────────────────

async function getOrCreateCart(userId: number): Promise<{ id: number; userId: number | null; sessionId: string | null; createdAt: Date; updatedAt: Date }> {
  const [existing] = await db
    .select()
    .from(carts)
    .where(eq(carts.userId, userId));

  if (existing) return existing;

  const [created] = await db
    .insert(carts)
    .values({ userId })
    .returning();

  return created;
}

async function requireUser(): Promise<{ id: number; role: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: must be logged in");
  }
  return { id: parseInt(session.user.id, 10), role: session.user.role };
}

// ─── Public actions ──────────────────────────────────────────────────────────

export async function getCart(): Promise<CartWithItems> {
  const user = await requireUser();
  const cart = await getOrCreateCart(user.id);

  // Fetch cart items with menu item details
  const rows = await db
    .select({
      cartItemId: cartItems.id,
      cartItemQuantity: cartItems.quantity,
      cartItemUnitPrice: cartItems.unitPrice,
      cartItemCreatedAt: cartItems.createdAt,
      menuItemId: menuItems.id,
      menuItemName: menuItems.name,
      menuItemPrice: menuItems.price,
      menuItemCategory: menuItems.category,
      menuItemPhotoUrl: menuItems.photoUrl,
      scoopLabConfigId: cartItems.scoopLabConfigId,
    })
    .from(cartItems)
    .leftJoin(menuItems, eq(cartItems.menuItemId, menuItems.id))
    .where(eq(cartItems.cartId, cart.id));

  // Collect any scoopLabConfig IDs to fetch
  const scoopLabIds = rows
    .map((r) => r.scoopLabConfigId)
    .filter((id): id is number => id !== null);

  const scoopConfigs =
    scoopLabIds.length > 0
      ? await db
          .select()
          .from(scoopLabConfigs)
          .where(
            scoopLabIds.length === 1
              ? eq(scoopLabConfigs.id, scoopLabIds[0])
              : eq(scoopLabConfigs.id, scoopLabIds[0]) // handled below via map
          )
      : [];

  // Build a lookup for scoop lab configs
  const scoopConfigMap = new Map(scoopConfigs.map((c) => [c.id, c]));

  // If there are multiple scoop lab IDs, fetch them properly
  let fullScoopConfigMap = scoopConfigMap;
  if (scoopLabIds.length > 1) {
    const allConfigs = await Promise.all(
      scoopLabIds.map((id) =>
        db.select().from(scoopLabConfigs).where(eq(scoopLabConfigs.id, id))
      )
    );
    fullScoopConfigMap = new Map(
      allConfigs.flat().map((c) => [c.id, c])
    );
  }

  const items: CartItemDetail[] = rows
    .filter((r) => r.menuItemId !== null)
    .map((r) => {
      const unitPrice = parseFloat(r.cartItemUnitPrice);
      const scoopConfig = r.scoopLabConfigId
        ? fullScoopConfigMap.get(r.scoopLabConfigId)
        : undefined;

      const scoopLabConfig = scoopConfig
        ? {
            vessel_id: (scoopConfig.configJson as { vessel_id: number }).vessel_id,
            scoops: (scoopConfig.configJson as { scoops: Array<{ flavor_id: number; scoop_number: number }> }).scoops,
            toppings: (scoopConfig.configJson as { toppings: number[] }).toppings,
            sauces: (scoopConfig.configJson as { sauces: number[] }).sauces,
            extras: (scoopConfig.configJson as { extras: number[] }).extras,
            name: scoopConfig.name ?? "",
            scoop_count: (scoopConfig.configJson as { scoop_count: number }).scoop_count,
          }
        : undefined;

      return {
        id: r.cartItemId,
        menuItem: {
          id: r.menuItemId!,
          name: r.menuItemName!,
          price: r.menuItemPrice!,
          category: r.menuItemCategory!,
          photoUrl: r.menuItemPhotoUrl ?? undefined,
        },
        quantity: r.cartItemQuantity,
        scoopLabConfig,
        subtotal: unitPrice * r.cartItemQuantity,
      };
    });

  return {
    id: cart.id,
    userId: user.id,
    items,
    updatedAt: cart.updatedAt,
  };
}

export async function addToCart(
  menuItemId: number,
  quantity: number,
  scoopLabConfigId?: number
): Promise<{ id: number; cartId: number; menuItemId: number | null; scoopLabConfigId: number | null; quantity: number; unitPrice: string; createdAt: Date }> {
  const user = await requireUser();
  const cart = await getOrCreateCart(user.id);

  // Look up the menu item to get the price
  const [item] = await db
    .select({ id: menuItems.id, price: menuItems.price, isAvailable: menuItems.isAvailable, stockCount: menuItems.stockCount, stockTrackingEnabled: menuItems.stockTrackingEnabled })
    .from(menuItems)
    .where(eq(menuItems.id, menuItemId));

  if (!item) throw new Error("Menu item not found");
  if (!item.isAvailable) throw new Error("Item is not currently available");
  if (item.stockTrackingEnabled && item.stockCount !== null && item.stockCount < quantity) {
    throw new Error(`Only ${item.stockCount} item(s) in stock`);
  }

  // Check if item already in cart (without scoop lab config)
  if (!scoopLabConfigId) {
    const [existing] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cart.id),
          eq(cartItems.menuItemId, menuItemId)
        )
      );

    if (existing) {
      const [updated] = await db
        .update(cartItems)
        .set({ quantity: existing.quantity + quantity })
        .where(eq(cartItems.id, existing.id))
        .returning();

      revalidatePath("/cart");
      revalidatePath("/checkout");
      return updated;
    }
  }

  const [created] = await db
    .insert(cartItems)
    .values({
      cartId: cart.id,
      menuItemId,
      scoopLabConfigId: scoopLabConfigId ?? null,
      quantity,
      unitPrice: item.price,
    })
    .returning();

  revalidatePath("/cart");
  revalidatePath("/checkout");
  return created;
}

export async function updateCartItem(
  cartItemId: number,
  quantity: number
): Promise<{ id: number; cartId: number; menuItemId: number | null; scoopLabConfigId: number | null; quantity: number; unitPrice: string; createdAt: Date }> {
  const user = await requireUser();
  const cart = await getOrCreateCart(user.id);

  if (quantity <= 0) {
    await removeFromCart(cartItemId);
    // Return a placeholder — item was removed
    throw new Error("Item removed (quantity was 0 or less)");
  }

  // Ensure the cart item belongs to this user's cart
  const [existing] = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.id, cartItemId), eq(cartItems.cartId, cart.id)));

  if (!existing) throw new Error("Cart item not found");

  const [updated] = await db
    .update(cartItems)
    .set({ quantity })
    .where(eq(cartItems.id, cartItemId))
    .returning();

  revalidatePath("/cart");
  revalidatePath("/checkout");
  return updated;
}

export async function removeFromCart(cartItemId: number): Promise<void> {
  const user = await requireUser();
  const cart = await getOrCreateCart(user.id);

  // Ensure the cart item belongs to this user's cart
  const [existing] = await db
    .select({ id: cartItems.id })
    .from(cartItems)
    .where(and(eq(cartItems.id, cartItemId), eq(cartItems.cartId, cart.id)));

  if (!existing) throw new Error("Cart item not found");

  await db.delete(cartItems).where(eq(cartItems.id, cartItemId));

  revalidatePath("/cart");
  revalidatePath("/checkout");
}

export async function clearCart(): Promise<void> {
  const user = await requireUser();
  const cart = await getOrCreateCart(user.id);

  await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));

  revalidatePath("/cart");
  revalidatePath("/checkout");
}

export async function getCartTotals(orderType: "delivery" | "pickup" = "delivery"): Promise<CheckoutTotals> {
  const cartData = await getCart();

  const subtotal = cartData.items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * TAX_RATE;
  const deliveryFee = orderType === "delivery" ? DELIVERY_FEE : 0;
  const discount = 0; // loyalty discount applied at checkout
  const tip = 0;
  const total = subtotal + tax + deliveryFee - discount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount,
    tip,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}
