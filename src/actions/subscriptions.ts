"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { users, subscriptions, subscriptionPlans } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { stripe } from "@/lib/stripe"
import {
  getOrCreateStripeProduct,
  createStripePrice,
  type SubscriptionPlan,
  type Subscription,
} from "@/lib/stripe-helpers"

// ─────────────────────────────────────────────
// EXPORTED RESULT TYPES
// ─────────────────────────────────────────────

export type { SubscriptionPlan, Subscription }

export interface CreateSubscriptionResult {
  clientSecret: string
  subscriptionId: string
}

export interface CreateCustomerPortalSessionResult {
  url: string
}

export interface ActionError {
  success: false
  error: string
}

export interface ActionSuccess<T = void> {
  success: true
  data: T
}

export type ActionResult<T = void> = ActionSuccess<T> | ActionError

// ─────────────────────────────────────────────
// INPUT SCHEMAS
// ─────────────────────────────────────────────

const planIdSchema = z.object({
  planId: z.string().min(1, "Plan ID is required"),
})

const subscriptionIdSchema = z.object({
  subscriptionId: z.string().min(1, "Subscription ID is required"),
})

// ─────────────────────────────────────────────
// PRIVATE HELPERS
// ─────────────────────────────────────────────

/**
 * Ensure the user has a Stripe customer record. Returns the Stripe customer ID.
 * Creates one and persists it to the users table if not already set.
 */
async function createOrGetStripeCustomer(userId: string): Promise<string> {
  const [user] = await db
    .select({ id: users.id, email: users.email, stripCustomerId: users.stripCustomerId })
    .from(users)
    .where(eq(users.id, parseInt(userId, 10)))

  if (!user) {
    throw new Error("User not found")
  }

  if (user.stripCustomerId) {
    return user.stripCustomerId
  }

  // Create a new Stripe customer
  const customer = await stripe.customers.create({
    email: user.email,
    metadata: { scoopcraft_user_id: userId },
  })

  // Persist the customer ID to the users table (note: column has a typo in schema: stripCustomerId)
  await db
    .update(users)
    .set({ stripCustomerId: customer.id })
    .where(eq(users.id, user.id))

  return customer.id
}

/**
 * Get the authenticated user's ID, throwing if not signed in.
 */
async function requireAuth(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }
  return session.user.id
}

// ─────────────────────────────────────────────
// PUBLIC SERVER ACTIONS
// ─────────────────────────────────────────────

/**
 * Fetch all active subscription plans from the DB.
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const plans = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.isActive, true))
    .orderBy(subscriptionPlans.sortOrder)

  return plans
}

/**
 * Get the current user's active subscription (if any).
 */
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const parsed = z.string().min(1).safeParse(userId)
  if (!parsed.success) {
    return null
  }

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, parseInt(userId, 10)))
    .orderBy(subscriptions.createdAt)
    .limit(1)

  if (!sub) return null

  return sub as Subscription
}

/**
 * Create a new Stripe subscription for the authenticated user.
 * Returns a client secret (for confirming payment) and the subscription ID.
 */
export async function createSubscription(
  planId: string
): Promise<CreateSubscriptionResult> {
  const userId = await requireAuth()

  const parsed = planIdSchema.safeParse({ planId })
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? "Invalid plan ID")
  }

  // Look up the plan
  const [plan] = await db
    .select()
    .from(subscriptionPlans)
    .where(
      and(
        eq(subscriptionPlans.isActive, true),
        eq(subscriptionPlans.id, parseInt(planId, 10))
      )
    )

  if (!plan) {
    throw new Error("Subscription plan not found or inactive")
  }

  // Resolve or create Stripe price ID (dev-mode fallback)
  let stripePriceId = plan.stripePriceId
  if (!stripePriceId || stripePriceId.includes("placeholder")) {
    const stripeProductId = await getOrCreateStripeProduct(plan)
    stripePriceId = await createStripePrice(stripeProductId, parseFloat(plan.price), "month")

    // Persist the real Stripe IDs back to the plan record
    await db
      .update(subscriptionPlans)
      .set({ stripePriceId, stripeProductId })
      .where(eq(subscriptionPlans.id, plan.id))
  }

  // Ensure user has a Stripe customer
  const stripeCustomerId = await createOrGetStripeCustomer(userId)

  // Create the Stripe subscription with payment_behavior = default_incomplete
  // so we get a payment_intent client_secret to confirm on the client
  const stripeSubscription = await stripe.subscriptions.create({
    customer: stripeCustomerId,
    items: [{ price: stripePriceId }],
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.payment_intent"],
    metadata: {
      scoopcraft_user_id: userId,
      scoopcraft_plan_id: plan.id.toString(),
    },
  })

  // Extract the client secret from the expanded payment intent
  const latestInvoice = stripeSubscription.latest_invoice
  if (
    typeof latestInvoice !== "object" ||
    latestInvoice === null ||
    !("payment_intent" in latestInvoice)
  ) {
    throw new Error("No invoice found on subscription")
  }

  const paymentIntent = latestInvoice.payment_intent
  if (
    typeof paymentIntent !== "object" ||
    paymentIntent === null ||
    !("client_secret" in paymentIntent) ||
    typeof paymentIntent.client_secret !== "string"
  ) {
    throw new Error("No payment intent found on invoice")
  }

  // Save subscription to DB with "incomplete" status — payment has not been confirmed yet.
  // The status will be updated to "active" once the PaymentIntent is confirmed
  // (via Stripe webhook or the client-side confirmPayment success redirect).
  await db.insert(subscriptions).values({
    userId: parseInt(userId, 10),
    planId: plan.id,
    stripeSubscriptionId: stripeSubscription.id,
    status: "incomplete",
    currentPeriodStart: stripeSubscription.current_period_start
      ? new Date(stripeSubscription.current_period_start * 1000)
      : null,
    currentPeriodEnd: stripeSubscription.current_period_end
      ? new Date(stripeSubscription.current_period_end * 1000)
      : null,
    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
  })

  revalidatePath("/account/subscription")

  return {
    clientSecret: paymentIntent.client_secret,
    subscriptionId: stripeSubscription.id,
  }
}

/**
 * Cancel a subscription at the end of the current billing period.
 */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  const userId = await requireAuth()

  const parsed = subscriptionIdSchema.safeParse({ subscriptionId })
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? "Invalid subscription ID")
  }

  // Verify ownership
  const [sub] = await db
    .select({ id: subscriptions.id, stripeSubscriptionId: subscriptions.stripeSubscriptionId })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, parseInt(userId, 10)),
        eq(subscriptions.stripeSubscriptionId, subscriptionId)
      )
    )

  if (!sub) {
    throw new Error("Subscription not found")
  }

  // Cancel at period end in Stripe
  await stripe.subscriptions.update(sub.stripeSubscriptionId, {
    cancel_at_period_end: true,
  })

  // Update DB record
  await db
    .update(subscriptions)
    .set({
      cancelAtPeriodEnd: true,
      status: "cancelled",
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, sub.id))

  revalidatePath("/account/subscription")
}

/**
 * Pause a subscription by setting the subscription's pause_collection behavior.
 */
export async function pauseSubscription(subscriptionId: string): Promise<void> {
  const userId = await requireAuth()

  const parsed = subscriptionIdSchema.safeParse({ subscriptionId })
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? "Invalid subscription ID")
  }

  // Verify ownership
  const [sub] = await db
    .select({ id: subscriptions.id, stripeSubscriptionId: subscriptions.stripeSubscriptionId })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, parseInt(userId, 10)),
        eq(subscriptions.stripeSubscriptionId, subscriptionId)
      )
    )

  if (!sub) {
    throw new Error("Subscription not found")
  }

  // Pause collection in Stripe
  await stripe.subscriptions.update(sub.stripeSubscriptionId, {
    pause_collection: { behavior: "void" },
  })

  // Update DB record
  await db
    .update(subscriptions)
    .set({
      status: "paused",
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, sub.id))

  revalidatePath("/account/subscription")
}

/**
 * Resume a paused subscription by clearing the pause_collection setting.
 */
export async function resumeSubscription(subscriptionId: string): Promise<void> {
  const userId = await requireAuth()

  const parsed = subscriptionIdSchema.safeParse({ subscriptionId })
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? "Invalid subscription ID")
  }

  // Verify ownership
  const [sub] = await db
    .select({ id: subscriptions.id, stripeSubscriptionId: subscriptions.stripeSubscriptionId })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, parseInt(userId, 10)),
        eq(subscriptions.stripeSubscriptionId, subscriptionId)
      )
    )

  if (!sub) {
    throw new Error("Subscription not found")
  }

  // Resume by removing pause_collection
  await stripe.subscriptions.update(sub.stripeSubscriptionId, {
    pause_collection: null,
  })

  // Update DB record
  await db
    .update(subscriptions)
    .set({
      status: "active",
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, sub.id))

  revalidatePath("/account/subscription")
}

/**
 * Create a Stripe Customer Portal session so the user can manage their billing.
 * Redirects to the portal URL.
 */
export async function createCustomerPortalSession(): Promise<CreateCustomerPortalSessionResult> {
  const userId = await requireAuth()

  const stripeCustomerId = await createOrGetStripeCustomer(userId)

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/account/subscription`,
  })

  revalidatePath("/account/subscription")
  redirect(session.url)
}
