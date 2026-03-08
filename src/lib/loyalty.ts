import type { loyaltyTierEnum } from "@/db/schema";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type LoyaltyTier = (typeof loyaltyTierEnum.enumValues)[number];

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

export const LOYALTY_TIERS = {
  sprinkle: { min: 0, max: 499, multiplier: 1.0, label: "Sprinkle" },
  swirl: { min: 500, max: 1999, multiplier: 1.25, label: "Swirl" },
  sundae_supreme: { min: 2000, max: Infinity, multiplier: 1.5, label: "Sundae Supreme" },
} as const satisfies Record<LoyaltyTier, { min: number; max: number; multiplier: number; label: string }>;

export const POINTS_PER_DOLLAR = 1;
export const POINTS_TO_DOLLAR = 100; // 100 points = $1
export const MAX_REDEMPTION_PCT = 0.25; // cap at 25% of order

// ─────────────────────────────────────────────
// PURE CALCULATION FUNCTIONS
// ─────────────────────────────────────────────

/**
 * Calculate points earned for an order.
 * @param subtotalCents - Order subtotal in cents (before tax/fees)
 * @param tier - Current loyalty tier
 * @param isBirthday - Whether the order is during the user's birthday month (2x multiplier)
 */
export function calculatePointsEarned(
  subtotalCents: number,
  tier: LoyaltyTier,
  isBirthday: boolean
): number {
  const dollars = subtotalCents / 100;
  const tierMultiplier = LOYALTY_TIERS[tier].multiplier;
  const birthdayMultiplier = isBirthday ? 2 : 1;
  const rawPoints = dollars * POINTS_PER_DOLLAR * tierMultiplier * birthdayMultiplier;
  return Math.floor(rawPoints);
}

/**
 * Determine the loyalty tier for a given total points balance.
 */
export function calculateTierFromPoints(totalPoints: number): LoyaltyTier {
  if (totalPoints >= LOYALTY_TIERS.sundae_supreme.min) {
    return "sundae_supreme";
  }
  if (totalPoints >= LOYALTY_TIERS.swirl.min) {
    return "swirl";
  }
  return "sprinkle";
}

/**
 * Calculate how many points are needed to reach the next tier.
 * Returns null for nextTier if already at the highest tier.
 */
export function calculatePointsToNextTier(totalPoints: number): {
  pointsNeeded: number;
  nextTier: LoyaltyTier | null;
} {
  if (totalPoints >= LOYALTY_TIERS.sundae_supreme.min) {
    return { pointsNeeded: 0, nextTier: null };
  }
  if (totalPoints >= LOYALTY_TIERS.swirl.min) {
    return {
      pointsNeeded: LOYALTY_TIERS.sundae_supreme.min - totalPoints,
      nextTier: "sundae_supreme",
    };
  }
  return {
    pointsNeeded: LOYALTY_TIERS.swirl.min - totalPoints,
    nextTier: "swirl",
  };
}

/**
 * Calculate the dollar discount (in cents) for a given number of points to redeem.
 * Redemption is capped at 25% of the order subtotal.
 * @param pointsToRedeem - Number of points to redeem
 * @param orderSubtotalCents - Order subtotal in cents
 */
export function calculateRedemptionValue(
  pointsToRedeem: number,
  orderSubtotalCents: number
): number {
  const rawDiscountCents = Math.floor(pointsToRedeem / POINTS_TO_DOLLAR) * 100;
  const maxDiscountCents = Math.floor(orderSubtotalCents * MAX_REDEMPTION_PCT);
  return Math.min(rawDiscountCents, maxDiscountCents);
}

/**
 * Calculate the maximum number of points that can be redeemed for an order,
 * respecting the 25% cap.
 * @param orderSubtotalCents - Order subtotal in cents
 */
export function calculateMaxRedeemablePoints(orderSubtotalCents: number): number {
  const maxDiscountCents = Math.floor(orderSubtotalCents * MAX_REDEMPTION_PCT);
  // Convert cents to points: $1 = 100 points, so N cents = N points (1 cent = 1 point)
  return Math.floor(maxDiscountCents / 100) * POINTS_TO_DOLLAR;
}
