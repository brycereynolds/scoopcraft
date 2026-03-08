export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getCategoryStats } from '@/actions/admin';

const MENU_CATEGORIES = ['flavor', 'topping', 'sauce', 'vessel', 'extra'] as const;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IceCream, ArrowRight } from 'lucide-react';

const CATEGORY_META: Record<
  string,
  { label: string; description: string; color: string; bg: string }
> = {
  flavor: {
    label: 'Flavors',
    description: 'Ice cream base flavors',
    color: '#9B1D4A',
    bg: '#FDE8F0',
  },
  topping: {
    label: 'Toppings',
    description: 'Crunchy and fun toppings',
    color: '#92400E',
    bg: '#FEF3C7',
  },
  sauce: {
    label: 'Sauces',
    description: 'Drizzles and sauces',
    color: '#1E40AF',
    bg: '#DBEAFE',
  },
  vessel: {
    label: 'Vessels',
    description: 'Cones, cups, and waffle bowls',
    color: '#065F46',
    bg: '#D1FAE5',
  },
  extra: {
    label: 'Extras',
    description: 'Add-ons and special items',
    color: '#5B21B6',
    bg: '#EDE9FE',
  },
};

export default async function AdminCategoriesPage() {
  const stats = await getCategoryStats();
  const totalItems = stats.reduce((sum, s) => sum + s.total, 0);
  const totalAvailable = stats.reduce((sum, s) => sum + s.available, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
            Categories
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--foreground-muted)' }}>
            Overview of menu categories. Manage individual items via the Menu Items page.
          </p>
        </div>
        <Link
          href="/admin/menu"
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          style={{ borderColor: 'var(--border)', color: 'var(--foreground-secondary)' }}
        >
          <IceCream className="h-4 w-4" />
          Manage Items
        </Link>
      </div>

      {/* Summary bar */}
      <div
        className="rounded-xl border p-4 flex flex-wrap gap-6"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--foreground-muted)' }}>
            Total Items
          </p>
          <p className="text-2xl font-bold mt-0.5" style={{ color: 'var(--foreground)' }}>
            {totalItems}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--foreground-muted)' }}>
            Available
          </p>
          <p className="text-2xl font-bold mt-0.5" style={{ color: '#166534' }}>
            {totalAvailable}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--foreground-muted)' }}>
            Hidden
          </p>
          <p className="text-2xl font-bold mt-0.5" style={{ color: '#991B1B' }}>
            {totalItems - totalAvailable}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--foreground-muted)' }}>
            Categories
          </p>
          <p className="text-2xl font-bold mt-0.5" style={{ color: 'var(--foreground)' }}>
            {MENU_CATEGORIES.length}
          </p>
        </div>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const meta = CATEGORY_META[stat.category];
          const hiddenCount = stat.total - stat.available;
          return (
            <Card
              key={stat.category}
              className="border overflow-hidden"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: meta.bg }}
                    >
                      <IceCream className="h-4 w-4" style={{ color: meta.color }} />
                    </div>
                    <div>
                      <CardTitle
                        className="text-base font-semibold"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {meta.label}
                      </CardTitle>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--foreground-muted)' }}>
                        {meta.description}
                      </p>
                    </div>
                  </div>
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
                    style={{ backgroundColor: meta.bg, color: meta.color }}
                  >
                    {stat.category}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div
                    className="rounded-lg p-2"
                    style={{ backgroundColor: 'var(--muted)' }}
                  >
                    <p className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                      {stat.total}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                      Total
                    </p>
                  </div>
                  <div
                    className="rounded-lg p-2"
                    style={{ backgroundColor: stat.available > 0 ? '#F0FDF4' : 'var(--muted)' }}
                  >
                    <p
                      className="text-lg font-bold"
                      style={{ color: stat.available > 0 ? '#166534' : 'var(--foreground-muted)' }}
                    >
                      {stat.available}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                      Available
                    </p>
                  </div>
                  <div
                    className="rounded-lg p-2"
                    style={{ backgroundColor: hiddenCount > 0 ? '#FEF2F2' : 'var(--muted)' }}
                  >
                    <p
                      className="text-lg font-bold"
                      style={{ color: hiddenCount > 0 ? '#991B1B' : 'var(--foreground-muted)' }}
                    >
                      {hiddenCount}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                      Hidden
                    </p>
                  </div>
                </div>

                {stat.outOfStock > 0 && (
                  <div
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium"
                    style={{ backgroundColor: '#FEF9C3', color: '#854D0E' }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-600 shrink-0" />
                    {stat.outOfStock} item{stat.outOfStock !== 1 ? 's' : ''} out of stock
                  </div>
                )}

                <Link
                  href={`/admin/menu?category=${stat.category}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                  style={{ color: 'var(--foreground-secondary)' }}
                >
                  <span>View {meta.label}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
