import Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { db } from "@/db"
import { subscriptions, subscriptionPlans } from "@/db/schema"
import { eq } from "drizzle-orm"

export interface SubscriptionPlan {
  id: number
  name: string
  description: string | null
  price: string
  stripePriceId: string
  stripeProductId: string
  isActive: boolean
  sortOrder: number
  createdAt: Date
}

export interface Subscription {
  id: number
  userId: number
  planId: number
  stripeSubscriptionId: string
  status: "active" | "paused" | "cancelled" | "past_due"
  currentPeriodStart: Date | null
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
  isGift: boolean
  giftRecipientEmail: string | null
  giftActivatedAt: Date | null
  paymentFailedAt: Date | null
  paymentRetryCount: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Get or create a Stripe product for a subscription plan.
 * Returns the Stripe product ID.
 */
export async function getOrCreateStripeProduct(plan: SubscriptionPlan): Promise<string> {
  if (plan.stripeProductId && plan.stripeProductId.startsWith("prod_")) {
    return plan.stripeProductId
  }

  const product = await stripe.products.create({
    name: plan.name,
    description: plan.description ?? undefined,
    metadata: {
      scoopcraft_plan_id: plan.id.toString(),
    },
  })

  return product.id
}

/**
 * Create a Stripe price for a product.
 * Returns the Stripe price ID.
 */
export async function createStripePrice(
  productId: string,
  amount: number,
  interval: "month" | "year"
): Promise<string> {
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: Math.round(amount * 100), // convert dollars to cents
    currency: "usd",
    recurring: { interval },
  })

  return price.id
}

/**
 * Map a Stripe subscription status to our DB status enum.
 */
function mapStripeStatus(
  stripeStatus: Stripe.Subscription.Status
): "active" | "paused" | "cancelled" | "past_due" {
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return "active"
    case "past_due":
    case "unpaid":
      return "past_due"
    case "paused":
      return "paused"
    case "canceled":
    case "incomplete":
    case "incomplete_expired":
    default:
      return "cancelled"
  }
}

/**
 * Sync a Stripe subscription object to the DB.
 * Finds the DB record by stripeSubscriptionId and updates it.
 */
export async function syncSubscriptionToDb(stripeSubscription: Stripe.Subscription): Promise<void> {
  const status = mapStripeStatus(stripeSubscription.status)

  const currentPeriodStart = stripeSubscription.current_period_start
    ? new Date(stripeSubscription.current_period_start * 1000)
    : null
  const currentPeriodEnd = stripeSubscription.current_period_end
    ? new Date(stripeSubscription.current_period_end * 1000)
    : null

  await db
    .update(subscriptions)
    .set({
      status,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscription.id))
}
