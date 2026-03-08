'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { adminUpdateOrderStatus } from '@/actions/admin';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AdminOrder } from '@/actions/admin';
import type { OrderStatus } from '@/types';
import { toast } from 'sonner';
import { RefreshCw, Clock, Package, User } from 'lucide-react';

// Status transitions for queue orders
const NEXT_STATUS: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  pending: { status: 'confirmed', label: 'Confirm' },
  confirmed: { status: 'preparing', label: 'Start Preparing' },
  preparing: { status: 'ready', label: 'Mark Ready' },
  ready: { status: 'out_for_delivery', label: 'Out for Delivery' },
  out_for_delivery: { status: 'delivered', label: 'Mark Delivered' },
};

function statusStyle(status: OrderStatus): { bg: string; text: string; border: string } {
  switch (status) {
    case 'pending':
      return { bg: '#FEF9C3', text: '#854D0E', border: '#FDE047' };
    case 'confirmed':
      return { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' };
    case 'preparing':
      return { bg: '#FFEDD5', text: '#9A3412', border: '#FCA978' };
    case 'ready':
      return { bg: '#F3E8FF', text: '#6B21A8', border: '#C4B5FD' };
    case 'out_for_delivery':
      return { bg: '#E0E7FF', text: '#3730A3', border: '#A5B4FC' };
    case 'delivered':
      return { bg: '#DCFCE7', text: '#166534', border: '#86EFAC' };
    case 'cancelled':
      return { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' };
    default:
      return { bg: 'var(--muted)', text: 'var(--foreground-secondary)', border: 'var(--border)' };
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function OrderCard({ order }: { order: AdminOrder }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const nextAction = NEXT_STATUS[order.status];
  const styles = statusStyle(order.status);

  function handleAdvance() {
    if (!nextAction) return;
    startTransition(async () => {
      try {
        await adminUpdateOrderStatus(order.id, nextAction.status);
        toast.success(`Order #${order.id} moved to "${nextAction.status.replace(/_/g, ' ')}"`);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to update order');
      }
    });
  }

  return (
    <Card
      className="border transition-shadow hover:shadow-md"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="font-mono text-xs font-semibold"
              style={{ color: 'var(--foreground-muted)' }}
            >
              #{order.id}
            </span>
            <span
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize border"
              style={{ backgroundColor: styles.bg, color: styles.text, borderColor: styles.border }}
            >
              {order.status.replace(/_/g, ' ')}
            </span>
            <span
              className="text-xs rounded-md px-1.5 py-0.5"
              style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground-muted)' }}
            >
              {order.orderType}
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--foreground-muted)' }}>
            <Clock className="h-3 w-3" />
            {formatTimeAgo(order.createdAt)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Customer */}
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 shrink-0" style={{ color: 'var(--foreground-muted)' }} />
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              {order.customerName}
            </p>
            <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
              {order.customerEmail}
            </p>
          </div>
        </div>

        {/* Items */}
        <div
          className="rounded-lg p-3 space-y-1"
          style={{ backgroundColor: 'var(--muted)' }}
        >
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span style={{ color: 'var(--foreground-secondary)' }}>
                {item.quantity}x {item.itemNameSnapshot}
              </span>
              <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                ${parseFloat(item.linePrice).toFixed(2)}
              </span>
            </div>
          ))}
          <div
            className="pt-1 mt-1 flex justify-between text-sm font-semibold"
            style={{ borderTop: '1px solid var(--border)', color: 'var(--foreground)' }}
          >
            <span>Total</span>
            <span>${parseFloat(order.total).toFixed(2)}</span>
          </div>
        </div>

        {/* Delivery slot */}
        {order.deliverySlot && (
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            <Package className="h-4 w-4 shrink-0" style={{ color: 'var(--foreground-muted)' }} />
            <span>
              Delivery: {order.deliverySlot.slotDate} {order.deliverySlot.startTime}–
              {order.deliverySlot.endTime}
            </span>
          </div>
        )}

        {/* Action button */}
        {nextAction && (
          <Button
            onClick={handleAdvance}
            disabled={isPending}
            className="w-full"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            {isPending ? 'Updating...' : nextAction.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

type Props = {
  initialOrders: AdminOrder[];
};

export function OrderQueueClient({ initialOrders }: Props) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 500);
  }, [router]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    intervalRef.current = setInterval(refresh, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh]);

  // SSE for real-time new order notifications
  useEffect(() => {
    const eventSource = new EventSource('/api/admin/sse');

    eventSource.addEventListener('new_order', () => {
      toast.info('New order received!');
      router.refresh();
    });

    eventSource.addEventListener('order_updated', () => {
      router.refresh();
    });

    eventSource.onerror = () => {
      // SSE connection failed — fall back to polling only
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [router]);

  const grouped = {
    pending: initialOrders.filter((o) => o.status === 'pending'),
    confirmed: initialOrders.filter((o) => o.status === 'confirmed'),
    preparing: initialOrders.filter((o) => o.status === 'preparing'),
  };

  const columns = [
    { key: 'pending' as const, label: 'Pending', color: '#854D0E', bg: '#FEF9C3' },
    { key: 'confirmed' as const, label: 'Confirmed', color: '#1E40AF', bg: '#DBEAFE' },
    { key: 'preparing' as const, label: 'Preparing', color: '#9A3412', bg: '#FFEDD5' },
  ];

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
          {initialOrders.length} active order{initialOrders.length !== 1 ? 's' : ''} — auto-refreshes
          every 30s
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={isRefreshing}
          style={{ borderColor: 'var(--border)', color: 'var(--foreground-secondary)' }}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {initialOrders.length === 0 ? (
        <div
          className="rounded-2xl border py-20 text-center"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <Package className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--foreground-muted)' }} />
          <p className="text-lg font-medium" style={{ color: 'var(--foreground)' }}>
            Queue is clear
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
            No pending, confirmed, or in-progress orders.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col) => (
            <div key={col.key} className="space-y-3">
              {/* Column header */}
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                  style={{ backgroundColor: col.bg, color: col.color }}
                >
                  {grouped[col.key].length}
                </span>
                <h3 className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
                  {col.label}
                </h3>
              </div>

              {grouped[col.key].length === 0 ? (
                <div
                  className="rounded-xl border border-dashed py-8 text-center text-sm"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground-muted)' }}
                >
                  No {col.label.toLowerCase()} orders
                </div>
              ) : (
                grouped[col.key].map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
