'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MenuItemCard } from '@/components/menu-item-card';
import { IMAGES, pexelsUrl } from '@/lib/imagery';
import type { MenuItemWithPhoto } from '@/types';

type Category = 'all' | 'flavor' | 'topping' | 'sauce' | 'vessel' | 'extra';

const TABS: { label: string; value: Category }[] = [
  { label: 'All', value: 'all' },
  { label: 'Flavors', value: 'flavor' },
  { label: 'Toppings', value: 'topping' },
  { label: 'Sauces', value: 'sauce' },
  { label: 'Vessels', value: 'vessel' },
  { label: 'Extras', value: 'extra' },
];

interface MenuClientProps {
  items: MenuItemWithPhoto[];
  cartItemCount: number;
}

export function MenuClient({ items, cartItemCount }: MenuClientProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const filtered =
    activeCategory === 'all'
      ? items
      : items.filter((item) => item.category === activeCategory);

  return (
    <div>
      {/* Filter tabs + cart button */}
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div
          className="flex items-center gap-1 p-1 rounded-xl overflow-x-auto"
          style={{ backgroundColor: 'var(--muted)' }}
        >
          {TABS.map((tab) => {
            const count =
              tab.value === 'all'
                ? items.length
                : items.filter((i) => i.category === tab.value).length;
            if (count === 0 && tab.value !== 'all') return null;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveCategory(tab.value)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all duration-150"
                style={{
                  backgroundColor:
                    activeCategory === tab.value ? 'white' : 'transparent',
                  color:
                    activeCategory === tab.value
                      ? 'var(--foreground)'
                      : 'var(--foreground-secondary)',
                  boxShadow:
                    activeCategory === tab.value
                      ? '0 1px 2px 0 rgba(45, 36, 32, 0.05)'
                      : 'none',
                }}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className="rounded-full px-1.5 py-0.5 text-xs"
                    style={{
                      backgroundColor:
                        activeCategory === tab.value
                          ? 'var(--muted)'
                          : 'transparent',
                      color: 'var(--foreground-muted)',
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {cartItemCount > 0 && (
          <Link href="/cart">
            <Button variant="primary" size="sm" className="shrink-0">
              <ShoppingCart className="h-4 w-4" />
              Cart ({cartItemCount})
            </Button>
          </Link>
        )}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center">
          <div className="mb-4 flex justify-center">
            <img
              src={pexelsUrl(IMAGES.hero.main, 'thumb')}
              alt="Assorted artisan ice cream scoops"
              width={200}
              height={200}
              className="rounded-full object-cover opacity-80"
            />
          </div>
          <h3
            className="text-xl mb-2"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            No items in this category yet
          </h3>
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            Check back soon — we update our menu regularly!
          </p>
        </div>
      )}
    </div>
  );
}
