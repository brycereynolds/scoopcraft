import { EventEmitter } from "events"

export interface OrderUpdateEvent {
  orderId: number
  status: string
  updatedAt: Date
}

export interface AdminOrderEvent {
  type: "new_order" | "order_updated"
  orderId: number
  status?: string
}

/**
 * In-process EventEmitter for SSE broadcasting.
 * Single Railway instance — replace with Redis pub/sub if scaling to multiple instances.
 */
class OrderEventEmitter extends EventEmitter {}

export const orderEventEmitter = new OrderEventEmitter()
orderEventEmitter.setMaxListeners(1000) // Support concurrent order subscriptions

/**
 * Emit a status update for a specific order.
 * Called by admin server actions when advancing order status.
 */
export function emitOrderUpdate(orderId: number, status: string): void {
  const event: OrderUpdateEvent = {
    orderId,
    status,
    updatedAt: new Date(),
  }
  orderEventEmitter.emit("orderUpdate", event)
  orderEventEmitter.emit("adminOrderUpdate", { type: "order_updated", orderId, status } satisfies AdminOrderEvent)
}

/**
 * Emit a new order event for the admin order queue.
 * Called when a new order is created (payment confirmed).
 */
export function emitNewOrder(orderId: number): void {
  const event: AdminOrderEvent = { type: "new_order", orderId }
  orderEventEmitter.emit("adminOrderUpdate", event)
}

/**
 * Format a server-sent event payload.
 */
export function formatSSEMessage(data: object, event?: string): string {
  const lines: string[] = []
  if (event) lines.push(`event: ${event}`)
  lines.push(`data: ${JSON.stringify(data)}`)
  lines.push("", "") // Double newline to end message
  return lines.join("\n")
}
