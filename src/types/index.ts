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

export type CreateOrderInput = {
  type: 'delivery' | 'pickup';
  addressId?: number;
  deliverySlotId?: number;
  promoCode?: string;
  loyaltyPointsToRedeem?: number;
  tipAmount?: number;
};

export type CartWithItems = {
  id: number;
  userId: number;
  items: CartItemDetail[];
  updatedAt: Date;
};

export type CartItemDetail = {
  id: number;
  menuItem: {
    id: number;
    name: string;
    price: string;
    category: string;
    photoUrl?: string;
  };
  quantity: number;
  scoopLabConfig?: ScoopLabConfig;
  subtotal: number;
};

export type DeliverySlot = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
  maxOrders: number;
  currentOrders: number;
};
