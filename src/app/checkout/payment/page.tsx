'use client';

import { Suspense, useEffect, useState, useTransition, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js';
import { ShieldCheck, Lock } from 'lucide-react';
import { createOrder } from '@/actions/orders';
import { getCartTotals } from '@/actions/cart';
import type { CheckoutTotals } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

export default function CheckoutPaymentPage() {
  return (
    <Suspense fallback={<div className="flex flex-col items-center justify-center py-16 gap-4"><div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} /></div>}>
      <CheckoutPaymentInner />
    </Suspense>
  );
}

function CheckoutPaymentInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderType = (searchParams.get('orderType') ?? 'delivery') as 'delivery' | 'pickup';
  const slotId = searchParams.get('slotId');
  const promo = searchParams.get('promo');
  const loyaltyPoints = searchParams.get('loyaltyPoints');

  const [totals, setTotals] = useState<CheckoutTotals | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [stripeInstance, setStripeInstance] = useState<Stripe | null>(null);
  const [elements, setElements] = useState<StripeElements | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isProcessing, startProcessing] = useTransition();
  const [initError, setInitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const paymentElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function initialize() {
      try {
        const totalsData = await getCartTotals(orderType);
        setTotals(totalsData);

        const orderInput = {
          type: orderType,
          ...(slotId ? { deliverySlotId: parseInt(slotId, 10) } : {}),
          ...(promo ? { promoCode: promo } : {}),
          ...(loyaltyPoints ? { loyaltyPointsToRedeem: parseInt(loyaltyPoints, 10) } : {}),
        };

        const { orderId: newOrderId, paymentIntentClientSecret } = await createOrder(orderInput);
        setOrderId(newOrderId);
        setClientSecret(paymentIntentClientSecret);

        const stripe = await stripePromise;
        if (!stripe) {
          setInitError('Payment system not configured.');
          return;
        }
        setStripeInstance(stripe);
      } catch (err) {
        setInitError(err instanceof Error ? err.message : 'Failed to initialize payment');
      } finally {
        setLoading(false);
      }
    }

    initialize();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mount Stripe Payment Element once we have clientSecret and stripe
  useEffect(() => {
    if (!stripeInstance || !clientSecret || !paymentElementRef.current) return;

    const els = stripeInstance.elements({
      clientSecret,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#D4536A',
          colorBackground: '#FFFFFF',
          colorText: '#2D2420',
          colorDanger: '#C9413A',
          fontFamily: 'DM Sans, Inter, system-ui, sans-serif',
          borderRadius: '12px',
        },
      },
    });

    const paymentElement = els.create('payment');
    paymentElement.mount(paymentElementRef.current);
    setElements(els);

    return () => {
      paymentElement.unmount();
    };
  }, [stripeInstance, clientSecret]);

  function handlePlaceOrder() {
    setPaymentError(null);

    if (!stripeInstance || !elements || !clientSecret || !orderId) {
      setPaymentError('Payment not ready. Please wait and try again.');
      return;
    }

    startProcessing(async () => {
      const { error } = await stripeInstance.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/confirmation/${orderId}`,
        },
      });

      if (error) {
        setPaymentError(error.message ?? 'Payment failed. Please try again.');
      }
      // On success, Stripe redirects to the return_url automatically
    });
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Preparing your payment...</p>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="text-center py-16">
        <p className="font-medium" style={{ color: 'var(--destructive)' }}>{initError}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Payment</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Step 3 of 4</p>
      </div>

      {/* Order total summary */}
      {totals && (
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted-foreground)' }}>Subtotal</span>
                <span>${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted-foreground)' }}>Tax</span>
                <span>${totals.tax.toFixed(2)}</span>
              </div>
              {orderType === 'delivery' && (
                <div className="flex justify-between">
                  <span style={{ color: 'var(--muted-foreground)' }}>Delivery Fee</span>
                  <span>$5.99</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-base">
                <span>Total charged</span>
                <span>${totals.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stripe Payment Element */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={paymentElementRef} className="min-h-[200px]">
            {!clientSecret && (
              <div className="flex items-center justify-center h-32">
                <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {paymentError && (
        <div className="p-3 rounded-lg text-sm" style={{ background: 'var(--destructive-foreground)', border: '1px solid var(--destructive)', color: 'var(--destructive)' }}>
          {paymentError}
        </div>
      )}

      {/* Secure badge */}
      <div className="flex items-center justify-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
        <ShieldCheck className="w-4 h-4" style={{ color: 'var(--success)' }} />
        <span>Secured by Stripe — your card details are encrypted and never stored on our servers.</span>
      </div>

      <Button
        onClick={handlePlaceOrder}
        size="lg"
        disabled={isProcessing || !elements || !clientSecret}
        className="w-full"
        style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin inline-block" style={{ borderColor: 'var(--primary-foreground)', borderTopColor: 'transparent' }} />
            Processing...
          </span>
        ) : (
          `Place Order${totals ? ` — $${totals.total.toFixed(2)}` : ''}`
        )}
      </Button>
    </div>
  );
}
