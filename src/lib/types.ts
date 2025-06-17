import type React from "react"
export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number // For discounts
  rating: number
  reviewCount?: number
  images: string[] // Array of image URLs, first is primary
  category: string
  artisanName?: string
  description: string
  features?: string[]
  stock?: number
  tags?: string[]
}

export interface Category {
  id: string
  name: string
  icon?: React.ElementType // Lucide icon component
  image?: string // URL for category image
}

export interface CartItem extends Product {
  quantity: number
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  addresses?: Address[]
  orders?: Order[]
}

export interface Address {
  id: string
  street: string
  city: string
  state: string
  zip: string
  country: string
  isDefault?: boolean
}

export interface Order {
  id: string
  items: CartItem[]
  totalAmount: number
  orderDate: string
  status: "Pending" | "Shipped" | "Delivered" | "Cancelled"
  shippingAddress: Address
}

export interface OrderItem extends Product {
  // Or a simplified version of Product
  quantity: number
  priceAtPurchase: number
}

export interface UserOrder {
  id: string
  orderNumber: string
  date: string
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled"
  items: OrderItem[]
  totalAmount: number
  shippingAddress: string // Simplified for this example
}
