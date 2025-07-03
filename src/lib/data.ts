import type { Product, Category, UserOrder } from "./types"
import { Gem, Brush, Hammer, Shirt, PaletteIcon } from "lucide-react"

export const categories: Category[] = [
  { id: "pottery", name: "Pottery", icon: PaletteIcon, image: "/images/pottery-1.jpg" },
  { id: "textiles", name: "Textiles", icon: Shirt, image: "/images/textiles-1.jpg" },
  { id: "woodwork", name: "Woodwork", icon: Hammer, image: "/images/woodwork-1.jpg" },
  { id: "jewelry", name: "Jewelry", icon: Gem, image: "/images/jewelry-1.jpg" },
  { id: "painting", name: "Painting", icon: Brush, image: "/images/painting-1.jpg" },
]

export const products: Product[] = [
  {
    id: "1",
    name: "Handcrafted Ceramic Vase",
    price: 750,
    originalPrice: 900,
    rating: 4.5,
    reviewCount: 120,
    images: ["/images/pottery-1.jpg", "/images/crafts-1.jpg"],
    category: "pottery",
    artisanName: "Artisan Priya",
    description:
      "A beautifully handcrafted ceramic vase, perfect for adding an artistic touch to your home decor. Made with locally sourced clay.",
    features: ["Material: Clay", "Hand-painted", "Dimensions: 12in x 6in"],
    stock: 15,
    tags: ["home decor", "vase", "ceramic"],
  },
  {
    id: "2",
    name: "Handwoven Silk Scarf",
    price: 1200,
    rating: 4.8,
    reviewCount: 85,
    images: ["/images/textiles-1.jpg"],
    category: "textiles",
    artisanName: "Artisan Ravi",
    description: "Elegant handwoven silk scarf with intricate patterns. A versatile accessory for any occasion.",
    features: ["Material: 100% Silk", "Handwoven", "Size: 70in x 20in"],
    stock: 20,
    tags: ["fashion", "accessory", "silk"],
  },
  {
    id: "3",
    name: "Carved Wooden Elephant",
    price: 950,
    rating: 4.2,
    reviewCount: 60,
    images: ["/images/woodwork-1.jpg"],
    category: "woodwork",
    artisanName: "Artisan Meena",
    description: "Exquisite carved wooden elephant statue, showcasing traditional craftsmanship.",
    features: ["Material: Teak Wood", "Hand-carved", "Eco-friendly polish"],
    stock: 10,
    tags: ["decor", "statue", "wood"],
  },
  {
    id: "4",
    name: "Silver Filigree Earrings",
    price: 1500,
    rating: 4.9,
    reviewCount: 200,
    images: ["/images/jewelry-1.jpg"],
    category: "jewelry",
    artisanName: "Artisan Anjali",
    description: "Delicate silver filigree earrings, handcrafted with precision. Lightweight and elegant.",
    features: ["Material: Sterling Silver", "Handmade", "Hypoallergenic"],
    stock: 25,
    tags: ["jewelry", "earrings", "silver"],
  },
  {
    id: "5",
    name: "Abstract Canvas Painting",
    price: 2500,
    rating: 4.6,
    reviewCount: 45,
    images: ["/images/painting-1.jpg"],
    category: "painting",
    artisanName: "Artisan Vivek",
    description:
      "Vibrant abstract canvas painting, perfect for modern interiors. Adds a splash of color and creativity.",
    features: ["Medium: Acrylic on Canvas", "Size: 24in x 36in", "Ready to hang"],
    stock: 5,
    tags: ["art", "wall decor", "abstract"],
  },
  {
    id: "6",
    name: "Terracotta Planter Set",
    price: 600,
    rating: 4.3,
    reviewCount: 70,
    images: ["/images/pottery-1.jpg"],
    category: "Pottery",
    artisanName: "Artisan Priya",
    description: "Set of three handcrafted terracotta planters. Ideal for indoor plants and succulents.",
    features: ["Material: Terracotta", "Set of 3", "Drainage holes included"],
    stock: 30,
    tags: ["garden", "planters", "terracotta"],
  },
]

export const userOrders: UserOrder[] = [
  {
    id: "order1",
    orderNumber: "ART001",
    date: "2023-10-01",
    status: "Delivered",
    items: [
      { ...products[0], quantity: 1, priceAtPurchase: products[0].price },
      { ...products[1], quantity: 1, priceAtPurchase: products[1].price },
    ],
    totalAmount: products[0].price + products[1].price + 50,
    shippingAddress: "123 Art Lane, Craftsville, CT 06001",
  },
  {
    id: "order2",
    orderNumber: "ART002",
    date: "2023-09-15",
    status: "Shipped",
    items: [{ ...products[2], quantity: 2, priceAtPurchase: products[2].price }],
    totalAmount: products[2].price * 2 + 50,
    shippingAddress: "456 Design Rd, Potterytown, PT 78901",
  },
]

export const featuredCategories = [
  {
    id: "pottery",
    name: "Handcrafted Pottery",
    description: "Traditional clay work with modern designs",
    image: "/images/pottery-1.jpg",
    price: "₹750",
  },
  {
    id: "textiles",
    name: "Woven Textiles",
    description: "Silk scarves and handwoven fabrics",
    image: "/images/textiles-1.jpg",
    price: "₹1,200",
  },
  {
    id: "woodwork",
    name: "Carved Woodwork",
    description: "Intricate wooden sculptures and decor",
    image: "/images/woodwork-1.jpg",
    price: "₹950",
  },
  {
    id: "jewelry",
    name: "Artisan Jewelry",
    description: "Handmade silver and traditional pieces",
    image: "/images/jewelry-1.jpg",
    price: "₹1,500",
  },
]

export const testimonials = [
  {
    id: 1,
    text: "Best handcrafted items I've ever purchased!",
    name: "Alice",
    rating: 5,
  },
  {
    id: 2,
    text: "Authentic craftsmanship and great service.",
    name: "Bob",
    rating: 4,
  },
  {
    id: 3,
    text: "Amazing quality and attention to detail.",
    name: "Priya",
    rating: 5,
  },
  {
    id: 4,
    text: "The pottery is so beautifully crafted!",
    name: "Mia",
    rating: 5,
  },
  {
    id: 5,
    text: "Love the unique designs and the story behind each piece.",
    name: "Ethan",
    rating: 5,
  },
  {
    id: 6,
    text: "Excellent customer service and fast delivery.",
    name: "Sara",
    rating: 4,
  },
  {
    id: 7,
    text: "Perfect gifts for art lovers.",
    name: "Kim",
    rating: 5,
  },
  {
    id: 8,
    text: "Supporting local artisans has never been easier.",
    name: "David",
    rating: 4,
  },
  {
    id: 9,
    text: "Each piece tells a beautiful story.",
    name: "Maya",
    rating: 5,
  },
]

// Artisan Dashboard Mock Data
import type { Artisan, ArtisanProduct, ArtisanOrder, DashboardStats, Notification } from "./types"

export const currentArtisan: Artisan = {
  id: "artisan-1",
  name: "Priya Sharma",
  email: "priya.sharma@email.com",
  shopName: "Priya's Pottery Studio",
  bio: "Master potter with over 15 years of experience creating beautiful ceramic pieces using traditional techniques passed down through generations.",
  profileImage: "/images/pottery-1.jpg",
  contactDetails: {
    phone: "+91 98765 43210",
    address: "123 Artisan Colony, Craft District",
    city: "Rishikesh",
    state: "Uttarakhand"
  },
  joinDate: "2023-01-15",
  isVerified: true,
  totalEarnings: 125000,
  totalProducts: 24,
  totalOrders: 89
}

export const artisanProducts: ArtisanProduct[] = [
  {
    id: "1",
    name: "Handcrafted Ceramic Vase",
    price: 750,
    originalPrice: 900,
    rating: 4.5,
    reviewCount: 120,
    images: ["/images/pottery-1.jpg", "/images/crafts-1.jpg"],
    category: "pottery",
    artisanName: "Artisan Priya",
    artisanId: "artisan-1",
    description: "A beautifully handcrafted ceramic vase, perfect for adding an artistic touch to your home decor.",
    features: ["Material: Clay", "Hand-painted", "Dimensions: 12in x 6in"],
    stock: 15,
    tags: ["home decor", "vase", "ceramic"],
    isActive: true,
    createdAt: "2024-01-15",
    updatedAt: "2024-12-20",
    views: 1250,
    sales: 45
  },
  {
    id: "3",
    name: "Carved Wooden Elephant",
    price: 950,
    rating: 4.2,
    reviewCount: 60,
    images: ["/images/woodwork-1.jpg"],
    category: "woodwork",
    artisanName: "Artisan Priya",
    artisanId: "artisan-1",
    description: "Intricately carved wooden elephant showcasing traditional craftsmanship.",
    features: ["Material: Teak Wood", "Hand-carved", "Height: 8 inches"],
    stock: 8,
    tags: ["decor", "elephant", "wood"],
    isActive: true,
    createdAt: "2024-02-10",
    updatedAt: "2024-12-15",
    views: 890,
    sales: 22
  },
  {
    id: "5",
    name: "Traditional Clay Diya Set",
    price: 280,
    rating: 4.7,
    reviewCount: 95,
    images: ["/images/pottery-1.jpg"],
    category: "pottery",
    artisanName: "Artisan Priya",
    artisanId: "artisan-1",
    description: "Set of 6 traditional clay diyas perfect for festivals and celebrations.",
    features: ["Set of 6 pieces", "Hand-molded", "Natural clay"],
    stock: 25,
    tags: ["diya", "festival", "traditional"],
    isActive: true,
    createdAt: "2024-03-05",
    updatedAt: "2024-12-18",
    views: 2100,
    sales: 78
  }
]

export const artisanOrders: ArtisanOrder[] = [
  {
    id: "order-1",
    orderNumber: "ORD-2024-001",
    productId: "1",
    productName: "Handcrafted Ceramic Vase",
    productImage: "/images/pottery-1.jpg",
    quantity: 2,
    pricePerItem: 750,
    totalAmount: 1500,
    buyerName: "Rahul Gupta",
    buyerEmail: "rahul.gupta@email.com",
    shippingAddress: "45 Green Park, Delhi - 110016",
    status: "Pending",
    orderDate: "2024-12-20",
    estimatedDelivery: "2024-12-27"
  },
  {
    id: "order-2",
    orderNumber: "ORD-2024-002",
    productId: "3",
    productName: "Carved Wooden Elephant",
    productImage: "/images/woodwork-1.jpg",
    quantity: 1,
    pricePerItem: 950,
    totalAmount: 950,
    buyerName: "Anita Desai",
    buyerEmail: "anita.desai@email.com",
    shippingAddress: "78 Banjara Hills, Hyderabad - 500034",
    status: "Shipped",
    orderDate: "2024-12-18",
    estimatedDelivery: "2024-12-25"
  },
  {
    id: "order-3",
    orderNumber: "ORD-2024-003",
    productId: "5",
    productName: "Traditional Clay Diya Set",
    productImage: "/images/pottery-1.jpg",
    quantity: 3,
    pricePerItem: 280,
    totalAmount: 840,
    buyerName: "Vikram Singh",
    buyerEmail: "vikram.singh@email.com",
    shippingAddress: "12 Koregaon Park, Pune - 411001",
    status: "Delivered",
    orderDate: "2024-12-15",
    estimatedDelivery: "2024-12-22"
  },
  {
    id: "order-4",
    orderNumber: "ORD-2024-004",
    productId: "1",
    productName: "Handcrafted Ceramic Vase",
    productImage: "/images/pottery-1.jpg",
    quantity: 1,
    pricePerItem: 750,
    totalAmount: 750,
    buyerName: "Meera Sharma",
    buyerEmail: "meera.sharma@email.com",
    shippingAddress: "56 Sector 15, Gurgaon - 122001",
    status: "Delivered",
    orderDate: "2024-12-10",
    estimatedDelivery: "2024-12-17"
  }
]

export const dashboardStats: DashboardStats = {
  totalProducts: 24,
  totalOrders: 89,
  totalEarnings: 125000,
  monthlyEarnings: 15200,
  pendingOrders: 8,
  completedOrders: 76,
  totalViews: 12450,
  conversionRate: 3.2
}

export const artisanNotifications: Notification[] = [
  {
    id: "notif-1",
    type: "order",
    title: "New Order Received",
    message: "You have received a new order for Handcrafted Ceramic Vase",
    isRead: false,
    createdAt: "2024-12-20T10:30:00Z",
    actionUrl: "/artisan/orders"
  },
  {
    id: "notif-2",
    type: "product",
    title: "Low Stock Alert",
    message: "Carved Wooden Elephant is running low on stock (8 remaining)",
    isRead: false,
    createdAt: "2024-12-19T14:15:00Z",
    actionUrl: "/artisan/products"
  },
  {
    id: "notif-3",
    type: "general",
    title: "Profile Update Required",
    message: "Please update your bank details for faster payments",
    isRead: true,
    createdAt: "2024-12-18T09:00:00Z",
    actionUrl: "/artisan/profile"
  }
]
