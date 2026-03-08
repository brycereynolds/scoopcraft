export const dynamic = 'force-dynamic';
import { db } from '@/db';
import { menuItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { MenuClient } from './menu-client';
import type { MenuItemWithPhoto } from '@/types';

export const metadata = {
  title: 'Menu — ScoopCraft',
  description: 'Browse our full menu of artisan ice cream flavors, toppings, sauces, and more.',
};

async function getMenuItems(): Promise<MenuItemWithPhoto[]> {
  try {
    const rows = await db
      .select({
        id: menuItems.id,
        name: menuItems.name,
        description: menuItems.description,
        price: menuItems.price,
        category: menuItems.category,
        photoUrl: menuItems.photoUrl,
        dietaryFlags: menuItems.dietaryFlags,
        isAvailable: menuItems.isAvailable,
        availabilityType: menuItems.availabilityType,
        calories: menuItems.calories,
        sortOrder: menuItems.sortOrder,
      })
      .from(menuItems)
      .where(eq(menuItems.isAvailable, true))
      .orderBy(menuItems.sortOrder, menuItems.name);

    return rows.map((row) => {
      const flags = row.dietaryFlags ?? [];
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price,
        category: row.category,
        photoUrl: row.photoUrl,
        isVegan: flags.includes('vegan'),
        isDairyFree: flags.includes('dairy-free'),
        isGlutenFree: flags.includes('gluten-free'),
        isAvailable: row.isAvailable,
        availabilityType: row.availabilityType,
        calories: row.calories,
      };
    });
  } catch {
    return [];
  }
}

export default async function MenuPage() {
  const items = await getMenuItems();

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Page header */}
      <div
        className="border-b"
        style={{
          background: 'linear-gradient(135deg, #FFF8F0, #FEFAE0)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <h1
            className="text-4xl md:text-5xl mb-3"
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              color: 'var(--foreground)',
            }}
          >
            Our Menu
          </h1>
          <p
            className="text-lg max-w-xl"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            Handcrafted in small batches with premium, locally sourced ingredients.
            Every scoop is made with love.
          </p>
        </div>
      </div>

      {/* Menu content */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-10">
        <MenuClient items={items} cartItemCount={0} />
      </div>
    </div>
  );
}
