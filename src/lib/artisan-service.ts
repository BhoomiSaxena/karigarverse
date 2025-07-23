import { DashboardStats, ArtisanOrder, ArtisanProduct, Notification } from "@/lib/types";

interface DashboardData {
  stats: DashboardStats;
  recentOrders: ArtisanOrder[];
  topProducts: ArtisanProduct[];
  notifications: Notification[];
  unreadNotificationCount: number;
}

export const artisanService = {
  getDashboardData: async (artisanId: string): Promise<DashboardData> => {
    // This is a mock implementation. In a real application, you would fetch
    // this data from a backend service or database.
    console.log(`Fetching dashboard data for artisan: ${artisanId}`);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Dummy data
    const dummyStats: DashboardStats = {
      totalProducts: 120,
      totalOrders: 350,
      totalEarnings: 750000,
      monthlyEarnings: 85000,
      pendingOrders: 15,
      completedOrders: 335,
      totalViews: 150000,
      conversionRate: 2.5,
    };

    const dummyRecentOrders: ArtisanOrder[] = [
      {
        id: "ord001",
        orderNumber: "KV-ORD-001",
        productId: "prod005",
        productName: "Hand-painted Ceramic Vase",
        productImage: "/images/pottery-1.jpg",
        quantity: 1,
        pricePerItem: 1200,
        totalAmount: 1200,
        buyerName: "Rahul Sharma",
        buyerEmail: "rahul@example.com",
        shippingAddress: "123 Main St, Delhi",
        status: "Pending",
        orderDate: "2024-07-20T10:00:00Z",
        estimatedDelivery: "2024-07-27",
      },
      {
        id: "ord002",
        orderNumber: "KV-ORD-002",
        productId: "prod002",
        productName: "Embroidered Silk Scarf",
        productImage: "/images/textiles-1.jpg",
        quantity: 2,
        pricePerItem: 800,
        totalAmount: 1600,
        buyerName: "Priya Singh",
        buyerEmail: "priya@example.com",
        shippingAddress: "456 Oak Ave, Mumbai",
        status: "Delivered",
        orderDate: "2024-07-18T14:30:00Z",
        estimatedDelivery: "2024-07-22",
      },
      {
        id: "ord003",
        orderNumber: "KV-ORD-003",
        productId: "prod008",
        productName: "Wooden Carved Elephant",
        productImage: "/images/woodwork-1.jpg",
        quantity: 1,
        pricePerItem: 2500,
        totalAmount: 2500,
        buyerName: "Amit Kumar",
        buyerEmail: "amit@example.com",
        shippingAddress: "789 Pine Ln, Bangalore",
        status: "Shipped",
        orderDate: "2024-07-19T09:15:00Z",
        estimatedDelivery: "2024-07-26",
      },
    ];

    const dummyTopProducts: ArtisanProduct[] = [
      {
        id: "prod001",
        name: "Traditional Pichwai Painting",
        price: 3500,
        rating: 4.8,
        images: ["/images/painting-1.jpg"],
        category: "painting",
        artisanId: artisanId,
        description: "A beautiful hand-painted Pichwai.",
        isActive: true,
        createdAt: "2023-01-01T12:00:00Z",
        updatedAt: "2024-07-01T10:00:00Z",
        views: 1500,
        sales: 50,
      },
      {
        id: "prod002",
        name: "Embroidered Silk Scarf",
        price: 800,
        rating: 4.5,
        images: ["/images/textiles-1.jpg"],
        category: "textiles",
        artisanId: artisanId,
        description: "Soft silk scarf with intricate embroidery.",
        isActive: true,
        createdAt: "2023-02-15T14:00:00Z",
        updatedAt: "2024-07-05T11:00:00Z",
        views: 1200,
        sales: 75,
      },
      {
        id: "prod003",
        name: "Terracotta Clay Pot",
        price: 450,
        rating: 4.2,
        images: ["/images/pottery-1.jpg"],
        category: "pottery",
        artisanId: artisanId,
        description: "Handmade terracotta pot.",
        isActive: true,
        createdAt: "2023-03-10T09:00:00Z",
        updatedAt: "2024-07-10T08:00:00Z",
        views: 900,
        sales: 100,
      },
    ];

    const dummyNotifications: Notification[] = [
      {
        id: "notif001",
        type: "order",
        title: "New Order Received!",
        message: "You have a new order (KV-ORD-001) for Hand-painted Ceramic Vase.",
        isRead: false,
        createdAt: "2024-07-20T11:00:00Z",
        actionUrl: "/artisan/orders",
      },
      {
        id: "notif002",
        type: "product",
        title: "Product 'Wooden Carved Elephant' Shipped",
        message: "Order KV-ORD-003 containing your product has been shipped.",
        isRead: true,
        createdAt: "2024-07-19T10:30:00Z",
        actionUrl: "/artisan/orders",
      },
    ];

    const unreadCount = dummyNotifications.filter((n) => !n.isRead).length;

    return {
      stats: dummyStats,
      recentOrders: dummyRecentOrders,
      topProducts: dummyTopProducts,
      notifications: dummyNotifications,
      unreadNotificationCount: unreadCount,
    };
  },
};