"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createCheckoutSession,
  cancelSubscription,
  pauseSubscription,
  resumeSubscription,
  createCustomerPortalSession,
  type SubscriptionPlan,
  type Subscription,
} from "@/actions/subscriptions";
import { Loader2, ExternalLink } from "lucide-react";

// ─────────────────────────────────────────────
// Plan card for users with no subscription
// ─────────────────────────────────────────────

const PLAN_FEATURES: Record<string, string[]> = {
  Classic: [
    "2 handcrafted pints delivered monthly",
    "Free standard shipping",
    "Early flavor access",
    "Sprinkle tier loyalty points",
  ],
  Deluxe: [
    "4 premium pints + seasonal exclusives",
    "Free priority shipping",
    "Exclusive member-only flavors",
    "Bonus loyalty points every month",
    "Swirl tier loyalty status",
  ],
};

function getPlanFeatures(name: string): string[] {
  for (const key of Object.keys(PLAN_FEATURES)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return PLAN_FEATURES[key];
    }
  }
  return ["Monthly curated ice cream delivery", "Free shipping", "Loyalty rewards"];
}

interface PlanCardProps {
  plan: SubscriptionPlan;
  featured?: boolean;
  /** If true, automatically redirect to Stripe checkout on mount */
  autoCheckout?: boolean;
}

function PlanCard({ plan, featured, autoCheckout }: PlanCardProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const features = getPlanFeatures(plan.name);

  // Auto-initiate checkout if this plan was pre-selected via URL param
  useEffect(() => {
    if (autoCheckout) {
      handleSubscribe();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoCheckout]);

  function handleSubscribe() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await createCheckoutSession(plan.id.toString());
        // Redirect to Stripe's hosted checkout page for secure payment collection
        window.location.href = result.url;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to start checkout. Please try again.");
      }
    });
  }

  return (
    <div
      className="relative flex flex-col rounded-2xl border p-6 gap-5"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: featured ? "var(--primary)" : "var(--border)",
        boxShadow: featured ? "0 0 0 2px var(--primary)" : undefined,
      }}
    >
      {featured && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-semibold"
          style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          Recommended
        </div>
      )}

      <div>
        <h3
          className="text-xl font-semibold"
          style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}
        >
          {plan.name}
        </h3>
        {plan.description && (
          <p className="mt-1 text-sm" style={{ color: "var(--foreground-muted)" }}>
            {plan.description}
          </p>
        )}
      </div>

      <div className="flex items-baseline gap-1">
        <span
          className="text-4xl font-bold"
          style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}
        >
          ${parseFloat(plan.price).toFixed(0)}
        </span>
        <span className="text-sm" style={{ color: "var(--foreground-muted)" }}>
          /month
        </span>
      </div>

      <ul className="flex flex-col gap-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm" style={{ color: "var(--foreground-secondary)" }}>
            <span className="mt-0.5 text-base leading-none" style={{ color: "var(--success)" }}>
              ✓
            </span>
            {feature}
          </li>
        ))}
      </ul>

      {error && (
        <p className="text-sm" style={{ color: "var(--destructive)" }}>
          {error}
        </p>
      )}

      <Button
        onClick={handleSubscribe}
        disabled={isPending}
        className="mt-auto w-full"
        style={
          featured
            ? { backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }
            : {}
        }
        variant={featured ? "default" : "outline"}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Subscribe"
        )}
      </Button>
    </div>
  );
}

interface NoSubscriptionViewProps {
  plans: SubscriptionPlan[];
  preselectedPlanName?: string | null;
}

export function NoSubscriptionView({ plans, preselectedPlanName }: NoSubscriptionViewProps) {
  const sorted = [...plans].sort((a, b) => a.sortOrder - b.sortOrder);
  const featured = sorted[sorted.length - 1];

  // Find a preselected plan if one was specified via URL param
  const preselected = preselectedPlanName
    ? sorted.find((p) =>
        p.name.toLowerCase().includes(preselectedPlanName.toLowerCase()) ||
        preselectedPlanName.toLowerCase().includes(p.name.toLowerCase().split(" ")[0])
      )
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold" style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}>
          Choose a Plan
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--foreground-muted)" }}>
          Get handcrafted ice cream delivered to your door every month.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {sorted.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            featured={preselected ? plan.id === preselected.id : plan.id === featured?.id}
            autoCheckout={preselected?.id === plan.id}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Active subscription management
// ─────────────────────────────────────────────

interface ManagePortalButtonProps {
  label?: string;
}

export function ManagePortalButton({ label = "Manage Billing" }: ManagePortalButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await createCustomerPortalSession();
    });
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={isPending}>
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Opening portal...
        </>
      ) : (
        <>
          <ExternalLink className="mr-2 h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}

interface PauseButtonProps {
  subscriptionId: string;
  isPaused: boolean;
}

export function PauseResumeButton({ subscriptionId, isPaused }: PauseButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      try {
        if (isPaused) {
          await resumeSubscription(subscriptionId);
        } else {
          await pauseSubscription(subscriptionId);
        }
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    });
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        {isPaused ? "Resume Subscription" : "Pause Subscription"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isPaused ? "Resume Subscription" : "Pause Subscription"}</DialogTitle>
            <DialogDescription>
              {isPaused
                ? "Your subscription will resume and you will be billed on your next billing date."
                : "Your subscription will be paused. You will not be billed while paused and deliveries will stop."}
            </DialogDescription>
          </DialogHeader>
          {error && (
            <p className="text-sm" style={{ color: "var(--destructive)" }}>
              {error}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isPaused ? "Resuming..." : "Pausing..."}
                </>
              ) : isPaused ? (
                "Yes, resume"
              ) : (
                "Yes, pause"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface CancelButtonProps {
  subscriptionId: string;
}

export function CancelButton({ subscriptionId }: CancelButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      try {
        await cancelSubscription(subscriptionId);
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    });
  }

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setOpen(true)}
        style={{ color: "var(--destructive)" }}
      >
        Cancel Subscription
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Your subscription will remain active until the end of the current billing period.
              You will not be charged again after that date. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <p className="text-sm" style={{ color: "var(--destructive)" }}>
              {error}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Keep Subscription
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isPending}
              style={{ backgroundColor: "var(--destructive)", color: "var(--destructive-foreground)" }}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Yes, cancel"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
