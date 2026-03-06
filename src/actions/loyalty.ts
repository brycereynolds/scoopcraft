"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  loyaltyAccounts,
  loyaltyTransactions,
  orders,
} from "@/db/schema";
import type { loyaltyTransactionReasonEnum } from "@/db/schema";
import { eq, desc, sum, and, gt, lt } from "drizzle-orm";
import {
  calculateTierFromPoints,
  calculatePointsToNextTier,
  LOYALTY_TIERS,
  type LoyaltyTier,
} from "@/lib/loyalty";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type LoyaltyTransactionReason =
  (typeof loyaltyTransactionReasonEnum.enumValues)[number];

export type LoyaltyAccount = typeof loyaltyAccounts.$inferSelect;
export type LoyaltyTransaction = typeof loyaltyTransactions.$inferSelect;

export type TierProgress = {
  currentTier: LoyaltyTier;
  currentPoints: number;
  pointsToNextTier: number | null;
  nextTier: LoyaltyTier | null;
  progressPercentage: number; // 0-100
};

export type LoyaltyAccountWithHistory = {
  account: LoyaltyAccount;
  recentTransactions: LoyaltyTransaction[];
  tierProgress: TierProgress;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

async function getCurrentUserId(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return parseInt(session.user.id, 10);
}

async function getOrCreateLoyaltyAccount(userId: number): Promise<LoyaltyAccount> {
  const [existing] = await db
    .select()
    .from(loyaltyAccounts)
    .where(eq(loyaltyAccounts.userId, userId));

  if (existing) return existing;

  const [created] = await db
    .insert(loyaltyAccounts)
    .values({ userId, pointsBalance: 0, tier: "sprinkle" })
    .returning();

  return created;
}

function computeTierProgress(currentPoints: number): TierProgress {
  const currentTier = calculateTierFromPoints(currentPoints);
  const { pointsNeeded, nextTier } = calculatePointsToNextTier(currentPoints);

  let progressPercentage = 100;
  if (nextTier !== null) {
    const tierConfig = LOYALTY_TIERS[currentTier];
    const tierRange = LOYALTY_TIERS[nextTier].min - tierConfig.min;
    const pointsIntoTier = currentPoints - tierConfig.min;
    progressPercentage = Math.min(100, Math.round((pointsIntoTier / tierRange) * 100));
  }

  return {
    currentTier,
    currentPoints,
    pointsToNextTier: nextTier !== null ? pointsNeeded : null,
    nextTier,
    progressPercentage,
  };
}

// ─────────────────────────────────────────────
// INTERNAL: Award Points
// ─────────────────────────────────────────────

/**
 * Internal function to award (or deduct) points for a user.
 * Updates the loyalty account balance and tier if needed.
 */
export async function awardPoints(
  userId: number,
  amount: number,
  reason: LoyaltyTransactionReason,
  orderId?: number
): Promise<void> {
  const account = await getOrCreateLoyaltyAccount(userId);

  const newBalance = account.pointsBalance + amount;
  const newTier = calculateTierFromPoints(Math.max(0, newBalance));

  // Insert transaction
  await db.insert(loyaltyTransactions).values({
    userId,
    pointsDelta: amount,
    reason,
    referenceId: orderId ?? null,
  });

  // Update account balance and tier
  await db
    .update(loyaltyAccounts)
    .set({
      pointsBalance: Math.max(0, newBalance),
      tier: newTier,
      updatedAt: new Date(),
    })
    .where(eq(loyaltyAccounts.userId, userId));
}

// ─────────────────────────────────────────────
// PUBLIC SERVER ACTIONS
// ─────────────────────────────────────────────

/**
 * Get the full loyalty account with transaction history and tier progress.
 */
export async function getLoyaltyAccount(): Promise<LoyaltyAccountWithHistory> {
  const userId = await getCurrentUserId();
  const account = await getOrCreateLoyaltyAccount(userId);

  const recentTransactions = await db
    .select()
    .from(loyaltyTransactions)
    .where(eq(loyaltyTransactions.userId, userId))
    .orderBy(desc(loyaltyTransactions.createdAt))
    .limit(20);

  // Compute totals from transaction history
  const [earnedResult] = await db
    .select({ total: sum(loyaltyTransactions.pointsDelta) })
    .from(loyaltyTransactions)
    .where(
      and(
        eq(loyaltyTransactions.userId, userId),
        gt(loyaltyTransactions.pointsDelta, 0)
      )
    );

  const [redeemedResult] = await db
    .select({ total: sum(loyaltyTransactions.pointsDelta) })
    .from(loyaltyTransactions)
    .where(
      and(
        eq(loyaltyTransactions.userId, userId),
        lt(loyaltyTransactions.pointsDelta, 0)
      )
    );

  const totalPointsEarned = Number(earnedResult?.total ?? 0);
  const totalPointsRedeemed = Math.abs(Number(redeemedResult?.total ?? 0));

  const tierProgress = computeTierProgress(account.pointsBalance);

  return {
    account,
    recentTransactions,
    tierProgress,
    totalPointsEarned,
    totalPointsRedeemed,
  };
}

/**
 * Redeem points against an order. Order must be in 'pending' status.
 * Returns the discount in cents applied.
 */
export async function redeemPoints(
  orderId: number,
  pointsToRedeem: number
): Promise<{ discountCents: number }> {
  const userId = await getCurrentUserId();
  const account = await getOrCreateLoyaltyAccount(userId);

  if (pointsToRedeem <= 0) {
    throw new Error("Points to redeem must be positive");
  }

  if (account.pointsBalance < pointsToRedeem) {
    throw new Error(
      `Insufficient points: have ${account.pointsBalance}, need ${pointsToRedeem}`
    );
  }

  // Fetch the order to validate it belongs to user and is pending
  const [order] = await db
    .select({
      id: orders.id,
      userId: orders.userId,
      status: orders.status,
      subtotal: orders.subtotal,
    })
    .from(orders)
    .where(eq(orders.id, orderId));

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.userId !== userId) {
    throw new Error("Order does not belong to current user");
  }

  if (order.status !== "pending") {
    throw new Error(`Cannot redeem points on an order with status '${order.status}'`);
  }

  const subtotalCents = Math.round(parseFloat(order.subtotal) * 100);
  const maxDiscountCents = Math.floor(subtotalCents * 0.25);
  const rawDiscountCents = Math.floor(pointsToRedeem / 100) * 100;
  const discountCents = Math.min(rawDiscountCents, maxDiscountCents);

  // Deduct points
  await awardPoints(userId, -pointsToRedeem, "redemption", orderId);

  // Update order with redeemed points and discount
  await db
    .update(orders)
    .set({
      loyaltyPointsRedeemed: pointsToRedeem,
      discountAmount: (discountCents / 100).toFixed(2),
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId));

  return { discountCents };
}

/**
 * Get the current user's loyalty points balance.
 */
export async function getPointsBalance(): Promise<number> {
  const userId = await getCurrentUserId();
  const account = await getOrCreateLoyaltyAccount(userId);
  return account.pointsBalance;
}

/**
 * Get recent loyalty transactions for the current user.
 */
export async function getLoyaltyTransactions(
  limit: number = 20
): Promise<LoyaltyTransaction[]> {
  const userId = await getCurrentUserId();

  return db
    .select()
    .from(loyaltyTransactions)
    .where(eq(loyaltyTransactions.userId, userId))
    .orderBy(desc(loyaltyTransactions.createdAt))
    .limit(limit);
}

/**
 * Get tier progress for the current user.
 */
export async function getTierProgress(): Promise<TierProgress> {
  const userId = await getCurrentUserId();
  const account = await getOrCreateLoyaltyAccount(userId);
  return computeTierProgress(account.pointsBalance);
}
