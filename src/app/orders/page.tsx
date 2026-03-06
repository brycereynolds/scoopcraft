import Link from 'next/link';
import { Package, ChevronRight, IceCream } from 'lucide-react';
import { getUserOrders } from '@/actions/orders';
import { db } from '@/db';
import { orderItems } from '@/db/schema';
import { sql } from 'drizzle-orm';
import type { OrderStatus } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

const STATUS_BADGE: Record<OrderStatus, { bg: string; color: string; label: string }> = {
  pending: { bg: 'var(--warning-foreground)', color: 'var(--warning)', label: 'Pending' },
  confirmed: { bg: 'var(--info-foreground)', color: 'var(--info)', label: 'Confirmed' },
  preparing: { bg: 'color-mix(in srgb, var(--secondary) 15%, transparent)', color: 'var(--secondary)', label: 'Preparing' },
  ready: { bg: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent-foreground)', label: 'Ready' },
  out_for_delivery: { bg: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent-foreground)', label: 'Out for Delivery' },
  delivered: { bg: 'var(--success-foreground)', color: 'var(--success)', label: 'Delivered' },
  cancelled: { bg: 'var(--destructive-foreground)', color: 'var(--destructive)', label: 'Cancelled' },
};

export default async function OrdersPage() {
  let userOrders: Awaited<ReturnType<typeof getUserOrders>> = [];

  try {
    userOrders = await getUserOrders();
  } catch {
    // User may not be logged in — handled below
  }

  // Fetch item counts for each order (one query per order for simplicity and correctness)
  const countMap = new Map<number, number>();
  await Promise.all(
    userOrders.map(async (order) => {
      const [row] = await db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(orderItems)
        .where(sql`${orderItems.orderId} = ${order.id}`);
      if (row) countMap.set(order.id, row.count);
    })
  );

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'var(--background)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Your Orders</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>
            {userOrders.length} {userOrders.length === 1 ? 'order' : 'orders'} total
          </p>
        </div>

        {userOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--muted)' }}>
              <Package className="w-10 h-10" style={{ color: 'var(--muted-foreground)' }} />
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>No orders yet</h2>
            <p className="mb-6" style={{ color: 'var(--muted-foreground)' }}>
              Your order history will appear here once you place your first order.
            </p>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {userOrders.slice().reverse().map((order) => {
              const badge = STATUS_BADGE[order.status as OrderStatus];
              const itemCount = countMap.get(order.id) ?? 0;

              return (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between gap-3">
                        {/* Left: icon + details */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: 'var(--muted)' }}
                          >
                            <IceCream className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
                              Order #{order.id}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                              {new Date(order.createdAt).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric',
                              })}
                              {' · '}
                              {itemCount} {itemCount === 1 ? 'item' : 'items'}
                              {' · '}
                              {order.orderType === 'delivery' ? 'Delivery' : 'Pickup'}
                            </p>
                          </div>
                        </div>

                        {/* Right: total + badge + arrow */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="text-right">
                            <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
                              ${parseFloat(order.total).toFixed(2)}
                            </p>
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{ background: badge.bg, color: badge.color }}
                            >
                              {badge.label}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
