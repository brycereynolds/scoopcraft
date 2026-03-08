export const dynamic = 'force-dynamic';
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserOrders } from "@/actions/orders";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag } from "lucide-react";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

function statusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    preparing: "Preparing",
    ready: "Ready",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return labels[status] ?? status;
}

function statusColor(status: OrderStatus): { bg: string; color: string } {
  const colors: Record<OrderStatus, { bg: string; color: string }> = {
    pending: { bg: "rgba(234, 179, 8, 0.15)", color: "#a16207" },
    confirmed: { bg: "rgba(59, 130, 246, 0.15)", color: "#1d4ed8" },
    preparing: { bg: "rgba(249, 115, 22, 0.15)", color: "#c2410c" },
    ready: { bg: "rgba(20, 184, 166, 0.15)", color: "#0f766e" },
    out_for_delivery: { bg: "rgba(168, 85, 247, 0.15)", color: "#7e22ce" },
    delivered: { bg: "rgba(34, 197, 94, 0.15)", color: "#15803d" },
    cancelled: { bg: "rgba(239, 68, 68, 0.15)", color: "#b91c1c" },
  };
  return colors[status] ?? { bg: "rgba(156, 163, 175, 0.15)", color: "#374151" };
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  let allOrders: Awaited<ReturnType<typeof getUserOrders>> = [];
  try {
    allOrders = await getUserOrders();
  } catch {
    redirect("/login");
  }

  // Sort newest first
  const orders = [...allOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}
        >
          Order History
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--foreground-muted)" }}>
          {orders.length === 0
            ? "No orders yet."
            : `${orders.length} order${orders.length === 1 ? "" : "s"} placed`}
        </p>
      </div>

      {orders.length === 0 ? (
        /* Empty state */
        <div
          className="rounded-2xl border p-12 flex flex-col items-center text-center gap-4"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(212, 83, 106, 0.12)" }}
          >
            <ShoppingBag size={32} style={{ color: "var(--primary)" }} />
          </div>
          <div>
            <h2
              className="text-xl font-semibold"
              style={{ fontFamily: "'DM Serif Display', serif", color: "var(--foreground)" }}
            >
              No orders yet
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--foreground-muted)" }}>
              When you place your first order, it will appear here.
            </p>
          </div>
          <Link
            href="/menu"
            className="mt-2 inline-flex items-center justify-center rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--primary)" }}
          >
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const status = order.status as OrderStatus;
            const color = statusColor(status);
            const shortId = String(order.id).slice(0, 8);

            return (
              <div
                key={order.id}
                className="rounded-2xl border p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
              >
                {/* Left: order info */}
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="text-sm font-semibold tabular-nums"
                      style={{ color: "var(--foreground)" }}
                    >
                      Order #{shortId}
                    </span>
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={{ backgroundColor: color.bg, color: color.color }}
                    >
                      {statusLabel(status)}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "var(--foreground-muted)" }}
                    >
                      {order.orderType === "delivery" ? "Delivery" : "Pickup"}
                    </span>
                  </div>

                  <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                {/* Right: total + actions */}
                <div className="flex items-center gap-4 shrink-0">
                  <span
                    className="text-lg font-bold tabular-nums"
                    style={{ color: "var(--foreground)" }}
                  >
                    ${parseFloat(order.total).toFixed(2)}
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
                      style={{
                        borderColor: "var(--border)",
                        color: "var(--foreground-secondary)",
                        backgroundColor: "transparent",
                      }}
                    >
                      View Details
                    </Link>
                    <Link
                      href="/menu"
                      className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "var(--primary)" }}
                    >
                      Reorder
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
