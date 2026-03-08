import { describe, it, expect } from "vitest"
import {
  users,
  menuItems,
  orders,
  orderItems,
  carts,
  cartItems,
  emailVerificationTokens,
  passwordResetTokens,
  loginAttempts,
  loyaltyAccounts,
  loyaltyTransactions,
  promoCodes,
  promoUsages,
  reviews,
  favorites,
  subscriptions,
  subscriptionPlans,
  scoopLabConfigs,
  deliveryZones,
  deliverySlots,
  itemPhotos,
  achievementDefinitions,
  userAchievements,
  quizResults,
  flavorSubmissions,
  flavorVotes,
  emailCampaigns,
  emailUnsubscribes,
  referralConversions,
  savedPaymentMethods,
  orderStatusLog,
  adminAuditLog,
} from "@/db/schema"

describe("Database Schema", () => {
  it("exports all 32 tables", () => {
    const tables = [
      users,
      menuItems,
      orders,
      orderItems,
      carts,
      cartItems,
      emailVerificationTokens,
      passwordResetTokens,
      loginAttempts,
      loyaltyAccounts,
      loyaltyTransactions,
      promoCodes,
      promoUsages,
      reviews,
      favorites,
      subscriptions,
      subscriptionPlans,
      scoopLabConfigs,
      deliveryZones,
      deliverySlots,
      itemPhotos,
      achievementDefinitions,
      userAchievements,
      quizResults,
      flavorSubmissions,
      flavorVotes,
      emailCampaigns,
      emailUnsubscribes,
      referralConversions,
      savedPaymentMethods,
      orderStatusLog,
      adminAuditLog,
    ]
    tables.forEach((table) => {
      expect(table).toBeDefined()
    })
    expect(tables).toHaveLength(32)
  })

  it("users table has required columns", () => {
    const columnNames = Object.keys(users)
    expect(columnNames).toContain("id")
    expect(columnNames).toContain("email")
    expect(columnNames).toContain("passwordHash")
    expect(columnNames).toContain("role")
    expect(columnNames).toContain("firstName")
    expect(columnNames).toContain("lastName")
    expect(columnNames).toContain("emailVerifiedAt")
    expect(columnNames).toContain("referralCode")
    expect(columnNames).toContain("createdAt")
  })

  it("menuItems table has required columns", () => {
    const columnNames = Object.keys(menuItems)
    expect(columnNames).toContain("id")
    expect(columnNames).toContain("name")
    expect(columnNames).toContain("price")
    expect(columnNames).toContain("category")
    expect(columnNames).toContain("isAvailable")
    expect(columnNames).toContain("allergens")
    expect(columnNames).toContain("dietaryFlags")
    expect(columnNames).toContain("photoUrl")
  })

  it("orders table has financial columns", () => {
    const columnNames = Object.keys(orders)
    expect(columnNames).toContain("subtotal")
    expect(columnNames).toContain("discountAmount")
    expect(columnNames).toContain("tipAmount")
    expect(columnNames).toContain("taxAmount")
    expect(columnNames).toContain("total")
    expect(columnNames).toContain("stripePaymentIntentId")
    expect(columnNames).toContain("orderType")
    expect(columnNames).toContain("status")
  })

  it("orderItems table references orders and menuItems", () => {
    const columnNames = Object.keys(orderItems)
    expect(columnNames).toContain("orderId")
    expect(columnNames).toContain("menuItemId")
    expect(columnNames).toContain("quantity")
    expect(columnNames).toContain("unitPrice")
    expect(columnNames).toContain("linePrice")
  })

  it("loyaltyAccounts table tracks tier and points", () => {
    const columnNames = Object.keys(loyaltyAccounts)
    expect(columnNames).toContain("userId")
    expect(columnNames).toContain("pointsBalance")
    expect(columnNames).toContain("tier")
  })

  it("scoopLabConfigs table stores custom builds", () => {
    const columnNames = Object.keys(scoopLabConfigs)
    expect(columnNames).toContain("configJson")
    expect(columnNames).toContain("calculatedPrice")
    expect(columnNames).toContain("shareSlug")
    expect(columnNames).toContain("isPublic")
  })
})
