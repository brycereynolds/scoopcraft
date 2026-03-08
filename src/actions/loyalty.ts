'use server';

import { auth } from '@/lib/auth';
import { db } from '@/db';
import { loyaltyAccounts, loyaltyTransactions } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getTierForPoints, LOYALTY_TIERS, type LoyaltyTier } from '@/lib/loyalty';
import { redirect } from 'next/navigation';

export interface LoyaltyTransaction {
  id: number;
  pointsDelta: number;
  reason: string;
  createdAt: Date;
}

export interface LoyaltyAccountWithHistory {
  account: {
    id: number;
    userId: number;
    pointsBalance: number;
    tier: LoyaltyTier;
  };
  recentTransactions: LoyaltyTransaction[];
  tierProgress: {
    currentTier: LoyaltyTier;
    nextTier: LoyaltyTier | null;
    pointsToNextTier: number | null;
    progressPercentage: number;
  };
  totalPointsEarned: number;
  totalPointsRedeemed: number;
}

export async function getLoyaltyAccount(): Promise<LoyaltyAccountWithHistory> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const userId = parseInt(session.user.id, 10);

  // Get or create loyalty account
  let [account] = await db
    .select()
    .from(loyaltyAccounts)
    .where(eq(loyaltyAccounts.userId, userId))
    .limit(1);

  if (!account) {
    [account] = await db
      .insert(loyaltyAccounts)
      .values({ userId, pointsBalance: 0, tier: 'sprinkle' })
      .returning();
  }

  // Get recent transactions
  const transactions = await db
    .select()
    .from(loyaltyTransactions)
    .where(eq(loyaltyTransactions.userId, userId))
    .orderBy(desc(loyaltyTransactions.createdAt))
    .limit(20);

  const recentTransactions: LoyaltyTransaction[] = transactions.map((tx) => ({
    id: tx.id,
    pointsDelta: tx.pointsDelta,
    reason: tx.reason as string,
    createdAt: tx.createdAt,
  }));

  // Compute totals from transactions
  const totalPointsEarned = transactions
    .filter((tx) => tx.pointsDelta > 0)
    .reduce((s, tx) => s + tx.pointsDelta, 0);
  const totalPointsRedeemed = Math.abs(
    transactions
      .filter((tx) => tx.pointsDelta < 0)
      .reduce((s, tx) => s + tx.pointsDelta, 0)
  );

  // Compute tier from balance (use pointsBalance as proxy)
  const currentTier = getTierForPoints(account.pointsBalance);
  const tiers = Object.keys(LOYALTY_TIERS) as LoyaltyTier[];
  const currentIndex = tiers.indexOf(currentTier);
  const nextTier: LoyaltyTier | null =
    currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;

  let pointsToNextTier: number | null = null;
  let progressPercentage = 100;

  if (nextTier) {
    const currentMin = LOYALTY_TIERS[currentTier].minPoints;
    const nextMin = LOYALTY_TIERS[nextTier].minPoints;
    const rangeSize = nextMin - currentMin;
    const progressInRange = account.pointsBalance - currentMin;
    pointsToNextTier = Math.max(0, nextMin - account.pointsBalance);
    progressPercentage = Math.min(100, Math.round((progressInRange / rangeSize) * 100));
  }

  return {
    account: {
      id: account.id,
      userId: account.userId,
      pointsBalance: account.pointsBalance,
      tier: currentTier,
    },
    recentTransactions,
    tierProgress: {
      currentTier,
      nextTier,
      pointsToNextTier,
      progressPercentage,
    },
    totalPointsEarned,
    totalPointsRedeemed,
  };
}
