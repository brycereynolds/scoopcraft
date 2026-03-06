import { NextRequest } from "next/server"
import Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { db } from "@/db"
import { orders, subscriptions } from "@/db/schema"
import { eq } from "drizzle-orm"
import { emitOrderUpdate } from "@/lib/sse"
import { syncSubscriptionToDb } from "@/lib/stripe-helpers"

export const dynamic = "force-dynamic"

/**
 * Stripe webhook handler — idempotent by checking existing state before mutations.
 * Verifies webhook signature before processing any event.
 */
export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  if (!sig) {
    return new Response("Missing stripe-signature header", { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Stripe webhook signature verification failed:", message)
    return new Response(`Webhook Error: ${message}`, { status: 400 })
  }

  console.log(`Processing Stripe webhook: ${event.type} [${event.id}]`)

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent
        const [order] = await db
          .select({ id: orders.id, status: orders.status })
          .from(orders)
          .where(eq(orders.stripePaymentIntentId, pi.id))

        if (order && order.status === "pending") {
          await db
            .update(orders)
            .set({
              status: "confirmed",
              confirmedAt: new Date(),
              stripeChargeId: typeof pi.latest_charge === "string" ? pi.latest_charge : null,
              updatedAt: new Date(),
            })
            .where(eq(orders.id, order.id))

          emitOrderUpdate(order.id, "confirmed")
          // TODO: Send order confirmation email
          // TODO: Emit new order event for admin queue
        }
        break
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent
        console.log(`payment_intent.payment_failed for PI ${pi.id}`)
        const [order] = await db
          .select({ id: orders.id, status: orders.status })
          .from(orders)
          .where(eq(orders.stripePaymentIntentId, pi.id))

        if (order && order.status === "pending") {
          await db
            .update(orders)
            .set({ status: "cancelled", cancelledAt: new Date(), cancellationReason: "Payment failed", updatedAt: new Date() })
            .where(eq(orders.id, order.id))
        }
        break
      }

      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription
        // The subscription row may already exist (created optimistically in createSubscription action).
        // If it does, sync its status; if not, log and skip — the action is the authoritative creator.
        const [existingSub] = await db
          .select({ id: subscriptions.id })
          .from(subscriptions)
          .where(eq(subscriptions.stripeSubscriptionId, sub.id))

        if (existingSub) {
          await syncSubscriptionToDb(sub)
        } else {
          console.log(`customer.subscription.created: no local record for ${sub.id}, skipping`)
        }
        break
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription
        const [existingSub] = await db
          .select({ id: subscriptions.id })
          .from(subscriptions)
          .where(eq(subscriptions.stripeSubscriptionId, sub.id))

        if (existingSub) {
          await syncSubscriptionToDb(sub)
        }
        break
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription
        await db
          .update(subscriptions)
          .set({ status: "cancelled", updatedAt: new Date() })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id))
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription && typeof invoice.subscription === "string") {
          // Mark the subscription active on successful payment
          await db
            .update(subscriptions)
            .set({
              status: "active",
              paymentFailedAt: null,
              paymentRetryCount: 0,
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.stripeSubscriptionId, invoice.subscription))
          console.log(`invoice.payment_succeeded for subscription ${invoice.subscription}`)
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription && typeof invoice.subscription === "string") {
          await db
            .update(subscriptions)
            .set({
              status: "past_due",
              paymentFailedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.stripeSubscriptionId, invoice.subscription))
          // TODO: Send payment failure email + increment retry count
          console.log(`invoice.payment_failed for subscription ${invoice.subscription}`)
        }
        break
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`)
    }
  } catch (err) {
    console.error(`Error processing Stripe webhook ${event.type}:`, err)
    return new Response("Internal Server Error", { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
