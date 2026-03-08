'use server';

import { auth } from '@/lib/auth';
import { db } from '@/db';
import { scoopLabConfigs, carts, cartItems, menuItems } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { redirect } from 'next/navigation';

interface ScoopLabItem {
  menuItemId: number;
  quantity: number;
  position?: number;
}

/**
 * Get or create a cart for the current user.
 */
async function getOrCreateCart(userId: number): Promise<number> {
  const [existing] = await db
    .select({ id: carts.id })
    .from(carts)
    .where(eq(carts.userId, userId))
    .limit(1);

  if (existing) return existing.id;

  const [created] = await db
    .insert(carts)
    .values({ userId })
    .returning({ id: carts.id });

  return created.id;
}

/**
 * Create a scoop lab configuration and return its ID.
 */
export async function createScoopLabConfig(
  items: ScoopLabItem[]
): Promise<{ id: number }> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const userId = parseInt(session.user.id, 10);

  // Calculate total price from items
  const menuItemIds = items.map((i) => i.menuItemId);
  const priceRows = await db
    .select({ id: menuItems.id, price: menuItems.price })
    .from(menuItems)
    .where(inArray(menuItems.id, menuItemIds));

  const priceMap = new Map(priceRows.map((r) => [r.id, parseFloat(r.price)]));
  const calculatedPrice = items.reduce(
    (total, item) => total + (priceMap.get(item.menuItemId) ?? 0) * item.quantity,
    0
  );

  const [config] = await db
    .insert(scoopLabConfigs)
    .values({
      userId,
      configJson: items,
      calculatedPrice: calculatedPrice.toFixed(2),
    })
    .returning({ id: scoopLabConfigs.id });

  return { id: config.id };
}

/**
 * Add a scoop lab configuration to the cart.
 */
export async function addScoopLabToCart(
  scoopLabConfigId: number,
  quantity: number = 1
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const userId = parseInt(session.user.id, 10);
  const cartId = await getOrCreateCart(userId);

  // Get the config's calculated price
  const [config] = await db
    .select({ calculatedPrice: scoopLabConfigs.calculatedPrice })
    .from(scoopLabConfigs)
    .where(eq(scoopLabConfigs.id, scoopLabConfigId))
    .limit(1);

  if (!config) throw new Error('Scoop lab config not found');

  await db.insert(cartItems).values({
    cartId,
    scoopLabConfigId,
    quantity,
    unitPrice: config.calculatedPrice,
  });
}
