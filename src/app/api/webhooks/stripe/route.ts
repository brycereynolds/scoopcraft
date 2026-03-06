import { NextRequest } from "next/server"
import { stripe } from "@/lib/stripe"
import { db } from "@/db"
import { orders, subscriptions } from "@/db/schema"
import { eq } from "drizzle-orm"
import { emitOrderUpdate } from "@/lib/sse"

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

  let event: ReturnType<typeof stripe.webhooks.constructEvent> extends Promise<infer T> ? T : never

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    ) as any
  } catch (err: any) {
    console.error("Stripe webhook signature verification failed:", err.message)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  console.log(`Processing Stripe webhook: ${event.type} [${event.id}]`)

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as any
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
              stripeChargeId: pi.latest_charge,
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
        const pi = event.data.object as any
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

      case "customer.subscription.updated": {
        const sub = event.data.object as any
        const [existingSub] = await db
          .select({ id: subscriptions.id })
          .from(subscriptions)
          .where(eq(subscriptions.stripeSubscriptionId, sub.id))

        if (existingSub) {
          await db
            .update(subscriptions)
            .set({
              status: sub.status === "active" ? "active"
                : sub.status === "past_due" ? "past_due"
                : sub.status === "paused" ? "paused"
                : "cancelled",
              currentPeriodStart: new Date(sub.current_period_start * 1000),
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
              cancelAtPeriodEnd: sub.cancel_at_period_end,
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.id, existingSub.id))
        }
        break
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as any
        await db
          .update(subscriptions)
          .set({ status: "cancelled", updatedAt: new Date() })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id))
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any
        if (invoice.subscription) {
          await db
            .update(subscriptions)
            .set({
              status: "past_due",
              paymentFailedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.stripeSubscriptionId, invoice.subscription))
          // TODO: Send payment failure email + increment retry count
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
