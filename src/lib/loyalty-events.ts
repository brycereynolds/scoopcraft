import { db } from "@/db";
import { users, orders, reviews } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { awardPoints } from "@/actions/loyalty";
import { calculatePointsEarned, calculateTierFromPoints } from "@/lib/loyalty";

// ─────────────────────────────────────────────
// LOYALTY EVENT HOOKS
// ─────────────────────────────────────────────

/**
 * Check if a given month matches the user's birthday month.
 */
function isBirthdayMonth(birthdayMonth: number | null, currentMonth: number): boolean {
  if (birthdayMonth === null) return false;
  return birthdayMonth === currentMonth;
}

/**
 * Called when an order is completed (delivered or confirmed).
 * Awards tier-multiplied points for the order subtotal.
 * Also triggers first-order bonus if applicable.
 */
export async function handleOrderCompleted(
  orderId: number,
  userId: number,
  subtotalCents: number
): Promise<void> {
  // Fetch user's birthday month and loyalty account
  const [user] = await db
    .select({
      birthdayMonth: users.birthdayMonth,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  // Get current tier from loyalty account
  const { loyaltyAccounts } = await import("@/db/schema");
  const [loyaltyAccount] = await db
    .select({ tier: loyaltyAccounts.tier, pointsBalance: loyaltyAccounts.pointsBalance })
    .from(loyaltyAccounts)
    .where(eq(loyaltyAccounts.userId, userId));

  const currentTier = loyaltyAccount
    ? loyaltyAccount.tier
    : "sprinkle";

  const currentMonth = new Date().getMonth() + 1; // 1-12
  const birthday = isBirthdayMonth(user.birthdayMonth, currentMonth);

  const pointsEarned = calculatePointsEarned(subtotalCents, currentTier, birthday);

  // Award order points
  const reason = birthday ? "birthday_bonus" : "order_earned";
  await awardPoints(userId, pointsEarned, reason, orderId);

  // Update the order record with points earned
  await db
    .update(orders)
    .set({
      loyaltyPointsEarned: pointsEarned,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId));

  // Check if this is the user's first order
  const [orderCount] = await db
    .select({ total: count() })
    .from(orders)
    .where(eq(orders.userId, userId));

  if ((orderCount?.total ?? 0) === 1) {
    await handleFirstOrder(userId);
  }
}

/**
 * Called when a user places their first-ever order.
 * Awards the 100-point first-order bonus.
 */
export async function handleFirstOrder(userId: number): Promise<void> {
  await awardPoints(userId, 100, "first_order_bonus");
}

/**
 * Called when a user posts an approved review.
 * Awards 50 points if points haven't already been awarded for the review.
 */
export async function handleReviewPosted(userId: number, reviewId: number): Promise<void> {
  // Check if points were already awarded for this review
  const [review] = await db
    .select({ pointsAwarded: reviews.pointsAwarded })
    .from(reviews)
    .where(eq(reviews.id, reviewId));

  if (!review) {
    throw new Error(`Review ${reviewId} not found`);
  }

  if (review.pointsAwarded) {
    // Points already awarded, skip
    return;
  }

  // Award review bonus points
  await awardPoints(userId, 50, "review_bonus", reviewId);

  // Mark review as points awarded
  await db
    .update(reviews)
    .set({ pointsAwarded: true, updatedAt: new Date() })
    .where(eq(reviews.id, reviewId));
}

/**
 * Called when a referral is completed (referee makes their first order).
 * Awards 200 points to both the referrer and the referee.
 * Note: This is typically called from applyReferralCode in referrals.ts at signup,
 * but can also be triggered at first order if preferred.
 */
export async function handleReferralCompleted(
  referrerId: number,
  refereeId: number
): Promise<void> {
  await awardPoints(referrerId, 200, "referral_reward");
  await awardPoints(refereeId, 200, "referral_reward");
}
