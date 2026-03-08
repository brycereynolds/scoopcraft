export const dynamic = 'force-dynamic';
import { getLoyaltyAccount } from "@/actions/loyalty";
import { LOYALTY_TIERS } from "@/lib/loyalty";
import type { LoyaltyAccountWithHistory, LoyaltyTransaction } from "@/actions/loyalty";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import React from "react";
import { Sparkles } from "lucide-react";
import { IMAGES, pexelsUrl } from "@/lib/imagery";

// ─────────────────────────────────────────────
// Tier config
// ─────────────────────────────────────────────

const TIER_DISPLAY = {
  sprinkle: {
    emoji: "🍬",
    icon: (
      <img
        src={pexelsUrl(IMAGES.toppings.sprinkles, "icon")}
        alt="Colorful sprinkles"
        width={64}
        height={64}
        className="rounded-full object-cover"
        style={{ backgroundColor: IMAGES.toppings.sprinkles.avgColor }}
      />
    ),
    label: "Sprinkle",
    color: "var(--tier-sprinkle)",
    textColor: "#9d4b61",
    bgColor: "rgba(242, 181, 192, 0.15)",
    borderColor: "var(--tier-sprinkle)",
  },
  swirl: {
    emoji: "🌀",
    icon: <Sparkles style={{ width: 64, height: 64, color: "#6b51a3" }} />,
    label: "Swirl",
    color: "var(--tier-swirl)",
    textColor: "#6b51a3",
    bgColor: "rgba(184, 164, 214, 0.15)",
    borderColor: "var(--tier-swirl)",
  },
  sundae_supreme: {
    emoji: "👑",
    icon: (
      <img
        src={pexelsUrl(IMAGES.hero.sundae, "icon")}
        alt="Sundae Supreme tier"
        width={64}
        height={64}
        className="rounded-full object-cover"
        style={{ backgroundColor: IMAGES.hero.sundae.avgColor }}
      />
    ),
    label: "Sundae Supreme",
    color: "var(--tier-sundae-supreme)",
    textColor: "#8a6e1a",
    bgColor: "rgba(212, 168, 67, 0.15)",
    borderColor: "var(--tier-sundae-supreme)",
  },
} satisfies Record<
  keyof typeof LOYALTY_TIERS,
  {
    emoji: string;
    icon: React.ReactNode;
    label: string;
    color: string;
    textColor: string;
    bgColor: string;
    borderColor: string;
  }
>;

// ─────────────────────────────────────────────
// Transaction row
// ─────────────────────────────────────────────

function reasonLabel(reason: string): string {
  const labels: Record<string, string> = {
    order_purchase: "Order purchase",
    referral_reward: "Referral reward",
    review_bonus: "Review bonus",
    birthday_bonus: "Birthday bonus",
    redemption: "Points redeemed",
    manual_adjustment: "Manual adjustment",
    signup_bonus: "Signup bonus",
  };
  return labels[reason] ?? reason.replace(/_/g, " ");
}

function TransactionRow({ tx }: { tx: LoyaltyTransaction }) {
  const isEarned = tx.pointsDelta > 0;
  const formatted = new Date(tx.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <tr style={{ borderBottom: "1px solid var(--border)" }}>
      <td className="py-3 pr-4 text-sm" style={{ color: "var(--foreground-muted)" }}>
        {formatted}
      </td>
      <td className="py-3 pr-4 text-sm" style={{ color: "var(--foreground-secondary)" }}>
        {reasonLabel(tx.reason)}
      </td>
      <td
        className="py-3 text-right text-sm font-semibold tabular-nums"
        style={{ color: isEarned ? "var(--success)" : "var(--destructive)" }}
      >
        {isEarned ? "+" : ""}
        {tx.pointsDelta} pts
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default async function LoyaltyPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  let data: LoyaltyAccountWithHistory;
  try {
    data = await getLoyaltyAccount();
  } catch {
    redirect("/login");
  }

  const { account, recentTransactions, tierProgress, totalPointsEarned, totalPointsRedeemed } =
    data;

  const tier = tierProgress.currentTier;
  const display = TIER_DISPLAY[tier];
  const multiplier = LOYALTY_TIERS[tier].multiplier;

  const nextTierDisplay = tierProgress.nextTier ? TIER_DISPLAY[tierProgress.nextTier] : null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}
        >
          Loyalty Points
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--foreground-muted)" }}>
          Earn points on every order and unlock exclusive rewards.
        </p>
      </div>

      {/* Tier + Points hero */}
      <div
        className="rounded-2xl border p-6"
        style={{
          backgroundColor: display.bgColor,
          borderColor: display.borderColor,
        }}
      >
        <div className="flex flex-wrap items-center gap-6">
          {/* Tier badge */}
          <div className="flex flex-col items-center text-center">
            <span className="flex h-16 w-16 items-center justify-center leading-none">{display.icon}</span>
            <span
              className="mt-2 text-lg font-bold"
              style={{ color: display.textColor, fontFamily: "'DM Serif Display', serif" }}
            >
              {display.label}
            </span>
            <span className="text-xs mt-0.5" style={{ color: "var(--foreground-muted)" }}>
              Current Tier
            </span>
          </div>

          <div className="h-16 w-px hidden sm:block" style={{ backgroundColor: display.borderColor }} />

          {/* Points balance */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
              Points Balance
            </p>
            <p
              className="text-5xl font-bold tabular-nums"
              style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}
            >
              {account.pointsBalance.toLocaleString()}
            </p>
          </div>

          <div className="h-16 w-px hidden sm:block" style={{ backgroundColor: display.borderColor }} />

          {/* Multiplier */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
              Earning Rate
            </p>
            <p
              className="text-3xl font-bold"
              style={{ fontFamily: "'DM Serif Display', serif", color: display.textColor }}
            >
              {multiplier}x
            </p>
            <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
              points per $1
            </p>
          </div>
        </div>

        {/* Tier progress */}
        {nextTierDisplay && tierProgress.pointsToNextTier !== null && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: "var(--foreground-secondary)" }}>
                Progress to {nextTierDisplay.emoji} {nextTierDisplay.label}
              </span>
              <span className="text-sm font-medium tabular-nums" style={{ color: "var(--foreground-secondary)" }}>
                {tierProgress.pointsToNextTier.toLocaleString()} pts needed
              </span>
            </div>
            <Progress value={tierProgress.progressPercentage} className="h-3" />
            <p className="text-xs mt-1" style={{ color: "var(--foreground-muted)" }}>
              {tierProgress.progressPercentage}% of the way there
            </p>
          </div>
        )}

        {!nextTierDisplay && (
          <div className="mt-4">
            <Badge style={{ backgroundColor: display.color, color: "white" }}>
              You have reached the highest tier!
            </Badge>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: "Total Earned", value: totalPointsEarned.toLocaleString() + " pts" },
          { label: "Total Redeemed", value: totalPointsRedeemed.toLocaleString() + " pts" },
          {
            label: "Current Value",
            value: "$" + (Math.floor(account.pointsBalance / 100)).toFixed(2),
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border p-4"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
          >
            <p className="text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>
              {stat.label}
            </p>
            <p
              className="mt-1 text-xl font-bold tabular-nums"
              style={{ color: "var(--foreground)" }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent transactions */}
      <div
        className="rounded-2xl border p-6"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
      >
        <h2
          className="text-xl font-semibold mb-4"
          style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}
        >
          Recent Transactions
        </h2>

        {recentTransactions.length === 0 ? (
          <p className="text-sm py-4 text-center" style={{ color: "var(--foreground-muted)" }}>
            No transactions yet. Start earning by placing an order!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)" }}>
                  <th
                    className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    Date
                  </th>
                  <th
                    className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    Description
                  </th>
                  <th
                    className="pb-3 text-right text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    Points
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* How to earn more */}
      <div
        className="rounded-2xl border p-6"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
      >
        <h2
          className="text-xl font-semibold mb-4"
          style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}
        >
          How to Earn More Points
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { action: "Place an order", detail: "1 pt per $1 spent", bonus: "" },
            { action: "Leave a review", detail: "+50 pts per review", bonus: "Bonus" },
            { action: "Refer a friend", detail: "+200 pts each", bonus: "Big bonus" },
            { action: "Birthday month", detail: "2x points all month", bonus: "2x" },
          ].map((item) => (
            <div
              key={item.action}
              className="flex items-center justify-between rounded-xl border px-4 py-3"
              style={{ borderColor: "var(--border)" }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                  {item.action}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--foreground-muted)" }}>
                  {item.detail}
                </p>
              </div>
              {item.bonus && (
                <Badge
                  variant="outline"
                  style={{ color: "var(--secondary)", borderColor: "var(--secondary)" }}
                >
                  {item.bonus}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Redeem points info */}
      <div
        className="rounded-2xl border p-6"
        style={{
          backgroundColor: "rgba(125, 187, 162, 0.08)",
          borderColor: "var(--accent)",
        }}
      >
        <h2
          className="text-xl font-semibold mb-2"
          style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}
        >
          Redeem Points
        </h2>
        <p className="text-sm mb-3" style={{ color: "var(--foreground-secondary)" }}>
          Use your points at checkout to get a discount on your order.
        </p>
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
              Redemption Rate
            </p>
            <p className="text-2xl font-bold mt-1" style={{ color: "var(--accent-foreground)" }}>
              100 pts = $1
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
              Max Discount
            </p>
            <p className="text-2xl font-bold mt-1" style={{ color: "var(--accent-foreground)" }}>
              25% per order
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
              Your balance worth
            </p>
            <p className="text-2xl font-bold mt-1" style={{ color: "var(--accent-foreground)" }}>
              ${(Math.floor(account.pointsBalance / 100)).toFixed(2)}
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs" style={{ color: "var(--foreground-muted)" }}>
          Points can be applied at checkout. Capped at 25% of your order subtotal.
        </p>
      </div>
    </div>
  );
}
