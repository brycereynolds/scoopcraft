import type {
  orderStatusEnum,
  userRoleEnum,
  menuItemCategoryEnum,
} from "@/db/schema"

// Enum types derived from schema
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number]
export type UserRole = (typeof userRoleEnum.enumValues)[number]
export type MenuItemCategory = (typeof menuItemCategoryEnum.enumValues)[number]

// Client-side cart state
export interface CartItem {
  id: string
  menuItemId?: number
  scoopLabConfigId?: number
  name: string
  price: number
  quantity: number
  imageUrl?: string
}

// Scoop Lab builder config
export interface ScoopLabConfig {
  vessel_id: number
  scoops: Array<{ flavor_id: number; scoop_number: number }>
  toppings: number[]
  sauces: number[]
  extras: number[]
  name: string
  scoop_count: number
}

// Checkout totals for order summary
export interface CheckoutTotals {
  subtotal: number
  discount: number
  tip: number
  tax: number
  total: number
}

// Menu item with an optional Cloudflare R2 photo URL
export interface MenuItemWithPhoto {
  id: number
  name: string
  description: string | null
  price: string
  category: string
  availabilityType: string
  isAvailable: boolean
  isVegan: boolean
  isDairyFree: boolean
  isGlutenFree: boolean
  calories: number | null
  photoUrl: string | null
}

// Menu item used in the Scoop Lab builder
export interface ScoopLabMenuItem {
  id: number
  name: string
  description: string | null
  price: string
  category: string
  availabilityType: string
  isAvailable: boolean
  photoUrl: string | null
}
