import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserSubscription, getSubscriptionPlans } from "@/actions/subscriptions";
import { Badge } from "@/components/ui/badge";
import {
  NoSubscriptionView,
  ManagePortalButton,
  PauseResumeButton,
  CancelButton,
} from "./subscription-client";

function statusLabel(status: string): string {
  switch (status) {
    case "active":
      return "Active";
    case "paused":
      return "Paused";
    case "cancelled":
      return "Cancelled";
    case "past_due":
      return "Past Due";
    default:
      return status;
  }
}

function statusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "active":
      return "default";
    case "paused":
      return "secondary";
    case "cancelled":
    case "past_due":
      return "destructive";
    default:
      return "outline";
  }
}

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

export default async function SubscriptionPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [subscription, plans] = await Promise.all([
    getUserSubscription(session.user.id),
    getSubscriptionPlans(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}
        >
          Subscription
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--foreground-muted)" }}>
          Manage your monthly ice cream delivery subscription.
        </p>
      </div>

      {!subscription ? (
        <NoSubscriptionView plans={plans} />
      ) : (
        <div className="flex flex-col gap-6">
          {/* Current plan card */}
          <div
            className="rounded-2xl border p-6"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2
                    className="text-2xl font-semibold"
                    style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}
                  >
                    {plans.find((p) => p.id === subscription.planId)?.name ?? "Subscription"}
                  </h2>
                  <Badge variant={statusVariant(subscription.status)}>
                    {statusLabel(subscription.status)}
                  </Badge>
                  {subscription.cancelAtPeriodEnd && (
                    <Badge variant="outline" style={{ color: "var(--warning)" }}>
                      Cancels at period end
                    </Badge>
                  )}
                </div>

                {subscription.currentPeriodEnd && (
                  <p className="mt-1 text-sm" style={{ color: "var(--foreground-muted)" }}>
                    {subscription.status === "cancelled" || subscription.cancelAtPeriodEnd
                      ? "Access until"
                      : "Next billing date"}
                    :{" "}
                    <span style={{ color: "var(--foreground-secondary)", fontWeight: 500 }}>
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </p>
                )}
              </div>

              <div className="flex items-baseline gap-1">
                <span
                  className="text-3xl font-bold"
                  style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}
                >
                  $
                  {parseFloat(
                    plans.find((p) => p.id === subscription.planId)?.price ?? "0"
                  ).toFixed(0)}
                </span>
                <span className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                  /month
                </span>
              </div>
            </div>

            {/* Plan features */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>
                Your plan includes
              </h3>
              <ul className="grid gap-2 sm:grid-cols-2">
                {getPlanFeatures(
                  plans.find((p) => p.id === subscription.planId)?.name ?? ""
                ).map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm"
                    style={{ color: "var(--foreground-secondary)" }}
                  >
                    <span className="mt-0.5 leading-none" style={{ color: "var(--success)" }}>
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div
            className="rounded-2xl border p-6"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
          >
            <h3 className="text-base font-semibold mb-4" style={{ color: "var(--foreground)" }}>
              Manage Subscription
            </h3>
            <div className="flex flex-wrap gap-3">
              <ManagePortalButton />

              {subscription.status !== "cancelled" && !subscription.cancelAtPeriodEnd && (
                <PauseResumeButton
                  subscriptionId={subscription.stripeSubscriptionId}
                  isPaused={subscription.status === "paused"}
                />
              )}

              {subscription.status !== "cancelled" && !subscription.cancelAtPeriodEnd && (
                <CancelButton subscriptionId={subscription.stripeSubscriptionId} />
              )}
            </div>

            <p className="mt-4 text-xs" style={{ color: "var(--foreground-muted)" }}>
              Billing is managed securely via Stripe. Click "Manage Billing" to update payment methods,
              view invoices, or make other changes.
            </p>
          </div>

          {/* Upgrade options */}
          {plans.filter((p) => p.id !== subscription.planId).length > 0 && (
            <div
              className="rounded-2xl border p-6"
              style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
            >
              <h3 className="text-base font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                Other Plans
              </h3>
              <p className="text-sm mb-4" style={{ color: "var(--foreground-muted)" }}>
                Switch plans through the billing portal.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {plans
                  .filter((p) => p.id !== subscription.planId)
                  .map((plan) => (
                    <div
                      key={plan.id}
                      className="rounded-xl border p-4"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
                          {plan.name}
                        </span>
                        <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
                          ${parseFloat(plan.price).toFixed(0)}/mo
                        </span>
                      </div>
                      {plan.description && (
                        <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                          {plan.description}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
              <div className="mt-4">
                <ManagePortalButton label="Switch Plan via Billing Portal" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
