'use server';

import { auth } from '@/lib/auth';
import { db } from '@/db';
import {
  orders,
  orderItems,
  menuItems,
  users,
  orderStatusLog,
  subscriptions,
  deliverySlots,
} from '@/db/schema';
import { eq, desc, count, sum, and, gte, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { OrderStatus } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AdminOrderItem = {
  id: number;
  menuItemId: number | null;
  itemNameSnapshot: string;
  quantity: number;
  unitPrice: string;
  linePrice: string;
};

export type AdminOrder = {
  id: number;
  status: OrderStatus;
  orderType: 'delivery' | 'pickup';
  subtotal: string;
  discountAmount: string;
  tipAmount: string;
  taxAmount: string;
  total: string;
  createdAt: Date;
  updatedAt: Date;
  confirmedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  stripePaymentIntentId: string | null;
  customerName: string;
  customerEmail: string;
  items: AdminOrderItem[];
  deliverySlot: {
    slotDate: string;
    startTime: string;
    endTime: string;
  } | null;
};

export type DashboardStats = {
  totalOrdersToday: number;
  revenueToday: number;
  activeSubscribersCount: number;
  pendingOrdersCount: number;
};

// ─── requireAdmin ─────────────────────────────────────────────────────────────

async function requireAdmin(): Promise<{ id: number; role: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized: must be logged in');
  }
  if (session.user.role !== 'admin') {
    throw new Error('Forbidden: admin only');
  }
  return { id: parseInt(session.user.id, 10), role: session.user.role };
}

// ─── helpers ──────────────────────────────────────────────────────────────────

async function enrichOrdersWithDetails(
  rawOrders: (typeof orders.$inferSelect)[]
): Promise<AdminOrder[]> {
  if (rawOrders.length === 0) return [];

  const orderIds = rawOrders.map((o) => o.id);
  const userIds = rawOrders
    .map((o) => o.userId)
    .filter((id): id is number => id !== null);
  const slotIds = rawOrders
    .map((o) => o.deliverySlotId)
    .filter((id): id is number => id !== null);

  // Fetch items, users, and slots in parallel
  const [allItems, allUsers, allSlots] = await Promise.all([
    db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        menuItemId: orderItems.menuItemId,
        itemNameSnapshot: orderItems.itemNameSnapshot,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        linePrice: orderItems.linePrice,
      })
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderIds)),

    userIds.length > 0
      ? db
          .select({
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
          })
          .from(users)
          .where(inArray(users.id, userIds))
      : Promise.resolve([]),

    slotIds.length > 0
      ? db
          .select({
            id: deliverySlots.id,
            slotDate: deliverySlots.slotDate,
            startTime: deliverySlots.startTime,
            endTime: deliverySlots.endTime,
          })
          .from(deliverySlots)
          .where(inArray(deliverySlots.id, slotIds))
      : Promise.resolve([]),
  ]);

  const itemsByOrder = new Map<number, AdminOrderItem[]>();
  for (const item of allItems) {
    const list = itemsByOrder.get(item.orderId) ?? [];
    list.push({
      id: item.id,
      menuItemId: item.menuItemId,
      itemNameSnapshot: item.itemNameSnapshot,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      linePrice: item.linePrice,
    });
    itemsByOrder.set(item.orderId, list);
  }

  const usersById = new Map(allUsers.map((u) => [u.id, u]));
  const slotsById = new Map(allSlots.map((s) => [s.id, s]));

  return rawOrders.map((order) => {
    const user = order.userId ? usersById.get(order.userId) : undefined;
    const slot = order.deliverySlotId
      ? slotsById.get(order.deliverySlotId)
      : undefined;

    const customerName = user
      ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
      : 'Guest';
    const customerEmail = user?.email ?? '';

    return {
      id: order.id,
      status: order.status as OrderStatus,
      orderType: order.orderType,
      subtotal: order.subtotal,
      discountAmount: order.discountAmount,
      tipAmount: order.tipAmount,
      taxAmount: order.taxAmount,
      total: order.total,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      confirmedAt: order.confirmedAt,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
      stripePaymentIntentId: order.stripePaymentIntentId,
      customerName,
      customerEmail,
      items: itemsByOrder.get(order.id) ?? [],
      deliverySlot: slot
        ? {
            slotDate: slot.slotDate,
            startTime: slot.startTime,
            endTime: slot.endTime,
          }
        : null,
    };
  });
}

// ─── getAdminOrderQueue ───────────────────────────────────────────────────────

export async function getAdminOrderQueue(): Promise<AdminOrder[]> {
  await requireAdmin();

  const queueStatuses = ['pending', 'confirmed', 'preparing'] as const;

  const rawOrders = await db
    .select()
    .from(orders)
    .where(inArray(orders.status, [...queueStatuses]))
    .orderBy(orders.createdAt);

  return enrichOrdersWithDetails(rawOrders);
}

// ─── getAllOrders ─────────────────────────────────────────────────────────────

export async function getAllOrders(filters?: {
  status?: string;
  date?: string;
}): Promise<AdminOrder[]> {
  await requireAdmin();

  const conditions = [];

  if (filters?.status && filters.status !== 'all') {
    conditions.push(
      eq(orders.status, filters.status as OrderStatus)
    );
  }

  if (filters?.date) {
    const start = new Date(filters.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(filters.date);
    end.setHours(23, 59, 59, 999);
    conditions.push(gte(orders.createdAt, start));
  }

  const rawOrders = await db
    .select()
    .from(orders)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(orders.createdAt));

  return enrichOrdersWithDetails(rawOrders);
}

// ─── getDashboardStats ────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  await requireAdmin();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [ordersToday, revenueResult, activeSubsResult, pendingResult] =
    await Promise.all([
      db
        .select({ count: count() })
        .from(orders)
        .where(gte(orders.createdAt, todayStart)),

      db
        .select({ total: sum(orders.total) })
        .from(orders)
        .where(
          and(
            gte(orders.createdAt, todayStart),
            inArray(orders.status, [
              'confirmed',
              'preparing',
              'ready',
              'out_for_delivery',
              'delivered',
            ])
          )
        ),

      db
        .select({ count: count() })
        .from(subscriptions)
        .where(eq(subscriptions.status, 'active')),

      db
        .select({ count: count() })
        .from(orders)
        .where(eq(orders.status, 'pending')),
    ]);

  return {
    totalOrdersToday: ordersToday[0]?.count ?? 0,
    revenueToday: parseFloat(revenueResult[0]?.total ?? '0'),
    activeSubscribersCount: activeSubsResult[0]?.count ?? 0,
    pendingOrdersCount: pendingResult[0]?.count ?? 0,
  };
}

// ─── adminUpdateOrderStatus ───────────────────────────────────────────────────

export async function adminUpdateOrderStatus(
  orderId: number,
  status: OrderStatus
): Promise<void> {
  const admin = await requireAdmin();

  const [existing] = await db
    .select({ id: orders.id, status: orders.status })
    .from(orders)
    .where(eq(orders.id, orderId));

  if (!existing) throw new Error('Order not found');

  await db
    .update(orders)
    .set({
      status,
      updatedAt: new Date(),
      ...(status === 'confirmed' ? { confirmedAt: new Date() } : {}),
      ...(status === 'delivered' ? { deliveredAt: new Date() } : {}),
      ...(status === 'cancelled' ? { cancelledAt: new Date() } : {}),
    })
    .where(eq(orders.id, orderId));

  await db.insert(orderStatusLog).values({
    orderId,
    fromStatus: existing.status,
    toStatus: status,
    changedByAdminId: admin.id,
  });

  revalidatePath('/admin/orders/queue');
  revalidatePath('/admin/orders');
  revalidatePath('/admin');
}
