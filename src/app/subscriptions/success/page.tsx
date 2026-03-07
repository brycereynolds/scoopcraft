import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SubscriptionSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;

  // Optionally verify the session on the server side here
  // For now, we trust Stripe's redirect which only fires on success

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div
        className="flex flex-col items-center gap-6 max-w-md"
      >
        <div
          className="flex items-center justify-center w-20 h-20 rounded-full"
          style={{ backgroundColor: "rgba(125,187,162,0.15)" }}
        >
          <CheckCircle
            className="w-10 h-10"
            style={{ color: "var(--success)" }}
          />
        </div>

        <div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}
          >
            Welcome to the Club!
          </h1>
          <p className="text-base leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>
            Your subscription is confirmed. Your first box will ship in the first week of next month.
            You&apos;ll receive an email confirmation shortly.
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
              <li key={item} className="flex items-start gap-2 text-sm" style={{ color: "var(--foreground-secondary)" }}>
                <span className="mt-0.5 shrink-0" style={{ color: "var(--success)" }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link href="/account/subscription" className="flex-1">
            <Button className="w-full" variant="default"
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
