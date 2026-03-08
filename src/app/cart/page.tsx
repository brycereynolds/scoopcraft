'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, IceCream } from 'lucide-react';
import { getCart, updateCartItem, removeFromCart, getCartTotals } from '@/actions/cart';
import type { CartWithItems, CartItemDetail, CheckoutTotals } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

type OrderType = 'delivery' | 'pickup';

export default function CartPage() {
  const [cart, setCart] = useState<CartWithItems | null>(null);
  const [totals, setTotals] = useState<CheckoutTotals | null>(null);
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function loadCart(type: OrderType = orderType) {
    try {
      const [cartData, totalsData] = await Promise.all([
        getCart(),
        getCartTotals(type),
      ]);
      setCart(cartData);
      setTotals(totalsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  function handleOrderTypeChange(type: OrderType) {
    setOrderType(type);
    startTransition(async () => {
      const newTotals = await getCartTotals(type);
      setTotals(newTotals);
    });
  }

  function handleQuantityChange(item: CartItemDetail, delta: number) {
    const newQty = item.quantity + delta;
    startTransition(async () => {
      try {
        if (newQty <= 0) {
          await removeFromCart(item.id);
        } else {
          await updateCartItem(item.id, newQty);
        }
        await loadCart();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update item');
      }
    });
  }

  function handleRemove(itemId: number) {
    startTransition(async () => {
      try {
        await removeFromCart(itemId);
        await loadCart();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to remove item');
      }
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
          <p style={{ color: 'var(--muted-foreground)' }}>Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-center">
          <p style={{ color: 'var(--destructive)' }}>{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => { setError(null); loadCart(); }}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  if (isEmpty) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--background)' }}>
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'var(--muted)' }}>
            <IceCream className="w-12 h-12" style={{ color: 'var(--primary)' }} />
          </div>
          <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Your cart is empty</h1>
          <p className="mb-6" style={{ color: 'var(--muted-foreground)' }}>
            Looks like you haven&apos;t added anything yet. Browse our handcrafted ice cream selection!
          </p>
          <Link href="/menu">
            <Button size="lg" className="w-full" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              Browse Menu
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Your Cart</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>
            {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: items + order type */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Order type selector */}
            <Card>
              <CardHeader>
                <CardTitle>Order Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleOrderTypeChange('delivery')}
                    className="flex-1 py-3 px-4 rounded-xl border-2 transition-all font-medium text-sm"
                    style={{
                      borderColor: orderType === 'delivery' ? 'var(--primary)' : 'var(--border)',
                      background: orderType === 'delivery' ? 'var(--primary)' : 'var(--surface)',
                      color: orderType === 'delivery' ? 'var(--primary-foreground)' : 'var(--foreground)',
                    }}
                  >
                    Delivery
                  </button>
                  <button
                    onClick={() => handleOrderTypeChange('pickup')}
                    className="flex-1 py-3 px-4 rounded-xl border-2 transition-all font-medium text-sm"
                    style={{
                      borderColor: orderType === 'pickup' ? 'var(--primary)' : 'var(--border)',
                      background: orderType === 'pickup' ? 'var(--primary)' : 'var(--surface)',
                      color: orderType === 'pickup' ? 'var(--primary-foreground)' : 'var(--foreground)',
                    }}
                  >
                    Pickup
                  </button>
                </div>
                {orderType === 'pickup' && (
                  <p className="mt-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    Pickup at: 123 Scoop Street, Ice Cream City, CA 90210
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Cart items */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
                  {cart.items.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      onQuantityChange={handleQuantityChange}
                      onRemove={handleRemove}
                      disabled={isPending}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Continue shopping */}
            <Link href="/menu" className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--primary)' }}>
              <ArrowRight className="w-4 h-4 rotate-180" />
              Continue Shopping
            </Link>
          </div>

          {/* Right column: order summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {totals ? (
                  <div className="flex flex-col gap-3 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--muted-foreground)' }}>Subtotal</span>
                      <span style={{ color: 'var(--foreground)' }}>${totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--muted-foreground)' }}>Tax</span>
                      <span style={{ color: 'var(--foreground)' }}>${totals.tax.toFixed(2)}</span>
                    </div>
                    {orderType === 'delivery' && (
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--muted-foreground)' }}>Delivery Fee</span>
                        <span style={{ color: 'var(--foreground)' }}>$5.99</span>
                      </div>
                    )}
                    {orderType === 'pickup' && (
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--muted-foreground)' }}>Delivery Fee</span>
                        <Badge variant="secondary" className="text-xs">Free</Badge>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold text-base">
                      <span>Total</span>
                      <span>${totals.total.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-24 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex-col gap-2">
                <Link
                  href={`/checkout?orderType=${orderType}`}
                  className="w-full"
                >
                  <Button
                    className="w-full"
                    size="lg"
                    disabled={isPending || !totals}
                    style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Proceed to Checkout
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CartItemRowProps {
  item: CartItemDetail;
  onQuantityChange: (item: CartItemDetail, delta: number) => void;
  onRemove: (itemId: number) => void;
  disabled: boolean;
}

function CartItemRow({ item, onQuantityChange, onRemove, disabled }: CartItemRowProps) {
  return (
    <div className="flex items-center gap-4 py-4">
      {/* Image */}
      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0" style={{ background: 'var(--muted)' }}>
        {item.menuItem.photoUrl ? (
          <Image
            src={item.menuItem.photoUrl}
            alt={item.menuItem.name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <IceCream className="w-8 h-8" style={{ color: 'var(--muted-foreground)' }} />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate" style={{ color: 'var(--foreground)' }}>{item.menuItem.name}</p>
        {item.scoopLabConfig && (
          <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
            Custom: {item.scoopLabConfig.name}
          </p>
        )}
        <p className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
          ${parseFloat(item.menuItem.price).toFixed(2)} each
        </p>
      </div>

      {/* Quantity stepper */}
      <div className="flex items-center gap-1 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => onQuantityChange(item, -1)}
          disabled={disabled}
          className="p-2 rounded-l-lg transition-colors disabled:opacity-50"
          style={{ color: 'var(--foreground)' }}
          aria-label="Decrease quantity"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="w-8 text-center text-sm font-medium" style={{ color: 'var(--foreground)' }}>
          {item.quantity}
        </span>
        <button
          onClick={() => onQuantityChange(item, 1)}
          disabled={disabled}
          className="p-2 rounded-r-lg transition-colors disabled:opacity-50"
          style={{ color: 'var(--foreground)' }}
          aria-label="Increase quantity"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Line total */}
      <div className="text-right min-w-[60px]">
        <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
          ${item.subtotal.toFixed(2)}
        </p>
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(item.id)}
        disabled={disabled}
        className="p-2 rounded-lg transition-colors disabled:opacity-50"
        style={{ color: 'var(--muted-foreground)' }}
        aria-label="Remove item"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
