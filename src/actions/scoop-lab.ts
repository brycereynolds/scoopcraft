"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  menuItems,
  scoopLabConfigs,
  cartItems,
  carts,
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { ScoopLabConfig } from "@/types";

export type ScoopLabItem = {
  menuItemId: number;
  quantity: number;
  position?: number;
};

type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: string;
  category: "flavor" | "topping" | "sauce" | "vessel" | "extra";
  availabilityType: "permanent" | "seasonal" | "limited_drop" | "flavor_of_day" | "flavor_of_week";
  isAvailable: boolean;
  allergens: string[] | null;
  dietaryFlags: string[] | null;
  calories: number | null;
  photoUrl: string | null;
  sortOrder: number;
};

async function requireUser(): Promise<{ id: number; role: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: must be logged in");
  }
  return { id: parseInt(session.user.id, 10), role: session.user.role };
}

async function getOrCreateCart(userId: number): Promise<{ id: number }> {
  const [existing] = await db
    .select({ id: carts.id })
    .from(carts)
    .where(eq(carts.userId, userId));

  if (existing) return existing;

  const [created] = await db
    .insert(carts)
    .values({ userId })
    .returning({ id: carts.id });

  return created;
}

// ─── getScoopLabItems ─────────────────────────────────────────────────────────

export async function getScoopLabItems(): Promise<{
  flavors: MenuItem[];
  toppings: MenuItem[];
  sauces: MenuItem[];
  vessels: MenuItem[];
}> {
  const rows = await db
    .select({
      id: menuItems.id,
      name: menuItems.name,
      description: menuItems.description,
      price: menuItems.price,
      category: menuItems.category,
      availabilityType: menuItems.availabilityType,
      isAvailable: menuItems.isAvailable,
      allergens: menuItems.allergens,
      dietaryFlags: menuItems.dietaryFlags,
      calories: menuItems.calories,
      photoUrl: menuItems.photoUrl,
      sortOrder: menuItems.sortOrder,
    })
    .from(menuItems)
    .where(eq(menuItems.isAvailable, true))
    .orderBy(menuItems.sortOrder);

  const flavors: MenuItem[] = [];
  const toppings: MenuItem[] = [];
  const sauces: MenuItem[] = [];
  const vessels: MenuItem[] = [];

  for (const row of rows) {
    switch (row.category) {
      case "flavor":
        flavors.push(row);
        break;
      case "topping":
        toppings.push(row);
        break;
      case "sauce":
        sauces.push(row);
        break;
      case "vessel":
        vessels.push(row);
        break;
    }
  }

  return { flavors, toppings, sauces, vessels };
}

// ─── createScoopLabConfig ─────────────────────────────────────────────────────

export async function createScoopLabConfig(
  items: ScoopLabItem[]
): Promise<{ id: number; totalPrice: number }> {
  const user = await requireUser();

  if (items.length === 0) {
    throw new Error("Cannot create an empty Scoop Lab configuration");
  }

  const menuItemIds = items.map((i) => i.menuItemId);

  const fetchedItems = await db
    .select({
      id: menuItems.id,
      price: menuItems.price,
      category: menuItems.category,
      isAvailable: menuItems.isAvailable,
      allergens: menuItems.allergens,
      name: menuItems.name,
    })
    .from(menuItems)
    .where(inArray(menuItems.id, menuItemIds));

  if (fetchedItems.length !== menuItemIds.length) {
    throw new Error("One or more menu items not found");
  }

  const unavailableItem = fetchedItems.find((item) => !item.isAvailable);
  if (unavailableItem) {
    throw new Error(`"${unavailableItem.name}" is not currently available`);
  }

  const itemMap = new Map(fetchedItems.map((i) => [i.id, i]));

  // Calculate total price (quantity × unit price per item)
  let totalPrice = 0;
  for (const item of items) {
    const menuItem = itemMap.get(item.menuItemId);
    if (menuItem) {
      totalPrice += parseFloat(menuItem.price) * item.quantity;
    }
  }

  // Build the config JSON
  const flavors = items
    .filter((i) => itemMap.get(i.menuItemId)?.category === "flavor")
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  const toppings = items
    .filter((i) => itemMap.get(i.menuItemId)?.category === "topping")
    .flatMap((i) => Array(i.quantity).fill(i.menuItemId) as number[]);

  const sauces = items
    .filter((i) => itemMap.get(i.menuItemId)?.category === "sauce")
    .flatMap((i) => Array(i.quantity).fill(i.menuItemId) as number[]);

  const extras = items
    .filter((i) => itemMap.get(i.menuItemId)?.category === "extra")
    .flatMap((i) => Array(i.quantity).fill(i.menuItemId) as number[]);

  const vesselItem = items.find((i) => itemMap.get(i.menuItemId)?.category === "vessel");
  const vesselId = vesselItem?.menuItemId ?? 0;

  const scoopCount = flavors.reduce((sum, f) => sum + f.quantity, 0);

  const configJson: ScoopLabConfig = {
    vessel_id: vesselId,
    scoops: flavors.flatMap((f) =>
      Array.from({ length: f.quantity }, (_, idx) => ({
        flavor_id: f.menuItemId,
        scoop_number: idx + 1,
      }))
    ),
    toppings,
    sauces,
    extras,
    name: "",
    scoop_count: scoopCount,
  };

  // Collect allergen summary
  const allergenSummary = Array.from(
    new Set(
      fetchedItems.flatMap((item) => item.allergens ?? [])
    )
  );

  const [config] = await db
    .insert(scoopLabConfigs)
    .values({
      userId: user.id,
      configJson,
      calculatedPrice: totalPrice.toFixed(2),
      allergenSummary,
    })
    .returning({ id: scoopLabConfigs.id });

  revalidatePath("/scoop-lab");

  return { id: config.id, totalPrice: Math.round(totalPrice * 100) / 100 };
}

// ─── getScoopLabConfig ────────────────────────────────────────────────────────

export async function getScoopLabConfig(id: number): Promise<ScoopLabConfig> {
  await requireUser();

  const [config] = await db
    .select()
    .from(scoopLabConfigs)
    .where(eq(scoopLabConfigs.id, id));

  if (!config) throw new Error("Scoop Lab configuration not found");

  const raw = config.configJson as ScoopLabConfig;
  return {
    vessel_id: raw.vessel_id,
    scoops: raw.scoops,
    toppings: raw.toppings,
    sauces: raw.sauces,
    extras: raw.extras,
    name: config.name ?? raw.name ?? "",
    scoop_count: raw.scoop_count,
  };
}

// ─── addScoopLabToCart ────────────────────────────────────────────────────────

export async function addScoopLabToCart(
  configId: number,
  quantity: number
): Promise<{ id: number; cartId: number; menuItemId: number | null; scoopLabConfigId: number | null; quantity: number; unitPrice: string; createdAt: Date }> {
  const user = await requireUser();
  const cart = await getOrCreateCart(user.id);

  const [config] = await db
    .select({ id: scoopLabConfigs.id, calculatedPrice: scoopLabConfigs.calculatedPrice })
    .from(scoopLabConfigs)
    .where(eq(scoopLabConfigs.id, configId));

  if (!config) throw new Error("Scoop Lab configuration not found");

  const [created] = await db
    .insert(cartItems)
    .values({
      cartId: cart.id,
      menuItemId: null,
      scoopLabConfigId: config.id,
      quantity,
      unitPrice: config.calculatedPrice,
    })
    .returning();

  revalidatePath("/cart");
  revalidatePath("/checkout");

  return created;
}
