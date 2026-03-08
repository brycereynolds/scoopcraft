'use client';

import { Suspense, useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tag, Star, IceCream } from 'lucide-react';
import { getCart, getCartTotals } from '@/actions/cart';
import type { CartWithItems, CheckoutTotals } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function CheckoutReviewPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-16"><div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} /></div>}>
      <CheckoutReviewInner />
    </Suspense>
  );
}

function CheckoutReviewInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderType = (searchParams.get('orderType') ?? 'delivery') as 'delivery' | 'pickup';
  const slotId = searchParams.get('slotId');
  const street = searchParams.get('street') ?? '';
  const city = searchParams.get('city') ?? '';
  const state = searchParams.get('state') ?? '';
  const zip = searchParams.get('zip') ?? '';

  const [cart, setCart] = useState<CartWithItems | null>(null);
  const [totals, setTotals] = useState<CheckoutTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Promo code state
  const [promoInput, setPromoInput] = useState('');
  const [promoApplied, setPromoApplied] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoLoading, startPromoTransition] = useTransition();

  // Loyalty points state
  const [loyaltyBalance] = useState(250); // Placeholder — would come from user profile
  const [loyaltyInput, setLoyaltyInput] = useState('');
  const [loyaltyApplied, setLoyaltyApplied] = useState(0);
  const [loyaltyError, setLoyaltyError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function load() {
      try {
        const [cartData, totalsData] = await Promise.all([
          getCart(),
          getCartTotals(orderType),
        ]);
        setCart(cartData);
        setTotals(totalsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [orderType]);

  function handleApplyPromo() {
    if (!promoInput.trim()) return;
    setPromoError(null);

    startPromoTransition(async () => {
      // Promo code validation happens at createOrder time.
      // Here we do a lightweight client-side check to surface early feedback.
      // The real validation & discount amount come from the server on order creation.
      // For review page, store the code and show a placeholder confirmation.
      try {
        // Optimistic: mark as applied; actual discount calculated server-side.
        setPromoApplied(promoInput.trim().toUpperCase());
        setPromoDiscount(0); // Will be determined on order creation
        setPromoInput('');
      } catch (err) {
        setPromoError(err instanceof Error ? err.message : 'Invalid promo code');
      }
    });
  }

  function handleApplyLoyalty() {
    setLoyaltyError(null);
    const points = parseInt(loyaltyInput, 10);

    if (isNaN(points) || points <= 0) {
      setLoyaltyError('Enter a valid number of points.');
      return;
    }
    if (points > loyaltyBalance) {
      setLoyaltyError(`You only have ${loyaltyBalance} points available.`);
      return;
    }
    setLoyaltyApplied(points);
    setLoyaltyInput('');
  }

  function handleContinue() {
    const params = new URLSearchParams({
      orderType,
      ...(slotId ? { slotId } : {}),
      ...(orderType === 'delivery' ? { street, city, state, zip } : {}),
      ...(promoApplied ? { promo: promoApplied } : {}),
      ...(loyaltyApplied > 0 ? { loyaltyPoints: loyaltyApplied.toString() } : {}),
    });

    startTransition(() => {
      router.push(`/checkout/payment?${params.toString()}`);
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (error || !cart || !totals) {
    return (
      <div className="text-center py-16">
        <p style={{ color: 'var(--destructive)' }}>{error ?? 'Something went wrong'}</p>
      </div>
    );
  }

  const loyaltyDiscount = loyaltyApplied * 0.01;
  const adjustedTotal = Math.max(0, totals.total - promoDiscount - loyaltyDiscount);
  const pointsEarnable = Math.floor(adjustedTotal * 10);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Review Your Order</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Step 2 of 4</p>
      </div>

      {/* Delivery summary */}
      <Card>
        <CardHeader>
          <CardTitle>
            {orderType === 'delivery' ? 'Delivering to' : 'Pickup'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orderType === 'delivery' ? (
            <p className="text-sm" style={{ color: 'var(--foreground)' }}>
              {[street, city, state, zip].filter(Boolean).join(', ') || 'No address provided'}
            </p>
          ) : (
            <p className="text-sm" style={{ color: 'var(--foreground)' }}>
              123 Scoop Street, Ice Cream City, CA 90210
            </p>
          )}
          {slotId && (
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
              Scheduled time slot selected
            </p>
          )}
        </CardContent>
      </Card>

      {/* Cart items */}
      <Card>
        <CardHeader>
          <CardTitle>Items ({cart.items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--muted)' }}>
                  <IceCream className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>{item.menuItem.name}</p>
                  {item.scoopLabConfig && (
                    <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>Custom: {item.scoopLabConfig.name}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>×{item.quantity}</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>${item.subtotal.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Promo code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            Promo Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          {promoApplied ? (
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--success-foreground)', border: '1px solid var(--success)' }}>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" style={{ color: 'var(--success)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--success)' }}>{promoApplied} applied</span>
              </div>
              <button
                onClick={() => { setPromoApplied(null); setPromoDiscount(0); }}
                className="text-xs underline"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Enter promo code"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                className="flex-1"
              />
              <Button
                onClick={handleApplyPromo}
                variant="outline"
                disabled={promoLoading || !promoInput.trim()}
              >
                Apply
              </Button>
            </div>
          )}
          {promoError && (
            <p className="text-xs mt-2" style={{ color: 'var(--destructive)' }}>{promoError}</p>
          )}
        </CardContent>
      </Card>

      {/* Loyalty points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-4 h-4" style={{ color: 'var(--secondary)' }} />
            Loyalty Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-3 p-3 rounded-lg" style={{ background: 'var(--muted)' }}>
            <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Your balance</span>
            <Badge variant="secondary">{loyaltyBalance} pts</Badge>
          </div>

          {loyaltyApplied > 0 ? (
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--success-foreground)', border: '1px solid var(--success)' }}>
              <span className="text-sm font-medium" style={{ color: 'var(--success)' }}>
                {loyaltyApplied} pts → -${loyaltyDiscount.toFixed(2)}
              </span>
              <button
                onClick={() => setLoyaltyApplied(0)}
                className="text-xs underline"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Remove
              </button>
            </div>
          ) : (
            <div>
              <Label htmlFor="loyalty-points" className="text-sm mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>
                Redeem points (100 pts = $1.00)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="loyalty-points"
                  type="number"
                  placeholder={`Max ${loyaltyBalance} pts`}
                  value={loyaltyInput}
                  onChange={(e) => setLoyaltyInput(e.target.value)}
                  min={0}
                  max={loyaltyBalance}
                />
                <Button
                  onClick={handleApplyLoyalty}
                  variant="outline"
                  disabled={!loyaltyInput}
                >
                  Redeem
                </Button>
              </div>
              {loyaltyError && (
                <p className="text-xs mt-2" style={{ color: 'var(--destructive)' }}>{loyaltyError}</p>
              )}
            </div>
          )}

          <p className="text-xs mt-3" style={{ color: 'var(--muted-foreground)' }}>
            You&apos;ll earn ~{pointsEarnable} points with this order.
          </p>
        </CardContent>
      </Card>

      {/* Order totals */}
      <Card>
        <CardHeader>
          <CardTitle>Order Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span style={{ color: 'var(--muted-foreground)' }}>Subtotal</span>
              <span>${totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--muted-foreground)' }}>Tax (8.5%)</span>
              <span>${totals.tax.toFixed(2)}</span>
            </div>
            {orderType === 'delivery' && (
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted-foreground)' }}>Delivery Fee</span>
                <span>$5.99</span>
              </div>
            )}
            {promoApplied && promoDiscount > 0 && (
              <div className="flex justify-between" style={{ color: 'var(--success)' }}>
                <span>Promo ({promoApplied})</span>
                <span>-${promoDiscount.toFixed(2)}</span>
              </div>
            )}
            {loyaltyApplied > 0 && (
              <div className="flex justify-between" style={{ color: 'var(--success)' }}>
                <span>Loyalty Points ({loyaltyApplied} pts)</span>
                <span>-${loyaltyDiscount.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>${adjustedTotal.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleContinue}
        size="lg"
        disabled={isPending}
        className="w-full"
        style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
      >
        {isPending ? 'Loading...' : 'Continue to Payment'}
      </Button>
    </div>
  );
}
