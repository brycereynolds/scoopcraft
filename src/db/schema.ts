/**
 * Scoopcraft — Drizzle ORM Schema
 * PostgreSQL 17 / Drizzle ORM
 */

import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
  varchar,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["customer", "admin"]);

export const menuItemCategoryEnum = pgEnum("menu_item_category", [
  "flavor",
  "topping",
  "sauce",
  "vessel",
  "extra",
]);

export const availabilityTypeEnum = pgEnum("availability_type", [
  "permanent",
  "seasonal",
  "limited_drop",
  "flavor_of_day",
  "flavor_of_week",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
  "cancelled",
]);

export const orderTypeEnum = pgEnum("order_type", ["delivery", "pickup"]);

export const discountTypeEnum = pgEnum("discount_type", ["percentage", "fixed"]);

export const loyaltyTierEnum = pgEnum("loyalty_tier", [
  "sprinkle",
  "swirl",
  "sundae_supreme",
]);

export const loyaltyTransactionReasonEnum = pgEnum("loyalty_transaction_reason", [
  "order_earned",
  "first_order_bonus",
  "referral_reward",
  "review_bonus",
  "birthday_bonus",
  "redemption",
  "admin_adjustment",
  "achievement_bonus",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "paused",
  "cancelled",
  "past_due",
]);

export const flavorSubmissionStatusEnum = pgEnum("flavor_submission_status", [
  "pending",
  "approved",
  "rejected",
  "archived",
  "on_menu",
]);

export const emailCampaignStatusEnum = pgEnum("email_campaign_status", [
  "draft",
  "scheduled",
  "sending",
  "sent",
  "failed",
]);

export const emailAudienceTypeEnum = pgEnum("email_audience_type", [
  "all",
  "loyalty_sprinkle",
  "loyalty_swirl",
  "loyalty_sundae_supreme",
  "subscribers_only",
  "inactive_30_days",
]);

export const deliveryZoneTypeEnum = pgEnum("delivery_zone_type", [
  "postal_code",
  "radius_km",
]);

// ─────────────────────────────────────────────
// AUTH & USERS
// ─────────────────────────────────────────────

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").default("customer").notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    phone: text("phone"),
    smsOptIn: boolean("sms_opt_in").default(false).notNull(),
    birthdayMonth: integer("birthday_month"), // 1-12
    birthdayDay: integer("birthday_day"),     // 1-31
    emailVerifiedAt: timestamp("email_verified_at"),
    referralCode: varchar("referral_code", { length: 12 }).unique(),
    referredByUserId: integer("referred_by_user_id"),
    stripCustomerId: text("stripe_customer_id").unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("users_email_idx").on(t.email),
    index("users_referral_code_idx").on(t.referralCode),
  ]
);

export const emailVerificationTokens = pgTable(
  "email_verification_tokens",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("evt_user_id_idx").on(t.userId)]
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("prt_user_id_idx").on(t.userId)]
);

export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    ipAddress: text("ip_address"),
    success: boolean("success").notNull(),
    attemptedAt: timestamp("attempted_at").defaultNow().notNull(),
  },
  (t) => [index("login_attempts_email_idx").on(t.email, t.attemptedAt)]
);

// ─────────────────────────────────────────────
// MENU / INVENTORY
// ─────────────────────────────────────────────

export const menuItems = pgTable(
  "menu_items",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    category: menuItemCategoryEnum("category").notNull(),
    availabilityType: availabilityTypeEnum("availability_type").default("permanent").notNull(),
    isAvailable: boolean("is_available").default(true).notNull(),
    seasonStart: date("season_start"),
    seasonEnd: date("season_end"),
    stockCount: integer("stock_count"),        // null = unlimited
    stockTrackingEnabled: boolean("stock_tracking_enabled").default(false).notNull(),
    allergens: text("allergens").array(),      // ["peanuts", "dairy", "gluten"]
    dietaryFlags: text("dietary_flags").array(), // ["vegan", "nut-free", "gluten-free"]
    calories: integer("calories"),
    fatGrams: decimal("fat_grams", { precision: 5, scale: 1 }),
    carbGrams: decimal("carb_grams", { precision: 5, scale: 1 }),
    sortOrder: integer("sort_order").default(0).notNull(),
    photoUrl: text("photo_url"),               // primary CDN URL
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    createdByAdminId: integer("created_by_admin_id").references(() => users.id),
  },
  (t) => [
    index("menu_items_category_idx").on(t.category),
    index("menu_items_available_idx").on(t.isAvailable),
    index("menu_items_availability_type_idx").on(t.availabilityType),
  ]
);

export const itemPhotos = pgTable(
  "item_photos",
  {
    id: serial("id").primaryKey(),
    menuItemId: integer("menu_item_id").notNull().references(() => menuItems.id, { onDelete: "cascade" }),
    url400: text("url_400").notNull(),
    url800: text("url_800").notNull(),
    url1200: text("url_1200").notNull(),
    r2Key: text("r2_key").notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
    uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
    uploadedByAdminId: integer("uploaded_by_admin_id").references(() => users.id),
  },
  (t) => [index("item_photos_menu_item_idx").on(t.menuItemId)]
);

// ─────────────────────────────────────────────
// SCOOP LAB CONFIGURATIONS
// ─────────────────────────────────────────────

/**
 * A saved Scoop Lab creation — used by cart items and favorites.
 * configJson stores the full build: { vessel_id, scoops: [{flavor_id, scoop_number}],
 * toppings: [item_id], sauces: [item_id], extras: [item_id], name, scoop_count }
 */
export const scoopLabConfigs = pgTable(
  "scoop_lab_configs",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    sessionId: text("session_id"),            // for guest carts
    name: varchar("name", { length: 40 }),
    configJson: jsonb("config_json").notNull(),
    calculatedPrice: decimal("calculated_price", { precision: 10, scale: 2 }).notNull(),
    allergenSummary: text("allergen_summary").array(),
    isPublic: boolean("is_public").default(false).notNull(),
    shareSlug: varchar("share_slug", { length: 20 }).unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("scoop_lab_configs_user_idx").on(t.userId),
    index("scoop_lab_configs_share_slug_idx").on(t.shareSlug),
  ]
);

// ─────────────────────────────────────────────
// CART
// ─────────────────────────────────────────────

export const carts = pgTable(
  "carts",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    sessionId: text("session_id"),            // for guest carts
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("carts_user_id_idx").on(t.userId),
    index("carts_session_id_idx").on(t.sessionId),
  ]
);

export const cartItems = pgTable(
  "cart_items",
  {
    id: serial("id").primaryKey(),
    cartId: integer("cart_id").notNull().references(() => carts.id, { onDelete: "cascade" }),
    menuItemId: integer("menu_item_id").references(() => menuItems.id),
    scoopLabConfigId: integer("scoop_lab_config_id").references(() => scoopLabConfigs.id),
    quantity: integer("quantity").default(1).notNull(),
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("cart_items_cart_id_idx").on(t.cartId)]
);

// ─────────────────────────────────────────────
// DELIVERY
// ─────────────────────────────────────────────

export const deliveryZones = pgTable(
  "delivery_zones",
  {
    id: serial("id").primaryKey(),
    zoneType: deliveryZoneTypeEnum("zone_type").notNull(),
    value: text("value").notNull(),            // postal code string OR radius in km
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  }
);

export const deliverySlots = pgTable(
  "delivery_slots",
  {
    id: serial("id").primaryKey(),
    slotDate: date("slot_date").notNull(),
    startTime: text("start_time").notNull(),   // "14:00"
    endTime: text("end_time").notNull(),       // "15:00"
    maxOrders: integer("max_orders").notNull(),
    bookedCount: integer("booked_count").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("delivery_slots_date_idx").on(t.slotDate),
    uniqueIndex("delivery_slots_unique_idx").on(t.slotDate, t.startTime),
  ]
);

// ─────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    status: orderStatusEnum("status").default("pending").notNull(),
    orderType: orderTypeEnum("order_type").notNull(),

    // Delivery details
    deliveryAddress: jsonb("delivery_address"),      // { street, city, state, zip }
    deliverySlotId: integer("delivery_slot_id").references(() => deliverySlots.id),
    estimatedDeliveryAt: timestamp("estimated_delivery_at"),

    // Financials
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0").notNull(),
    tipAmount: decimal("tip_amount", { precision: 10, scale: 2 }).default("0").notNull(),
    taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull(),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),
    loyaltyPointsEarned: integer("loyalty_points_earned").default(0).notNull(),
    loyaltyPointsRedeemed: integer("loyalty_points_redeemed").default(0).notNull(),
    promoCodeId: integer("promo_code_id").references(() => promoCodes.id),

    // Stripe
    stripePaymentIntentId: text("stripe_payment_intent_id").unique(),
    stripeChargeId: text("stripe_charge_id"),
    stripeRefundId: text("stripe_refund_id"),

    // Timing
    editWindowExpiresAt: timestamp("edit_window_expires_at"),  // 2min after submission
    confirmedAt: timestamp("confirmed_at"),
    deliveredAt: timestamp("delivered_at"),
    cancelledAt: timestamp("cancelled_at"),
    cancellationReason: text("cancellation_reason"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("orders_user_id_idx").on(t.userId),
    index("orders_status_idx").on(t.status),
    index("orders_created_at_idx").on(t.createdAt),
    index("orders_stripe_pi_idx").on(t.stripePaymentIntentId),
  ]
);

export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    menuItemId: integer("menu_item_id").references(() => menuItems.id, { onDelete: "set null" }),
    scoopLabConfigId: integer("scoop_lab_config_id").references(() => scoopLabConfigs.id),
    quantity: integer("quantity").notNull(),
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
    linePrice: decimal("line_price", { precision: 10, scale: 2 }).notNull(),
    customizationJson: jsonb("customization_json"),  // snapshot of config at order time
    itemNameSnapshot: text("item_name_snapshot").notNull(), // denormalized for history
  },
  (t) => [index("order_items_order_id_idx").on(t.orderId)]
);

export const orderStatusLog = pgTable(
  "order_status_log",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    fromStatus: orderStatusEnum("from_status"),
    toStatus: orderStatusEnum("to_status").notNull(),
    changedByAdminId: integer("changed_by_admin_id").references(() => users.id),
    note: text("note"),
    changedAt: timestamp("changed_at").defaultNow().notNull(),
  },
  (t) => [index("order_status_log_order_id_idx").on(t.orderId)]
);

// ─────────────────────────────────────────────
// PAYMENTS / STRIPE
// ─────────────────────────────────────────────

export const savedPaymentMethods = pgTable(
  "saved_payment_methods",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    stripePaymentMethodId: text("stripe_payment_method_id").notNull().unique(),
    brand: text("brand"),          // "visa", "mastercard"
    last4: varchar("last4", { length: 4 }),
    expMonth: integer("exp_month"),
    expYear: integer("exp_year"),
    isDefault: boolean("is_default").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("saved_pm_user_id_idx").on(t.userId)]
);

// ─────────────────────────────────────────────
// PROMOTIONS
// ─────────────────────────────────────────────

export const promoCodes = pgTable(
  "promo_codes",
  {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 50 }).notNull().unique(),
    discountType: discountTypeEnum("discount_type").notNull(),
    discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
    minOrderValue: decimal("min_order_value", { precision: 10, scale: 2 }),
    usageLimit: integer("usage_limit"),           // null = unlimited
    perCustomerLimit: integer("per_customer_limit").default(1),
    totalUsed: integer("total_used").default(0).notNull(),
    expiresAt: timestamp("expires_at"),
    isActive: boolean("is_active").default(true).notNull(),
    targetLoyaltyTier: loyaltyTierEnum("target_loyalty_tier"),  // null = all tiers
    applicableTo: text("applicable_to").default("all"),          // "all" | "subscriptions" | "menu_category:flavor"
    createdByAdminId: integer("created_by_admin_id").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("promo_codes_code_idx").on(t.code)]
);

export const promoUsages = pgTable(
  "promo_usages",
  {
    id: serial("id").primaryKey(),
    promoCodeId: integer("promo_code_id").notNull().references(() => promoCodes.id),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    orderId: integer("order_id").references(() => orders.id),
    usedAt: timestamp("used_at").defaultNow().notNull(),
  },
  (t) => [
    index("promo_usages_code_idx").on(t.promoCodeId),
    index("promo_usages_user_idx").on(t.userId),
  ]
);

// ─────────────────────────────────────────────
// LOYALTY PROGRAM
// ─────────────────────────────────────────────

export const loyaltyAccounts = pgTable(
  "loyalty_accounts",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
    pointsBalance: integer("points_balance").default(0).notNull(),
    tier: loyaltyTierEnum("tier").default("sprinkle").notNull(),
    birthdayPromoSentYear: integer("birthday_promo_sent_year"),  // track annual birthday email
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  }
);

export const loyaltyTransactions = pgTable(
  "loyalty_transactions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    pointsDelta: integer("points_delta").notNull(),  // positive = earned, negative = redeemed
    reason: loyaltyTransactionReasonEnum("reason").notNull(),
    referenceId: integer("reference_id"),             // order_id, review_id, etc.
    adminNote: text("admin_note"),                    // for admin_adjustment
    adjustedByAdminId: integer("adjusted_by_admin_id").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("loyalty_tx_user_id_idx").on(t.userId),
    index("loyalty_tx_created_at_idx").on(t.createdAt),
  ]
);

// ─────────────────────────────────────────────
// REFERRALS
// ─────────────────────────────────────────────

export const referralConversions = pgTable(
  "referral_conversions",
  {
    id: serial("id").primaryKey(),
    referrerUserId: integer("referrer_user_id").notNull().references(() => users.id),
    refereeUserId: integer("referee_user_id").notNull().references(() => users.id),
    firstOrderId: integer("first_order_id").references(() => orders.id),
    referrerPointsAwarded: integer("referrer_points_awarded").default(200),
    refereePointsAwarded: integer("referee_points_awarded").default(200),
    convertedAt: timestamp("converted_at").defaultNow().notNull(),
  },
  (t) => [
    index("referral_conversions_referrer_idx").on(t.referrerUserId),
    uniqueIndex("referral_conversions_referee_unique_idx").on(t.refereeUserId), // one referral per referee
  ]
);

// ─────────────────────────────────────────────
// SUBSCRIPTIONS — SCOOPCRAFT CLUB
// ─────────────────────────────────────────────

export const subscriptionPlans = pgTable(
  "subscription_plans",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    stripePriceId: text("stripe_price_id").notNull().unique(),
    stripeProductId: text("stripe_product_id").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  }
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    planId: integer("plan_id").notNull().references(() => subscriptionPlans.id),
    stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
    status: subscriptionStatusEnum("status").notNull(),
    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
    isGift: boolean("is_gift").default(false).notNull(),
    giftRecipientEmail: text("gift_recipient_email"),
    giftActivatedAt: timestamp("gift_activated_at"),
    paymentFailedAt: timestamp("payment_failed_at"),
    paymentRetryCount: integer("payment_retry_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("subscriptions_user_id_idx").on(t.userId),
    index("subscriptions_stripe_id_idx").on(t.stripeSubscriptionId),
  ]
);

// ─────────────────────────────────────────────
// REVIEWS
// ─────────────────────────────────────────────

export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    menuItemId: integer("menu_item_id").references(() => menuItems.id, { onDelete: "cascade" }),
    scoopLabConfigId: integer("scoop_lab_config_id").references(() => scoopLabConfigs.id),
    orderId: integer("order_id").references(() => orders.id),  // verified purchase gate
    rating: integer("rating").notNull(),           // 1-5
    body: text("body"),
    photoUrl: text("photo_url"),
    photoR2Key: text("photo_r2_key"),
    isApproved: boolean("is_approved").default(true).notNull(),
    isHidden: boolean("is_hidden").default(false).notNull(),
    adminResponse: text("admin_response"),
    adminResponseAt: timestamp("admin_response_at"),
    helpfulCount: integer("helpful_count").default(0).notNull(),
    pointsAwarded: boolean("points_awarded").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("reviews_menu_item_idx").on(t.menuItemId),
    index("reviews_user_id_idx").on(t.userId),
    index("reviews_created_at_idx").on(t.createdAt),
  ]
);

// ─────────────────────────────────────────────
// FAVORITES
// ─────────────────────────────────────────────

export const favorites = pgTable(
  "favorites",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: text("name"),
    menuItemId: integer("menu_item_id").references(() => menuItems.id),
    scoopLabConfigId: integer("scoop_lab_config_id").references(() => scoopLabConfigs.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("favorites_user_id_idx").on(t.userId)]
);

// ─────────────────────────────────────────────
// ACHIEVEMENTS & BADGES
// ─────────────────────────────────────────────

export const achievementDefinitions = pgTable(
  "achievement_definitions",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    icon: text("icon"),                           // emoji or icon name
    conditionType: text("condition_type").notNull(), // "order_count", "referral_count", "review_count", "flavor_variety_count", "tier_reached", "birthday_order"
    conditionValue: integer("condition_value"),    // threshold value
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  }
);

export const userAchievements = pgTable(
  "user_achievements",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    achievementId: integer("achievement_id").notNull().references(() => achievementDefinitions.id),
    emailSent: boolean("email_sent").default(false).notNull(),
    unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
  },
  (t) => [
    index("user_achievements_user_id_idx").on(t.userId),
    uniqueIndex("user_achievements_unique_idx").on(t.userId, t.achievementId),
  ]
);

// ─────────────────────────────────────────────
// PERSONALITY QUIZ
// ─────────────────────────────────────────────

export const quizResults = pgTable(
  "quiz_results",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    sessionId: text("session_id"),                // for guests
    personalityType: text("personality_type").notNull(),  // "The Classic", "The Adventurer", etc.
    recommendedFlavorId: integer("recommended_flavor_id").references(() => menuItems.id),
    answersJson: jsonb("answers_json"),            // snapshot of quiz answers
    shareSlug: varchar("share_slug", { length: 20 }).unique(),
    takenAt: timestamp("taken_at").defaultNow().notNull(),
  },
  (t) => [
    index("quiz_results_user_id_idx").on(t.userId),
    index("quiz_results_share_slug_idx").on(t.shareSlug),
  ]
);

// ─────────────────────────────────────────────
// FLAVOR LAB (COMMUNITY SUBMISSIONS)
// ─────────────────────────────────────────────

export const flavorSubmissions = pgTable(
  "flavor_submissions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: varchar("description", { length: 300 }),
    photoUrl: text("photo_url"),
    status: flavorSubmissionStatusEnum("status").default("pending").notNull(),
    voteCount: integer("vote_count").default(0).notNull(),
    linkedMenuItemId: integer("linked_menu_item_id").references(() => menuItems.id), // if "Now on the Menu!"
    reviewedByAdminId: integer("reviewed_by_admin_id").references(() => users.id),
    reviewedAt: timestamp("reviewed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("flavor_submissions_status_idx").on(t.status),
    index("flavor_submissions_vote_count_idx").on(t.voteCount),
  ]
);

export const flavorVotes = pgTable(
  "flavor_votes",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    submissionId: integer("submission_id").notNull().references(() => flavorSubmissions.id, { onDelete: "cascade" }),
    votedAt: timestamp("voted_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("flavor_votes_unique_idx").on(t.userId, t.submissionId),
  ]
);

// ─────────────────────────────────────────────
// EMAIL CAMPAIGNS
// ─────────────────────────────────────────────

export const emailCampaigns = pgTable(
  "email_campaigns",
  {
    id: serial("id").primaryKey(),
    createdByAdminId: integer("created_by_admin_id").notNull().references(() => users.id),
    subject: text("subject").notNull(),
    template: text("template").notNull(),      // "announcement" | "flavor_spotlight" | "limited_drop" | "loyalty_milestone"
    bodyJson: jsonb("body_json"),              // template variable values
    audienceType: emailAudienceTypeEnum("audience_type").notNull(),
    status: emailCampaignStatusEnum("status").default("draft").notNull(),
    scheduledAt: timestamp("scheduled_at"),
    sentAt: timestamp("sent_at"),
    recipientCount: integer("recipient_count").default(0),
    openCount: integer("open_count").default(0),
    clickCount: integer("click_count").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  }
);

export const emailUnsubscribes = pgTable(
  "email_unsubscribes",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    unsubscribedAt: timestamp("unsubscribed_at").defaultNow().notNull(),
  },
  (t) => [index("email_unsub_email_idx").on(t.email)]
);

// ─────────────────────────────────────────────
// ADMIN AUDIT LOG
// ─────────────────────────────────────────────

export const adminAuditLog = pgTable(
  "admin_audit_log",
  {
    id: serial("id").primaryKey(),
    adminId: integer("admin_id").notNull().references(() => users.id),
    action: text("action").notNull(),           // "toggle_availability", "update_order_status", "adjust_points", etc.
    entityType: text("entity_type"),             // "menu_item", "order", "user", etc.
    entityId: integer("entity_id"),
    detailsJson: jsonb("details_json"),
    performedAt: timestamp("performed_at").defaultNow().notNull(),
  },
  (t) => [
    index("audit_log_admin_id_idx").on(t.adminId),
    index("audit_log_entity_idx").on(t.entityType, t.entityId),
    index("audit_log_performed_at_idx").on(t.performedAt),
  ]
);

// ─────────────────────────────────────────────
// RELATIONS (for Drizzle relational queries)
// ─────────────────────────────────────────────

export const usersRelations = relations(users, ({ many, one }) => ({
  orders: many(orders),
  loyaltyAccount: one(loyaltyAccounts, { fields: [users.id], references: [loyaltyAccounts.userId] }),
  loyaltyTransactions: many(loyaltyTransactions),
  subscriptions: many(subscriptions),
  reviews: many(reviews),
  favorites: many(favorites),
  achievements: many(userAchievements),
  referralConversionsAsReferrer: many(referralConversions, { relationName: "referrer" }),
  savedPaymentMethods: many(savedPaymentMethods),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
  statusLog: many(orderStatusLog),
  promoCode: one(promoCodes, { fields: [orders.promoCodeId], references: [promoCodes.id] }),
  deliverySlot: one(deliverySlots, { fields: [orders.deliverySlotId], references: [deliverySlots.id] }),
}));

export const menuItemsRelations = relations(menuItems, ({ many }) => ({
  photos: many(itemPhotos),
  reviews: many(reviews),
  cartItems: many(cartItems),
}));
