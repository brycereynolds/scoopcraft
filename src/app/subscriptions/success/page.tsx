import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * Sync subscription from Stripe Checkout Session to the database.
 * This is a fallback for when the webhook hasn't fired yet (or STRIPE_WEBHOOK_SECRET is missing).
 * Idempotent — safe to call multiple times.
 */
async function syncCheckoutSession(sessionId: string): Promise<void> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (session.mode !== "subscription" || session.payment_status !== "paid") {
      return;
    }

    const stripeSub =
      typeof session.subscription === "object" && session.subscription !== null
        ? session.subscription
        : session.subscription
        ? await stripe.subscriptions.retrieve(session.subscription as string)
        : null;

    if (!stripeSub) return;

    const userIdStr = session.metadata?.scoopcraft_user_id;
    const planIdStr = session.metadata?.scoopcraft_plan_id;

    if (!userIdStr || !planIdStr) return;

    // Check if subscription already exists (idempotency)
    const [existing] = await db
      .select({ id: subscriptions.id })
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, stripeSub.id));

    if (existing) {
      // Already recorded — nothing to do
      return;
    }

    await db.insert(subscriptions).values({
      userId: parseInt(userIdStr, 10),
      planId: parseInt(planIdStr, 10),
      stripeSubscriptionId: stripeSub.id,
      status:
        stripeSub.status === "active" || stripeSub.status === "trialing"
          ? "active"
          : "past_due",
      currentPeriodStart: stripeSub.current_period_start
        ? new Date(stripeSub.current_period_start * 1000)
        : null,
      currentPeriodEnd: stripeSub.current_period_end
        ? new Date(stripeSub.current_period_end * 1000)
        : null,
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
    });
  } catch (err) {
    // Non-fatal — webhook will handle it if this fails
    console.error("syncCheckoutSession error:", err);
  }
}

export default async function SubscriptionSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;

  // Sync subscription to DB from Stripe session — fallback for missing/delayed webhooks
  if (sessionId) {
    await syncCheckoutSession(sessionId);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="flex flex-col items-center gap-6 max-w-md">
        <div
          className="flex items-center justify-center w-20 h-20 rounded-full"
          style={{ backgroundColor: "rgba(125,187,162,0.15)" }}
        >
          <CheckCircle className="w-10 h-10" style={{ color: "var(--success)" }} />
        </div>

        <div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}
          >
            Welcome to the Club!
          </h1>
          <p className="text-base leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>
            Your subscription is confirmed. Your first box will ship in the first week of next
            month. You&apos;ll receive an email confirmation shortly.
          </p>
        </div>

        <div
          className="w-full rounded-2xl border p-6 text-left"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
        >
          <h2 className="text-base font-semibold mb-3" style={{ color: "var(--foreground)" }}>
            What happens next?
          </h2>
          <ul className="flex flex-col gap-2.5">
            {[
              "Check your email for a receipt from Stripe",
              "Your first handcrafted box ships in the first week of next month",
              "Track your order and manage your subscription in your account",
              "Earn loyalty points on every delivery — automatically",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm"
                style={{ color: "var(--foreground-secondary)" }}
              >
                <span className="mt-0.5 shrink-0" style={{ color: "var(--success)" }}>
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link href="/account/subscription" className="flex-1">
            <Button
              className="w-full"
              variant="default"
              style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              View My Subscription
            </Button>
          </Link>
          <Link href="/menu" className="flex-1">
            <Button className="w-full" variant="outline">
              Explore the Menu
            </Button>
          </Link>
        </div>

        {sessionId && (
          <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
            Order reference: {sessionId.slice(-8).toUpperCase()}
          </p>
        )}
      </div>
    </div>
  );
}
