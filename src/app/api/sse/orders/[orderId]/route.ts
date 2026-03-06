import { auth } from "@/lib/auth"
import { db } from "@/db"
import { orders } from "@/db/schema"
import { eq } from "drizzle-orm"
import { orderEventEmitter, formatSSEMessage, type OrderUpdateEvent } from "@/lib/sse"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await auth()
  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { orderId: orderIdParam } = await params
  const orderId = parseInt(orderIdParam)
  if (isNaN(orderId)) {
    return new Response("Invalid order ID", { status: 400 })
  }

  // Verify the customer owns this order (or is admin)
  const [order] = await db
    .select({ id: orders.id, userId: orders.userId, status: orders.status, updatedAt: orders.updatedAt })
    .from(orders)
    .where(eq(orders.id, orderId))

  if (!order) {
    return new Response("Order not found", { status: 404 })
  }

  const isAdmin = session.user.role === "admin"
  const isOwner = order.userId === parseInt(session.user.id)

  if (!isAdmin && !isOwner) {
    return new Response("Forbidden", { status: 403 })
  }

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      const enqueue = (data: object, event?: string) => {
        try {
          controller.enqueue(encoder.encode(formatSSEMessage(data, event)))
        } catch {
          // Controller may be closed
        }
      }

      // Send current status immediately
      enqueue({ status: order.status, updatedAt: order.updatedAt }, "status")

      // Send keep-alive comment every 30s
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keep-alive\n\n"))
        } catch {
          clearInterval(keepAlive)
        }
      }, 30_000)

      // Subscribe to order updates
      const handler = (event: OrderUpdateEvent) => {
        if (event.orderId === orderId) {
          enqueue({ status: event.status, updatedAt: event.updatedAt }, "status")
        }
      }
      orderEventEmitter.on("orderUpdate", handler)

      // Cleanup on client disconnect
      req.signal.addEventListener("abort", () => {
        clearInterval(keepAlive)
        orderEventEmitter.off("orderUpdate", handler)
        try {
          controller.close()
        } catch {
          // Already closed
        }
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable Nginx buffering on Railway
    },
  })
}
