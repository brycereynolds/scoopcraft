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
