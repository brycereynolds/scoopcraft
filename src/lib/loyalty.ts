/**
 * Loyalty tier configuration for ScoopCraft.
 */

export const LOYALTY_TIERS = {
  sprinkle: {
    label: 'Sprinkle',
    minPoints: 0,
    maxPoints: 499,
    multiplier: 1,
  },
  swirl: {
    label: 'Swirl',
    minPoints: 500,
    maxPoints: 1999,
    multiplier: 1.5,
  },
  sundae_supreme: {
    label: 'Sundae Supreme',
    minPoints: 2000,
    maxPoints: null,
    multiplier: 2,
  },
} as const;

export type LoyaltyTier = keyof typeof LOYALTY_TIERS;

export function getTierForPoints(totalPointsEarned: number): LoyaltyTier {
  if (totalPointsEarned >= LOYALTY_TIERS.sundae_supreme.minPoints) return 'sundae_supreme';
  if (totalPointsEarned >= LOYALTY_TIERS.swirl.minPoints) return 'swirl';
  return 'sprinkle';
}
