'use client';

import { Suspense, useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, Clock, Store } from 'lucide-react';
import { getDeliverySlots } from '@/actions/orders';
import type { DeliverySlot } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type OrderType = 'delivery' | 'pickup';

interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

const STORE_ADDRESS = '123 Scoop Street, Ice Cream City, CA 90210';

export default function CheckoutDeliveryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-16"><div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} /></div>}>
      <CheckoutDeliveryInner />
    </Suspense>
  );
}

function CheckoutDeliveryInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialType = (searchParams.get('orderType') as OrderType) ?? 'delivery';
  const [orderType, setOrderType] = useState<OrderType>(initialType);
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [address, setAddress] = useState<DeliveryAddress>({ street: '', city: '', state: '', zip: '' });
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function loadSlots() {
      setSlotsLoading(true);
      try {
        const data = await getDeliverySlots();
        setSlots(data);
      } catch {
        // Slots may be unavailable — not fatal
      } finally {
        setSlotsLoading(false);
      }
    }
    loadSlots();
  }, []);

  function handleContinue() {
    setFormError(null);

    if (orderType === 'delivery') {
      if (!address.street.trim() || !address.city.trim() || !address.state.trim() || !address.zip.trim()) {
        setFormError('Please fill in all address fields.');
        return;
      }
    }

    const params = new URLSearchParams({
      orderType,
      ...(selectedSlot ? { slotId: selectedSlot.toString() } : {}),
      ...(orderType === 'delivery' ? {
        street: address.street,
        city: address.city,
        state: address.state,
        zip: address.zip,
      } : {}),
    });

    startTransition(() => {
      router.push(`/checkout/review?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Delivery Details</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Step 1 of 4</p>
      </div>

      {/* Order type */}
      <Card>
        <CardHeader>
          <CardTitle>How would you like to receive your order?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <button
              onClick={() => setOrderType('delivery')}
              className="flex-1 py-4 px-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2"
              style={{
                borderColor: orderType === 'delivery' ? 'var(--primary)' : 'var(--border)',
                background: orderType === 'delivery' ? 'color-mix(in srgb, var(--primary) 8%, transparent)' : 'var(--surface)',
                color: orderType === 'delivery' ? 'var(--primary)' : 'var(--muted-foreground)',
              }}
            >
              <MapPin className="w-6 h-6" />
              <span className="font-medium text-sm">Delivery</span>
              <span className="text-xs">$5.99 fee</span>
            </button>
            <button
              onClick={() => setOrderType('pickup')}
              className="flex-1 py-4 px-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2"
              style={{
                borderColor: orderType === 'pickup' ? 'var(--primary)' : 'var(--border)',
                background: orderType === 'pickup' ? 'color-mix(in srgb, var(--primary) 8%, transparent)' : 'var(--surface)',
                color: orderType === 'pickup' ? 'var(--primary)' : 'var(--muted-foreground)',
              }}
            >
              <Store className="w-6 h-6" />
              <span className="font-medium text-sm">Pickup</span>
              <span className="text-xs">Free</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Delivery address form */}
      {orderType === 'delivery' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                placeholder="123 Main St, Apt 4B"
                value={address.street}
                onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="San Francisco"
                  value={address.city}
                  onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="CA"
                  maxLength={2}
                  value={address.state}
                  onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input
                id="zip"
                placeholder="94102"
                maxLength={10}
                value={address.zip}
                onChange={(e) => setAddress((a) => ({ ...a, zip: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pickup store info */}
      {orderType === 'pickup' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              Pickup Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{STORE_ADDRESS}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Mon–Sun: 10am – 10pm</p>
          </CardContent>
        </Card>
      )}

      {/* Delivery/pickup time slots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            {orderType === 'delivery' ? 'Delivery Time Slot' : 'Pickup Time Slot'}
            <span className="text-sm font-normal" style={{ color: 'var(--muted-foreground)' }}>(optional)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {slotsLoading ? (
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
              Loading available slots...
            </div>
          ) : slots.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              No scheduled slots available today. Your order will be fulfilled as soon as possible.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(selectedSlot === slot.id ? null : slot.id)}
                  disabled={!slot.available}
                  className="py-2 px-3 rounded-lg border text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    borderColor: selectedSlot === slot.id ? 'var(--primary)' : 'var(--border)',
                    background: selectedSlot === slot.id ? 'color-mix(in srgb, var(--primary) 8%, transparent)' : 'var(--surface)',
                    color: selectedSlot === slot.id ? 'var(--primary)' : 'var(--foreground)',
                  }}
                >
                  <div className="font-medium">{formatTime(slot.startTime)}</div>
                  <div className="text-xs" style={{ color: slot.available ? 'var(--muted-foreground)' : 'var(--destructive)' }}>
                    {slot.available ? `${slot.maxOrders - slot.currentOrders} left` : 'Full'}
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {formError && (
        <p className="text-sm" style={{ color: 'var(--destructive)' }}>{formError}</p>
      )}

      <Button
        onClick={handleContinue}
        size="lg"
        disabled={isPending}
        className="w-full"
        style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
      >
        {isPending ? 'Loading...' : 'Continue to Review'}
      </Button>
    </div>
  );
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}
