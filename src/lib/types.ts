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

// Artisan-specific types
export interface Artisan {
  id: string
  name: string
  email: string
  shopName: string
  bio?: string
  profileImage?: string
  contactDetails: {
    phone?: string
    address?: string
    city: string
    state: string
  }
  joinDate: string
  isVerified: boolean
  totalEarnings: number
  totalProducts: number
  totalOrders: number
}

export interface ArtisanProduct extends Product {
  artisanId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  views: number
  sales: number
}

export interface ArtisanOrder {
  id: string
  orderNumber: string
  productId: string
  productName: string
  productImage: string
  quantity: number
  pricePerItem: number
  totalAmount: number
  buyerName: string
  buyerEmail: string
  shippingAddress: string
  status: "Pending" | "Shipped" | "Delivered" | "Cancelled"
  orderDate: string
  estimatedDelivery?: string
}

export interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalEarnings: number
  monthlyEarnings: number
  pendingOrders: number
  completedOrders: number
  totalViews: number
  conversionRate: number
}

export interface Notification {
  id: string
  type: "order" | "product" | "general"
  title: string
  message: string
  isRead: boolean
  createdAt: string
  actionUrl?: string
}
