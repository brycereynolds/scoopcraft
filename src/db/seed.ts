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
  deliverySlots,
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

  // 2. Menu items — flavors, toppings, sauces, vessels
  const menuItemValues = [
    {
      name: "Vanilla Bean Dream",
      description: "Classic Madagascar vanilla bean ice cream — smooth, rich, timeless.",
      price: "8.50",
      category: "flavor" as const,
      availabilityType: "permanent" as const,
      allergens: ["dairy"],
      dietaryFlags: ["gluten-free"],
      calories: 250,
      sortOrder: 1,
    },
    {
      name: "Dark Chocolate Obsession",
      description: "Intensely rich dark chocolate ice cream with a velvety finish.",
      price: "9.00",
      category: "flavor" as const,
      availabilityType: "permanent" as const,
      allergens: ["dairy"],
      dietaryFlags: ["gluten-free"],
      calories: 290,
      sortOrder: 2,
    },
    {
      name: "Strawberry Fields",
      description: "Sun-ripened strawberries blended into a fresh, fruity scoop.",
      price: "8.50",
      category: "flavor" as const,
      availabilityType: "permanent" as const,
      allergens: ["dairy"],
      dietaryFlags: ["gluten-free"],
      calories: 230,
      sortOrder: 3,
    },
    {
      name: "Salted Caramel Swirl",
      description: "Buttery caramel ribbons through a lightly salted cream base. Seasonal favorite.",
      price: "9.50",
      category: "flavor" as const,
      availabilityType: "seasonal" as const,
      allergens: ["dairy"],
      dietaryFlags: ["gluten-free"],
      calories: 310,
      sortOrder: 4,
    },
    {
      name: "Sprinkle Rainbow",
      description: "Festive rainbow sprinkles — the classic finish.",
      price: "1.00",
      category: "topping" as const,
      availabilityType: "permanent" as const,
      allergens: [] as string[],
      dietaryFlags: ["vegan", "gluten-free"],
      calories: 20,
      sortOrder: 1,
    },
    {
      name: "Hot Fudge",
      description: "Warm, silky chocolate fudge sauce poured fresh.",
      price: "1.50",
      category: "sauce" as const,
      availabilityType: "permanent" as const,
      allergens: ["dairy"],
      dietaryFlags: ["gluten-free"],
      calories: 110,
      sortOrder: 1,
    },
    {
      name: "Waffle Cone",
      description: "Fresh-baked golden waffle cone with a satisfying crunch.",
      price: "2.00",
      category: "vessel" as const,
      availabilityType: "permanent" as const,
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
      // Classic Box — $25/month (2 pints, free shipping, early flavor access, Sprinkle tier loyalty)
      name: "Classic Box",
      description: "Two handcrafted pints delivered monthly — our most popular flavors curated fresh.",
      price: "25.00",
      stripePriceId: "price_classic_monthly_placeholder",
      stripeProductId: "prod_classic_box_placeholder",
      sortOrder: 1,
    },
    {
      // Deluxe Box — $45/month (4 pints, priority shipping, exclusive flavors, bonus points, Swirl tier loyalty)
      name: "Deluxe Box",
      description: "Four premium pints plus exclusive seasonal creations and a surprise treat.",
      price: "45.00",
      stripePriceId: "price_deluxe_monthly_placeholder",
      stripeProductId: "prod_deluxe_box_placeholder",
      sortOrder: 2,
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

  // 5. Delivery slots — next 7 days, 4 slots per day
  const slotTimes = [
    { startTime: "09:00", endTime: "11:00", label: "morning" },
    { startTime: "11:00", endTime: "13:00", label: "midday" },
    { startTime: "14:00", endTime: "16:00", label: "afternoon" },
    { startTime: "18:00", endTime: "20:00", label: "evening" },
  ]

  const deliverySlotValues: Array<{
    slotDate: string;
    startTime: string;
    endTime: string;
    maxOrders: number;
    isActive: boolean;
  }> = []

  for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
    const date = new Date()
    date.setDate(date.getDate() + dayOffset)
    const slotDate = date.toISOString().split("T")[0]

    for (const slot of slotTimes) {
      deliverySlotValues.push({
        slotDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
        maxOrders: 10,
        isActive: true,
      })
    }
  }

  const insertedSlots = await db
    .insert(deliverySlots)
    .values(deliverySlotValues)
    .onConflictDoNothing()
    .returning()

  console.log("Delivery slots inserted:", insertedSlots.length)

  console.log("Seed complete!")
  process.exit(0)
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
