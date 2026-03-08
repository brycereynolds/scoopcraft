export const dynamic = 'force-dynamic';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { IceCream, ArrowLeft } from 'lucide-react';
import { getOrder } from '@/actions/orders';
import { db } from '@/db';
import { orderItems, menuItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { OrderStatus } from '@/types';
import { OrderTracker } from './order-tracker';
import { CancelOrderButton } from './cancel-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OrderPageProps {
  params: Promise<{ orderId: string }>;
}

const STATUS_BADGE_STYLES: Record<OrderStatus, { bg: string; color: string; label: string }> = {
  pending: { bg: 'var(--warning-foreground)', color: 'var(--warning)', label: 'Pending' },
  confirmed: { bg: 'var(--info-foreground)', color: 'var(--info)', label: 'Confirmed' },
  preparing: { bg: 'color-mix(in srgb, var(--secondary) 15%, transparent)', color: 'var(--secondary)', label: 'Preparing' },
  ready: { bg: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent-foreground)', label: 'Ready' },
  out_for_delivery: { bg: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent-foreground)', label: 'Out for Delivery' },
  delivered: { bg: 'var(--success-foreground)', color: 'var(--success)', label: 'Delivered' },
  cancelled: { bg: 'var(--destructive-foreground)', color: 'var(--destructive)', label: 'Cancelled' },
};

export default async function OrderPage({ params }: OrderPageProps) {
  const { orderId } = await params;

  const order = await getOrder(orderId);
  if (!order) notFound();

  // Fetch order items
  const items = await db
    .select({
      id: orderItems.id,
      quantity: orderItems.quantity,
      linePrice: orderItems.linePrice,
      itemNameSnapshot: orderItems.itemNameSnapshot,
      menuItemPhotoUrl: menuItems.photoUrl,
    })
    .from(orderItems)
    .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
    .where(eq(orderItems.orderId, order.id));

  const now = new Date();
  const withinCancelWindow = order.editWindowExpiresAt
    ? order.editWindowExpiresAt > now
    : false;
  const canCancel = ['pending', 'confirmed'].includes(order.status) && withinCancelWindow;

  const badgeStyle = STATUS_BADGE_STYLES[order.status as OrderStatus];
  const estimatedMinutes = order.orderType === 'delivery' ? '30–45 min' : '15–20 min';

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'var(--background)' }}>
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        {/* Back link */}
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-sm font-medium"
          style={{ color: 'var(--primary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          All Orders
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              Order #{orderId}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
              Placed {new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
          <span
            className="px-3 py-1 rounded-full text-sm font-medium"
            style={{ background: badgeStyle.bg, color: badgeStyle.color }}
          >
            {badgeStyle.label}
          </span>
        </div>

        {/* Estimated time */}
        {!['delivered', 'cancelled'].includes(order.status) && (
          <div
            className="flex items-center gap-3 p-4 rounded-xl"
            style={{ background: 'color-mix(in srgb, var(--primary) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)' }}
          >
            <IceCream className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                Estimated {order.orderType === 'delivery' ? 'delivery' : 'pickup'}: {estimatedMinutes}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                Live updates will appear below as your order progresses.
              </p>
            </div>
          </div>
        )}

        {/* Live status tracker */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderTracker orderId={orderId} initialStatus={order.status as OrderStatus} />
          </CardContent>
        </Card>

        {/* Order items */}
        <Card>
          <CardHeader>
            <CardTitle>Items ({items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--muted)' }}>
                    <IceCream className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                      {item.itemNameSnapshot}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                    ${parseFloat(item.linePrice).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order totals */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted-foreground)' }}>Subtotal</span>
                <span>${parseFloat(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted-foreground)' }}>Tax</span>
                <span>${parseFloat(order.taxAmount).toFixed(2)}</span>
              </div>
              {order.orderType === 'delivery' && (
                <div className="flex justify-between">
                  <span style={{ color: 'var(--muted-foreground)' }}>Delivery Fee</span>
                  <span>$5.99</span>
                </div>
              )}
              {parseFloat(order.discountAmount) > 0 && (
                <div className="flex justify-between" style={{ color: 'var(--success)' }}>
                  <span>Discount</span>
                  <span>-${parseFloat(order.discountAmount).toFixed(2)}</span>
                </div>
              )}
              {parseFloat(order.tipAmount) > 0 && (
                <div className="flex justify-between">
                  <span style={{ color: 'var(--muted-foreground)' }}>Tip</span>
                  <span>${parseFloat(order.tipAmount).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 mt-1 flex justify-between font-semibold" style={{ borderColor: 'var(--border)' }}>
                <span>Total</span>
                <span>${parseFloat(order.total).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cancel order */}
        {canCancel && (
          <CancelOrderButton orderId={orderId} />
        )}
      </div>
    </div>
  );
}
