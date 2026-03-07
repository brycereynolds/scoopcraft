'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ShoppingCart, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addToCart } from '@/actions/cart';
import type { MenuItemWithPhoto } from '@/types';
import { IMAGES, pexelsUrl } from '@/lib/imagery';

interface MenuItemCardProps {
  item: MenuItemWithPhoto;
}

const CATEGORY_LABELS: Record<string, string> = {
  flavor: 'Flavor',
  topping: 'Topping',
  sauce: 'Sauce',
  vessel: 'Vessel',
  extra: 'Extra',
};

const AVAILABILITY_LABELS: Record<string, { label: string; color: string }> = {
  seasonal: { label: 'Seasonal', color: 'bg-accent/10 text-accent-foreground border border-accent/20' },
  limited_drop: { label: 'Limited Drop', color: 'bg-warning/10 text-warning border border-warning/20' },
  flavor_of_day: { label: 'Flavor of the Day', color: 'bg-primary/10 text-primary border border-primary/20' },
  flavor_of_week: { label: 'Flavor of the Week', color: 'bg-primary/10 text-primary border border-primary/20' },
};

const EMOJI_BY_CATEGORY: Record<string, string> = {
  flavor: '🍦',
  topping: '🍫',
  sauce: '🍯',
  vessel: '🍧',
  extra: '✨',
};

const PEXELS_FALLBACK: Record<string, string> = {
  'Vanilla Bean Dream': pexelsUrl(IMAGES.flavors.vanilla, 'card'),
  'Dark Chocolate Obsession': pexelsUrl(IMAGES.flavors.chocolate, 'card'),
  'Strawberry Fields': pexelsUrl(IMAGES.flavors.strawberry, 'card'),
  'Salted Caramel Swirl': pexelsUrl(IMAGES.flavors.caramel, 'card'),
  'Sprinkle Rainbow': pexelsUrl(IMAGES.toppings.sprinkles, 'card'),
  'Hot Fudge': pexelsUrl(IMAGES.toppings.hot_fudge, 'card'),
  'Waffle Cone': pexelsUrl(IMAGES.vessels.waffle_cone, 'card'),
};

const CATEGORY_PEXELS_FALLBACK: Record<string, string> = {
  flavor: pexelsUrl(IMAGES.flavors.vanilla, 'card'),
  topping: pexelsUrl(IMAGES.toppings.sprinkles, 'card'),
  sauce: pexelsUrl(IMAGES.toppings.hot_fudge, 'card'),
  vessel: pexelsUrl(IMAGES.vessels.waffle_cone, 'card'),
  extra: pexelsUrl(IMAGES.flavors.vanilla, 'card'),
};

export function MenuItemCard({ item }: MenuItemCardProps) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const isScoop = item.category === 'flavor';
  const availabilityInfo = AVAILABILITY_LABELS[item.availabilityType];
  const showAvailabilityBadge = item.availabilityType !== 'permanent' && availabilityInfo;

  async function handleAddToCart() {
    setLoading(true);
    try {
      await addToCart(item.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      // silently handle — user may not be logged in
    } finally {
      setLoading(false);
    }
  }

  const price = parseFloat(item.price);

  return (
    <div
      className="group flex flex-col rounded-xl overflow-hidden bg-white transition-all duration-200"
      style={{
        boxShadow: '0 2px 8px -2px rgba(45, 36, 32, 0.06), 0 1px 3px -1px rgba(45, 36, 32, 0.04)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          '0 8px 16px -4px rgba(45, 36, 32, 0.10), 0 2px 6px -2px rgba(45, 36, 32, 0.05)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          '0 2px 8px -2px rgba(45, 36, 32, 0.06), 0 1px 3px -1px rgba(45, 36, 32, 0.04)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Image / Emoji placeholder */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {(item.photoUrl || PEXELS_FALLBACK[item.name] || CATEGORY_PEXELS_FALLBACK[item.category]) ? (
          <Image
            src={item.photoUrl || PEXELS_FALLBACK[item.name] || CATEGORY_PEXELS_FALLBACK[item.category]}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #FDF8F4, #FFF0F3)' }}
          >
            <span className="text-5xl select-none">
              {EMOJI_BY_CATEGORY[item.category] ?? '🍦'}
            </span>
          </div>
        )}

        {/* Availability badge — top right */}
        {showAvailabilityBadge && (
          <span
            className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-xs font-medium ${availabilityInfo.color}`}
          >
            {availabilityInfo.label}
          </span>
        )}

        {/* Category badge — top left */}
        <span className="absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-xs font-medium bg-white/90 text-foreground border border-border/60">
          {CATEGORY_LABELS[item.category]}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div className="flex-1">
          <h3
            className="text-lg leading-snug text-foreground mb-1"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            {item.name}
          </h3>
          {item.description && (
            <p
              className="text-sm leading-relaxed line-clamp-2"
              style={{ color: 'var(--foreground-secondary)' }}
            >
              {item.description}
            </p>
          )}
        </div>

        {/* Dietary badges */}
        {(item.isVegan || item.isDairyFree || item.isGlutenFree) && (
          <div className="flex flex-wrap gap-1.5">
            {item.isVegan && (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
                🌱 Vegan
              </span>
            )}
            {item.isDairyFree && (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]">
                🥛 Dairy-Free
              </span>
            )}
            {item.isGlutenFree && (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-[#F3E5F5] text-[#7B1FA2] border border-[#E1BEE7]">
                🌾 Gluten-Free
              </span>
            )}
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
            ${price.toFixed(2)}
          </span>

          <Button
            onClick={handleAddToCart}
            disabled={loading || !item.isAvailable}
            size="sm"
            variant={isScoop ? 'secondary' : 'default'}
            className="shrink-0"
          >
            {isScoop ? (
              <>
                <Wand2 className="h-3.5 w-3.5" />
                {loading ? 'Adding…' : added ? 'Added!' : 'Add to Scoop Lab'}
              </>
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5" />
                {loading ? 'Adding…' : added ? 'Added!' : 'Add to Cart'}
              </>
            )}
          </Button>
        </div>

        {/* Calories if present */}
        {item.calories !== null && (
          <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
            {item.calories} cal
          </p>
        )}
      </div>
    </div>
  );
}
