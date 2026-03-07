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
  loyaltyAccounts,
} from '@/db/schema';
import { eq, desc, count, sum, and, gte, inArray, ilike, or, sql } from 'drizzle-orm';
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

// ─── Menu Item Types ──────────────────────────────────────────────────────────

export type MenuItemCategory = 'flavor' | 'topping' | 'sauce' | 'vessel' | 'extra';

export type AdminMenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: string;
  category: MenuItemCategory;
  isAvailable: boolean;
  stockCount: number | null;
  stockTrackingEnabled: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

// ─── getMenuItems ─────────────────────────────────────────────────────────────

export async function getMenuItems(category?: string): Promise<AdminMenuItem[]> {
  await requireAdmin();

  const rows = await db
    .select({
      id: menuItems.id,
      name: menuItems.name,
      description: menuItems.description,
      price: menuItems.price,
      category: menuItems.category,
      isAvailable: menuItems.isAvailable,
      stockCount: menuItems.stockCount,
      stockTrackingEnabled: menuItems.stockTrackingEnabled,
      sortOrder: menuItems.sortOrder,
      createdAt: menuItems.createdAt,
      updatedAt: menuItems.updatedAt,
    })
    .from(menuItems)
    .where(
      category && category !== 'all'
        ? eq(menuItems.category, category as MenuItemCategory)
        : undefined
    )
    .orderBy(menuItems.sortOrder, menuItems.name);

  return rows as AdminMenuItem[];
}

// ─── createMenuItem ───────────────────────────────────────────────────────────

export async function createMenuItem(data: {
  name: string;
  description?: string;
  price: string;
  category: MenuItemCategory;
  stockCount?: number | null;
  stockTrackingEnabled?: boolean;
  sortOrder?: number;
}): Promise<void> {
  await requireAdmin();

  await db.insert(menuItems).values({
    name: data.name,
    description: data.description ?? null,
    price: data.price,
    category: data.category,
    stockCount: data.stockCount ?? null,
    stockTrackingEnabled: data.stockTrackingEnabled ?? false,
    sortOrder: data.sortOrder ?? 0,
    isAvailable: true,
  });

  revalidatePath('/admin/menu');
}

// ─── updateMenuItem ───────────────────────────────────────────────────────────

export async function updateMenuItem(
  id: number,
  data: {
    name?: string;
    description?: string | null;
    price?: string;
    category?: MenuItemCategory;
    stockCount?: number | null;
    stockTrackingEnabled?: boolean;
    sortOrder?: number;
  }
): Promise<void> {
  await requireAdmin();

  await db
    .update(menuItems)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(menuItems.id, id));

  revalidatePath('/admin/menu');
}

// ─── deleteMenuItem ───────────────────────────────────────────────────────────

export async function deleteMenuItem(id: number): Promise<void> {
  await requireAdmin();

  await db.delete(menuItems).where(eq(menuItems.id, id));

  revalidatePath('/admin/menu');
}

// ─── toggleMenuItemAvailability ───────────────────────────────────────────────

export async function toggleMenuItemAvailability(id: number): Promise<void> {
  await requireAdmin();

  const [item] = await db
    .select({ isAvailable: menuItems.isAvailable })
    .from(menuItems)
    .where(eq(menuItems.id, id));

  if (!item) throw new Error('Menu item not found');

  await db
    .update(menuItems)
    .set({ isAvailable: !item.isAvailable, updatedAt: new Date() })
    .where(eq(menuItems.id, id));

  revalidatePath('/admin/menu');
}

// ─── Customer Types ───────────────────────────────────────────────────────────

export type AdminCustomer = {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: string;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  orderCount: number;
  totalSpent: string;
  loyaltyTier: string | null;
  loyaltyPoints: number | null;
};

// ─── getCustomers ─────────────────────────────────────────────────────────────

export async function getCustomers(search?: string): Promise<AdminCustomer[]> {
  await requireAdmin();

  const conditions = [eq(users.role, 'customer')];

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(users.email, term),
        ilike(users.firstName, term),
        ilike(users.lastName, term)
      )!
    );
  }

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      phone: users.phone,
      role: users.role,
      emailVerifiedAt: users.emailVerifiedAt,
      createdAt: users.createdAt,
      orderCount: sql<number>`cast(count(distinct ${orders.id}) as int)`,
      totalSpent: sql<string>`coalesce(sum(${orders.total})::text, '0')`,
      loyaltyTier: loyaltyAccounts.tier,
      loyaltyPoints: loyaltyAccounts.pointsBalance,
    })
    .from(users)
    .leftJoin(orders, eq(orders.userId, users.id))
    .leftJoin(loyaltyAccounts, eq(loyaltyAccounts.userId, users.id))
    .where(and(...conditions))
    .groupBy(
      users.id,
      users.email,
      users.firstName,
      users.lastName,
      users.phone,
      users.role,
      users.emailVerifiedAt,
      users.createdAt,
      loyaltyAccounts.tier,
      loyaltyAccounts.pointsBalance
    )
    .orderBy(desc(users.createdAt));

  return rows as AdminCustomer[];
}

// ─── getCustomerStats ─────────────────────────────────────────────────────────

export type CustomerStats = {
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: Date | null;
  loyaltyTier: string | null;
  loyaltyPoints: number | null;
};

export async function getCustomerStats(userId: number): Promise<CustomerStats> {
  await requireAdmin();

  const [orderStats] = await db
    .select({
      totalOrders: count(orders.id),
      totalSpent: sum(orders.total),
      lastOrderAt: sql<Date>`max(${orders.createdAt})`,
    })
    .from(orders)
    .where(eq(orders.userId, userId));

  const [loyalty] = await db
    .select({
      tier: loyaltyAccounts.tier,
      points: loyaltyAccounts.pointsBalance,
    })
    .from(loyaltyAccounts)
    .where(eq(loyaltyAccounts.userId, userId));

  return {
    totalOrders: orderStats?.totalOrders ?? 0,
    totalSpent: parseFloat(orderStats?.totalSpent ?? '0'),
    lastOrderAt: orderStats?.lastOrderAt ?? null,
    loyaltyTier: loyalty?.tier ?? null,
    loyaltyPoints: loyalty?.points ?? null,
  };
}
