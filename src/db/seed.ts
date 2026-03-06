/**
 * Scoopcraft — Development Seed Data
 *
 * Usage: npx tsx src/db/seed.ts
 * Requires DATABASE_URL environment variable
 */

import { db } from "./index"
import {
  users,
  menuItems,
  subscriptionPlans,
  achievementDefinitions,
} from "./schema"

async function seed() {
  console.log("Seeding database...")

  // 1. Admin user
  const [admin] = await db
    .insert(users)
    .values({
      email: "admin@scoopcraft.com",
      passwordHash: process.env.ADMIN_PASSWORD_HASH ?? "$argon2id$placeholder",
      role: "admin",
      firstName: "Admin",
      lastName: "Scoopcraft",
    })
    .onConflictDoNothing({ target: users.email })
    .returning()

  console.log("Admin user:", admin?.id ?? "already exists")

  // 2. Menu items (2 flavors, 2 toppings, 1 vessel)
  const menuItemValues = [
    {
      name: "Vanilla Bean",
      description: "Classic Madagascar vanilla bean ice cream",
      price: "5.99",
      category: "flavor" as const,
      allergens: ["dairy"],
      dietaryFlags: ["gluten-free"],
      calories: 250,
      sortOrder: 1,
    },
    {
      name: "Chocolate Fudge",
      description: "Rich dark chocolate fudge ice cream",
      price: "5.99",
      category: "flavor" as const,
      allergens: ["dairy"],
      dietaryFlags: ["gluten-free"],
      calories: 280,
      sortOrder: 2,
    },
    {
      name: "Sprinkles",
      description: "Rainbow sprinkles",
      price: "0.99",
      category: "topping" as const,
      allergens: [] as string[],
      dietaryFlags: ["vegan", "gluten-free"],
      calories: 25,
      sortOrder: 1,
    },
    {
      name: "Hot Fudge",
      description: "Warm chocolate fudge sauce",
      price: "1.49",
      category: "topping" as const,
      allergens: ["dairy"],
      dietaryFlags: ["gluten-free"],
      calories: 120,
      sortOrder: 2,
    },
    {
      name: "Waffle Cone",
      description: "Fresh-baked waffle cone",
      price: "1.99",
      category: "vessel" as const,
      allergens: ["gluten", "dairy"],
      dietaryFlags: [] as string[],
      calories: 160,
      sortOrder: 1,
    },
  ]

  const insertedItems = await db
    .insert(menuItems)
    .values(menuItemValues)
    .onConflictDoNothing()
    .returning()

  console.log("Menu items inserted:", insertedItems.length)

  // 3. Subscription plans
  const planValues = [
    {
      name: "Classic Box",
      description: "2 pints of our most popular flavors, delivered monthly",
      price: "29.99",
      stripePriceId: "price_classic_box_placeholder",
      stripeProductId: "prod_classic_box_placeholder",
      sortOrder: 1,
    },
    {
      name: "Deluxe Box",
      description: "4 pints with seasonal exclusives, delivered monthly",
      price: "49.99",
      stripePriceId: "price_deluxe_box_placeholder",
      stripeProductId: "prod_deluxe_box_placeholder",
      sortOrder: 2,
    },
    {
      name: "Premium Box",
      description: "6 pints with limited drops and toppings, delivered monthly",
      price: "79.99",
      stripePriceId: "price_premium_box_placeholder",
      stripeProductId: "prod_premium_box_placeholder",
      sortOrder: 3,
    },
  ]

  const insertedPlans = await db
    .insert(subscriptionPlans)
    .values(planValues)
    .onConflictDoNothing()
    .returning()

  console.log("Subscription plans inserted:", insertedPlans.length)

  // 4. Achievement definitions
  const achievementValues = [
    {
      name: "First Scoop",
      description: "Place your first order",
      icon: "ice-cream",
      conditionType: "order_count",
      conditionValue: 1,
    },
    {
      name: "Loyal Customer",
      description: "Place 10 orders",
      icon: "heart",
      conditionType: "order_count",
      conditionValue: 10,
    },
    {
      name: "Flavor Explorer",
      description: "Try 10 different flavors",
      icon: "compass",
      conditionType: "flavor_variety_count",
      conditionValue: 10,
    },
  ]

  const insertedAchievements = await db
    .insert(achievementDefinitions)
    .values(achievementValues)
    .onConflictDoNothing()
    .returning()

  console.log("Achievements inserted:", insertedAchievements.length)

  console.log("Seed complete!")
  process.exit(0)
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
