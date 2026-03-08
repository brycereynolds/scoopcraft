"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, referralConversions, loyaltyTransactions } from "@/db/schema";
import { eq, and, count, sum, gt } from "drizzle-orm";
import { nanoid } from "nanoid";
import { awardPoints } from "./loyalty";

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

// ─────────────────────────────────────────────
// SERVER ACTIONS
// ─────────────────────────────────────────────

/**
 * Get the current user's referral code, generating one if it doesn't exist.
 */
export async function generateReferralCode(): Promise<string> {
  const userId = await getCurrentUserId();

  const [user] = await db
    .select({ referralCode: users.referralCode })
    .from(users)
    .where(eq(users.id, userId));

  if (!user) {
    throw new Error("User not found");
  }

  if (user.referralCode) {
    return user.referralCode;
  }

  // Generate a new referral code
  const newCode = nanoid(8).toUpperCase();
  await db
    .update(users)
    .set({ referralCode: newCode, updatedAt: new Date() })
    .where(eq(users.id, userId));

  return newCode;
}

/**
 * Apply a referral code for the current user (referee).
 * Awards 200 points to both the referrer and the referee.
 * Can only be applied once per user.
 */
export async function applyReferralCode(
  code: string
): Promise<{ success: boolean; message: string }> {
  const refereeId = await getCurrentUserId();

  // Check if the referee already has a referral applied
  const [existingConversion] = await db
    .select({ id: referralConversions.id })
    .from(referralConversions)
    .where(eq(referralConversions.refereeUserId, refereeId));

  if (existingConversion) {
    return { success: false, message: "You have already used a referral code" };
  }

  // Check if the referee already has a referredByUserId set
  const [referee] = await db
    .select({ referredByUserId: users.referredByUserId, id: users.id })
    .from(users)
    .where(eq(users.id, refereeId));

  if (!referee) {
    return { success: false, message: "User not found" };
  }

  if (referee.referredByUserId !== null) {
    return { success: false, message: "You have already used a referral code" };
  }

  // Find the referrer by code
  const [referrer] = await db
    .select({ id: users.id, referralCode: users.referralCode })
    .from(users)
    .where(eq(users.referralCode, code.toUpperCase()));

  if (!referrer) {
    return { success: false, message: "Invalid referral code" };
  }

  if (referrer.id === refereeId) {
    return { success: false, message: "You cannot use your own referral code" };
  }

  // Record the referral conversion
  await db.insert(referralConversions).values({
    referrerUserId: referrer.id,
    refereeUserId: refereeId,
    referrerPointsAwarded: 200,
    refereePointsAwarded: 200,
  });

  // Link the referee to the referrer
  await db
    .update(users)
    .set({ referredByUserId: referrer.id, updatedAt: new Date() })
    .where(eq(users.id, refereeId));

  // Award 200 points to both
  await awardPoints(referrer.id, 200, "referral_reward");
  await awardPoints(refereeId, 200, "referral_reward");

  return {
    success: true,
    message: "Referral code applied! You and your friend each earned 200 points.",
  };
}

/**
 * Get referral stats for the current user.
 */
export async function getReferralStats(): Promise<{
  code: string;
  referralCount: number;
  pointsEarned: number;
}> {
  const userId = await getCurrentUserId();

  // Ensure a referral code exists
  const code = await generateReferralCode();

  // Count successful referrals
  const [countResult] = await db
    .select({ total: count() })
    .from(referralConversions)
    .where(eq(referralConversions.referrerUserId, userId));

  const referralCount = countResult?.total ?? 0;

  // Sum referral_reward points earned
  const [pointsResult] = await db
    .select({ total: sum(loyaltyTransactions.pointsDelta) })
    .from(loyaltyTransactions)
    .where(
      and(
        eq(loyaltyTransactions.userId, userId),
        eq(loyaltyTransactions.reason, "referral_reward"),
        gt(loyaltyTransactions.pointsDelta, 0)
      )
    );

  const pointsEarned = Number(pointsResult?.total ?? 0);

  return { code, referralCount, pointsEarned };
}
