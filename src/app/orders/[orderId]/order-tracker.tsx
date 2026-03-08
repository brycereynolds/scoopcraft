'use client';

import { useEffect, useRef, useState } from 'react';
import type { OrderStatus } from '@/types';

const STATUS_ORDER: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  preparing: 'Being Prepared',
  ready: 'Ready',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  pending: 'We received your order and are processing it.',
  confirmed: 'Your order has been confirmed by the shop.',
  preparing: 'Our team is crafting your ice cream.',
  ready: 'Your order is ready!',
  out_for_delivery: 'Your order is on its way to you.',
  delivered: 'Enjoy your ScoopCraft!',
  cancelled: 'This order has been cancelled.',
};

interface OrderTrackerProps {
  orderId: string;
  initialStatus: OrderStatus;
}

export function OrderTracker({ orderId, initialStatus }: OrderTrackerProps) {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(initialStatus);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource(`/api/sse/orders/${orderId}`);
    eventSourceRef.current = es;

    es.addEventListener('open', () => setConnected(true));

    es.addEventListener('status', (event) => {
      try {
        const data = JSON.parse(event.data) as { status: OrderStatus };
        setCurrentStatus(data.status);
      } catch {
        // Ignore parse errors
      }
    });

    es.addEventListener('error', () => {
      setConnected(false);
    });

    return () => {
      es.close();
    };
  }, [orderId]);

  if (currentStatus === 'cancelled') {
    return (
      <div
        className="p-4 rounded-xl text-center"
        style={{ background: 'var(--destructive-foreground)', border: '1px solid var(--destructive)' }}
      >
        <p className="font-semibold" style={{ color: 'var(--destructive)' }}>Order Cancelled</p>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
          {STATUS_DESCRIPTIONS.cancelled}
        </p>
      </div>
    );
  }

  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  return (
    <div className="flex flex-col gap-4">
      {/* Connection indicator */}
      {!connected && (
        <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full w-fit" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
          Reconnecting to live updates...
        </div>
      )}

      {/* Status timeline */}
      <div className="relative flex flex-col gap-0">
        {STATUS_ORDER.map((status, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;

          return (
            <div key={status} className="flex gap-4">
              {/* Timeline column */}
              <div className="flex flex-col items-center">
                {/* Circle */}
                <div
                  className="w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-500 z-10"
                  style={{
                    borderColor: isDone || isCurrent ? 'var(--primary)' : 'var(--border)',
                    background: isDone
                      ? 'var(--primary)'
                      : isCurrent
                      ? 'color-mix(in srgb, var(--primary) 15%, transparent)'
                      : 'var(--surface)',
                  }}
                >
                  {isDone ? (
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8L6.5 11.5L13 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : isCurrent ? (
                    <div
                      className="w-3 h-3 rounded-full animate-pulse"
                      style={{ background: 'var(--primary)' }}
                    />
                  ) : (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: 'var(--border)' }}
                    />
                  )}
                </div>

                {/* Connector line */}
                {index < STATUS_ORDER.length - 1 && (
                  <div
                    className="w-0.5 flex-1 my-1 transition-colors duration-500"
                    style={{
                      background: isDone ? 'var(--primary)' : 'var(--border)',
                      minHeight: '2rem',
                    }}
                  />
                )}
              </div>

              {/* Content */}
              <div className="pb-6 pt-0.5 flex-1">
                <p
                  className="font-medium text-sm"
                  style={{
                    color: isFuture ? 'var(--muted-foreground)' : 'var(--foreground)',
                  }}
                >
                  {STATUS_LABELS[status]}
                </p>
                {isCurrent && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    {STATUS_DESCRIPTIONS[status]}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
