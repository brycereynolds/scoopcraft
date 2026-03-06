'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { cancelOrder } from '@/actions/orders';
import { Button } from '@/components/ui/button';

interface CancelOrderButtonProps {
  orderId: string;
}

export function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    setError(null);
    startTransition(async () => {
      try {
        await cancelOrder(orderId);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to cancel order');
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <p className="text-sm" style={{ color: 'var(--destructive)' }}>{error}</p>
      )}
      <Button
        variant="destructive"
        onClick={handleCancel}
        disabled={isPending}
        className="w-full"
      >
        {isPending ? 'Cancelling...' : 'Cancel Order'}
      </Button>
      <p className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
        Orders can only be cancelled within 2 minutes of placement.
      </p>
    </div>
  );
}
