export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { CheckCircle2, Star, Package } from 'lucide-react';
import { getOrder } from '@/actions/orders';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ConfirmationPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { orderId } = await params;

  let order = null;
  try {
    order = await getOrder(orderId);
  } catch {
    // Order may not be accessible — show generic confirmation
  }

  const pointsEarned = order ? Math.floor(parseFloat(order.total) * 10) : 0;
  const estimatedMinutes = order?.orderType === 'delivery' ? '30–45' : '15–20';
  const isDelivery = order?.orderType === 'delivery';

  return (
    <div className="flex flex-col items-center gap-6 text-center py-4">
      {/* Success icon */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: 'var(--success-foreground)' }}
      >
        <CheckCircle2 className="w-10 h-10" style={{ color: 'var(--success)' }} />
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
          Order Placed!
        </h1>
        <p style={{ color: 'var(--muted-foreground)' }}>
          {isDelivery
            ? 'Your artisan ice cream is being crafted and will be on its way soon.'
            : 'Your order is being prepared. Head over to pick it up!'}
        </p>
      </div>

      {/* Order details card */}
      <Card className="w-full max-w-sm text-left">
        <CardContent className="pt-4 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Order ID</span>
            <span className="text-sm font-mono font-semibold" style={{ color: 'var(--foreground)' }}>#{orderId}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {isDelivery ? 'Estimated Delivery' : 'Ready in'}
            </span>
            <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{estimatedMinutes} min</span>
          </div>
          {order && (
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Total charged</span>
              <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>${parseFloat(order.total).toFixed(2)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loyalty points earned */}
      {pointsEarned > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full max-w-sm"
          style={{ background: 'color-mix(in srgb, var(--secondary) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--secondary) 30%, transparent)' }}
        >
          <Star className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--secondary)' }} />
          <div className="text-left">
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              You earned {pointsEarned} points!
            </p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Added to your loyalty balance
            </p>
          </div>
          <Badge variant="secondary" className="ml-auto flex-shrink-0">+{pointsEarned} pts</Badge>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-sm">
        <Link href={`/orders/${orderId}`} className="w-full">
          <Button
            size="lg"
            className="w-full"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            <Package className="w-4 h-4 mr-2" />
            Track Your Order
          </Button>
        </Link>
        <Link href="/menu" className="w-full">
          <Button size="lg" variant="outline" className="w-full">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
