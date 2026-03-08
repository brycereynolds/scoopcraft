export const dynamic = 'force-dynamic';

import { getMenuItems } from '@/actions/admin';
import { MenuItemsClient } from './menu-client';

type PageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function AdminMenuPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = params.category ?? 'all';

  const items = await getMenuItems(category !== 'all' ? category : undefined);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
          Menu Items
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--foreground-muted)' }}>
          Manage your ice cream menu — flavors, toppings, sauces, and more.
        </p>
      </div>

      <MenuItemsClient items={items} initialCategory={category} />
    </div>
  );
}
