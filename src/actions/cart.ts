'use server';

import { auth } from '@/lib/auth';
import { db } from '@/db';
import { carts, cartItems, menuItems } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { redirect } from 'next/navigation';

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
 * Add a menu item to the current user's cart.
 * Creates a new cart item or increments quantity if already exists.
 */
export async function addToCart(menuItemId: number, quantity: number = 1): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const userId = parseInt(session.user.id, 10);
  const cartId = await getOrCreateCart(userId);

  // Look up the item price
  const [item] = await db
    .select({ price: menuItems.price })
    .from(menuItems)
    .where(eq(menuItems.id, menuItemId))
    .limit(1);

  if (!item) throw new Error('Menu item not found');

  // Check if item already in cart
  const [existing] = await db
    .select({ id: cartItems.id, quantity: cartItems.quantity })
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.menuItemId, menuItemId)))
    .limit(1);

  if (existing) {
    await db
      .update(cartItems)
      .set({ quantity: existing.quantity + quantity })
      .where(eq(cartItems.id, existing.id));
  } else {
    await db.insert(cartItems).values({
      cartId,
      menuItemId,
      quantity,
      unitPrice: item.price,
    });
  }
}
