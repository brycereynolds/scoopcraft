"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { loadStripe, type Stripe, type StripeElements } from "@stripe/stripe-js";
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
  createSubscription,
  cancelSubscription,
  pauseSubscription,
  resumeSubscription,
  createCustomerPortalSession,
  type SubscriptionPlan,
  type Subscription,
} from "@/actions/subscriptions";
import { Loader2, ExternalLink, Lock, ShieldCheck } from "lucide-react";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

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
}

function PlanCard({ plan, featured }: PlanCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isConfirming, startConfirming] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeInstance, setStripeInstance] = useState<Stripe | null>(null);
  const [elements, setElements] = useState<StripeElements | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const paymentElementRef = useRef<HTMLDivElement>(null);
  const features = getPlanFeatures(plan.name);

  // Step 1: Call server action to create subscription and get clientSecret
  function handleSubscribe() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await createSubscription(plan.id.toString());
        setClientSecret(result.clientSecret);
        setShowPaymentForm(true);

        const stripe = await stripePromise;
        if (!stripe) {
          setError("Payment system not configured. Please ensure NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is set.");
          return;
        }
        setStripeInstance(stripe);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create subscription");
      }
    });
  }

  // Step 2: Mount the Stripe PaymentElement once we have stripe + clientSecret + DOM ref
  useEffect(() => {
    if (!stripeInstance || !clientSecret || !paymentElementRef.current) return;

    const els = stripeInstance.elements({
      clientSecret,
      appearance: {
        theme: "stripe",
        variables: {
          colorPrimary: "#D4536A",
          colorBackground: "#FFFFFF",
          colorText: "#2D2420",
          colorDanger: "#C9413A",
          fontFamily: "DM Sans, Inter, system-ui, sans-serif",
          borderRadius: "12px",
        },
      },
    });

    const paymentElement = els.create("payment");
    paymentElement.mount(paymentElementRef.current);
    setElements(els);

    return () => {
      paymentElement.unmount();
    };
  }, [stripeInstance, clientSecret]);

  // Step 3: Confirm the PaymentIntent with Stripe.js
  function handleConfirmPayment() {
    setError(null);

    if (!stripeInstance || !elements || !clientSecret) {
      setError("Payment not ready. Please wait and try again.");
      return;
    }

    startConfirming(async () => {
      const { error: stripeError } = await stripeInstance.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/account/subscription?success=true`,
        },
      });

      // confirmPayment only returns here if there's an error (success = Stripe redirects)
      if (stripeError) {
        setError(stripeError.message ?? "Payment failed. Please try again.");
      }
    });
  }

  function handleCancelPayment() {
    setShowPaymentForm(false);
    setClientSecret(null);
    setStripeInstance(null);
    setElements(null);
    setError(null);
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

      {/* Stripe PaymentElement — shown after server creates subscription */}
      {showPaymentForm && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--foreground)" }}>
            <Lock className="w-4 h-4" style={{ color: "var(--primary)" }} />
            Enter payment details
          </div>

          {/* PaymentElement mount point */}
          <div ref={paymentElementRef} className="min-h-[160px]">
            {!elements && (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--primary)" }} />
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs" style={{ color: "var(--foreground-muted)" }}>
            <ShieldCheck className="w-3.5 h-3.5" style={{ color: "var(--success)" }} />
            Secured by Stripe — card details are never stored on our servers.
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCancelPayment}
              disabled={isConfirming}
            >
              Back
            </Button>
            <Button
              className="flex-1"
              onClick={handleConfirmPayment}
              disabled={isConfirming || !elements}
              style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              {isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                `Confirm — $${parseFloat(plan.price).toFixed(0)}/mo`
              )}
            </Button>
          </div>
        </div>
      )}

      {!showPaymentForm && (
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
              Preparing checkout...
            </>
          ) : (
            "Subscribe"
          )}
        </Button>
      )}
    </div>
  );
}

interface NoSubscriptionViewProps {
  plans: SubscriptionPlan[];
}

export function NoSubscriptionView({ plans }: NoSubscriptionViewProps) {
  const sorted = [...plans].sort((a, b) => a.sortOrder - b.sortOrder);
  const featured = sorted[sorted.length - 1];
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  return (
    <div className="flex flex-col gap-6">
      {success === "true" && (
        <div
          className="rounded-xl border p-4 text-sm font-medium"
          style={{
            backgroundColor: "var(--success-bg, #f0fdf4)",
            borderColor: "var(--success, #16a34a)",
            color: "var(--success, #16a34a)",
          }}
        >
          Your subscription is active — welcome aboard! Delivery details will arrive by email.
        </div>
      )}

      {canceled === "true" && (
        <div
          className="rounded-xl border p-4 text-sm"
          style={{
            backgroundColor: "var(--warning-bg, #fffbeb)",
            borderColor: "var(--warning, #d97706)",
            color: "var(--warning, #d97706)",
          }}
        >
          Payment was not completed. You can try again anytime.
        </div>
      )}

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
          <PlanCard key={plan.id} plan={plan} featured={plan.id === featured?.id} />
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
