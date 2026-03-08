'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { adminUpdateOrderStatus } from '@/actions/admin';
import type { AdminOrder } from '@/actions/admin';
import type { OrderStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ChevronRight, ExternalLink } from 'lucide-react';

const ALL_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

const NEXT_STATUS: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  pending: { status: 'confirmed', label: 'Confirm' },
  confirmed: { status: 'preparing', label: 'Start Preparing' },
  preparing: { status: 'ready', label: 'Mark Ready' },
  ready: { status: 'out_for_delivery', label: 'Out for Delivery' },
  out_for_delivery: { status: 'delivered', label: 'Mark Delivered' },
};

function statusStyle(status: OrderStatus): { bg: string; text: string } {
  switch (status) {
    case 'pending':       return { bg: '#FEF9C3', text: '#854D0E' };
    case 'confirmed':     return { bg: '#DBEAFE', text: '#1E40AF' };
    case 'preparing':     return { bg: '#FFEDD5', text: '#9A3412' };
    case 'ready':         return { bg: '#F3E8FF', text: '#6B21A8' };
    case 'out_for_delivery': return { bg: '#E0E7FF', text: '#3730A3' };
    case 'delivered':     return { bg: '#DCFCE7', text: '#166534' };
    case 'cancelled':     return { bg: '#FEE2E2', text: '#991B1B' };
    default:              return { bg: 'var(--muted)', text: 'var(--foreground-secondary)' };
  }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function OrderDetailDialog({
  order,
  open,
  onClose,
}: {
  order: AdminOrder;
  open: boolean;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const nextAction = NEXT_STATUS[order.status];
  const styles = statusStyle(order.status);

  function handleAdvance() {
    if (!nextAction) return;
    startTransition(async () => {
      try {
        await adminUpdateOrderStatus(order.id, nextAction.status);
        toast.success(`Order #${order.id} updated to "${nextAction.status.replace(/_/g, ' ')}"`);
        router.refresh();
        onClose();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to update order');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--foreground)' }}>
            Order #{order.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Status + type */}
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
              style={{ backgroundColor: styles.bg, color: styles.text }}
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

          {/* Customer */}
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--foreground-muted)' }}>
              Customer
            </p>
            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              {order.customerName}
            </p>
            <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
              {order.customerEmail}
            </p>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--foreground-muted)' }}>
              Items
            </p>
            <div
              className="rounded-lg p-3 space-y-1.5"
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
                className="pt-2 mt-1 space-y-1"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                {parseFloat(order.discountAmount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--foreground-secondary)' }}>Discount</span>
                    <span style={{ color: 'var(--success)' }}>
                      -${parseFloat(order.discountAmount).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--foreground-secondary)' }}>Tax</span>
                  <span style={{ color: 'var(--foreground-secondary)' }}>
                    ${parseFloat(order.taxAmount).toFixed(2)}
                  </span>
                </div>
                {parseFloat(order.tipAmount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--foreground-secondary)' }}>Tip</span>
                    <span style={{ color: 'var(--foreground-secondary)' }}>
                      ${parseFloat(order.tipAmount).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                  <span>Total</span>
                  <span>${parseFloat(order.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery slot */}
          {order.deliverySlot && (
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--foreground-muted)' }}>
                Delivery Slot
              </p>
              <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                {order.deliverySlot.slotDate} {order.deliverySlot.startTime}–
                {order.deliverySlot.endTime}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--foreground-muted)' }}>
              Ordered
            </p>
            <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
              {formatDate(order.createdAt)}
            </p>
          </div>

          {/* Actions */}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

type Props = {
  orders: AdminOrder[];
  initialStatus: string;
  initialDate: string;
};

export function OrdersTableClient({ orders, initialStatus, initialDate }: Props) {
  const router = useRouter();
  const [activeStatus, setActiveStatus] = useState(initialStatus);
  const [dateFilter, setDateFilter] = useState(initialDate);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  function applyFilters(status: string, date: string) {
    setActiveStatus(status);
    setDateFilter(date);
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    if (date) params.set('date', date);
    router.push(`/admin/orders?${params.toString()}`);
  }

  // Count per status for tab badges
  const countsByStatus = ALL_STATUSES.reduce(
    (acc, s) => {
      acc[s] = orders.filter((o) => o.status === s).length;
      return acc;
    },
    {} as Record<OrderStatus, number>
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Tabs
          value={activeStatus}
          onValueChange={(v) => applyFilters(v, dateFilter)}
        >
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
            {ALL_STATUSES.map((s) => (
              <TabsTrigger key={s} value={s} className="capitalize text-xs">
                {s.replace(/_/g, ' ')} ({countsByStatus[s]})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => applyFilters(activeStatus, e.target.value)}
          className="rounded-lg border px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--foreground)',
          }}
        />
        {dateFilter && (
          <button
            onClick={() => applyFilters(activeStatus, '')}
            className="text-xs underline"
            style={{ color: 'var(--foreground-muted)' }}
          >
            Clear date
          </button>
        )}
      </div>

      {/* Table */}
      <Card
        className="border overflow-hidden"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {orders.length === 0 ? (
          <div className="py-16 text-center" style={{ color: 'var(--foreground-muted)' }}>
            No orders match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--border)',
                    backgroundColor: 'var(--muted)',
                  }}
                >
                  {['ID', 'Customer', 'Date', 'Items', 'Total', 'Status', 'Delivery', ''].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left font-medium whitespace-nowrap"
                        style={{ color: 'var(--foreground-secondary)' }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const styles = statusStyle(order.status);
                  return (
                    <tr
                      key={order.id}
                      className="cursor-pointer transition-colors hover:bg-muted/40"
                      style={{ borderBottom: '1px solid var(--border)' }}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td
                        className="px-4 py-3 font-mono text-xs"
                        style={{ color: 'var(--foreground-muted)' }}
                      >
                        #{order.id}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                          {order.customerName}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                          {order.customerEmail}
                        </p>
                      </td>
                      <td
                        className="px-4 py-3 text-xs whitespace-nowrap"
                        style={{ color: 'var(--foreground-secondary)' }}
                      >
                        {formatDate(order.createdAt)}
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{ color: 'var(--foreground-secondary)' }}
                      >
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </td>
                      <td
                        className="px-4 py-3 font-medium whitespace-nowrap"
                        style={{ color: 'var(--foreground)' }}
                      >
                        ${parseFloat(order.total).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize whitespace-nowrap"
                          style={{ backgroundColor: styles.bg, color: styles.text }}
                        >
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 text-xs whitespace-nowrap"
                        style={{ color: 'var(--foreground-secondary)' }}
                      >
                        {order.deliverySlot
                          ? `${order.deliverySlot.slotDate} ${order.deliverySlot.startTime}`
                          : order.orderType === 'pickup'
                          ? 'Pickup'
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <ChevronRight
                          className="h-4 w-4"
                          style={{ color: 'var(--foreground-muted)' }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Detail dialog */}
      {selectedOrder && (
        <OrderDetailDialog
          order={selectedOrder}
          open={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
