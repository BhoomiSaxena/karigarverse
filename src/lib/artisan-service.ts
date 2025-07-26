// src/lib/artisan-service.ts
import { clientDb } from "./database-client";
import type { Database } from "./database.types";

// Dashboard statistics interface
export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalEarnings: number;
  monthlyEarnings: number;
  totalViews: number;
  conversionRate: number;
  pendingOrders: number;
  completedOrders: number;
  averageRating: number;
}

// Recent order interface for dashboard
export interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  date: string;
}

// Top product interface for dashboard
export interface TopProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  sales: number;
  views: number;
  revenue: number;
}

// Complete dashboard data interface
export interface DashboardData {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
  unreadNotificationCount: number;
  artisanName: string;
  shopName: string;
}

// Profile update types
type ProfileUpdate = Partial<
  Database["public"]["Tables"]["profiles"]["Update"]
>;
type ArtisanProfileUpdate = Partial<
  Database["public"]["Tables"]["artisan_profiles"]["Update"]
>;

export class ArtisanService {
  /**
   * Get comprehensive dashboard data for an artisan
   */
  static async getDashboardData(userId: string): Promise<DashboardData> {
    try {
      // Get user profile and artisan profile
      const userProfile = await clientDb.getUserProfile(userId);
      const artisanProfile = await clientDb.getArtisanProfile(userId);

      if (!userProfile || !artisanProfile) {
        throw new Error("User or artisan profile not found");
      }

      // Get all artisan products
      const products = await clientDb.getArtisanProducts(artisanProfile.id);

      // Get all artisan orders
      const orders = await clientDb.getArtisanOrders(artisanProfile.id);

      // Get notifications count (placeholder - implement when notification method is available)
      const unreadNotificationCount = 0;

      // Calculate dashboard statistics
      const stats = this.calculateDashboardStats(products, orders);

      // Get recent orders (last 10)
      const recentOrders = this.formatRecentOrders(orders.slice(0, 10));

      // Get top products by sales
      const topProducts = this.calculateTopProducts(products, orders);

      return {
        stats,
        recentOrders,
        topProducts,
        unreadNotificationCount,
        artisanName: userProfile.full_name || "Artisan",
        shopName: artisanProfile.shop_name || "Shop",
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw new Error("Failed to fetch dashboard data");
    }
  }

  /**
   * Calculate dashboard statistics from products and orders
   */
  private static calculateDashboardStats(
    products: any[],
    orders: any[]
  ): DashboardStats {
    const totalProducts = products.length;
    const totalOrders = orders.length;

    // Calculate earnings
    const totalEarnings = orders.reduce((sum, order) => {
      return sum + (order.total_amount || 0);
    }, 0);

    // Calculate monthly earnings (current month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyEarnings = orders
      .filter((order) => {
        const orderDate = new Date(order.created_at);
        return (
          orderDate.getMonth() === currentMonth &&
          orderDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, order) => sum + (order.total_amount || 0), 0);

    // Calculate order statistics
    const pendingOrders = orders.filter((order) =>
      ["pending", "confirmed", "processing"].includes(order.status)
    ).length;

    const completedOrders = orders.filter(
      (order) => order.status === "delivered"
    ).length;

    // Calculate total views (sum from all products)
    const totalViews = products.reduce(
      (sum, product) => sum + (product.views || 0),
      0
    );

    // Calculate conversion rate (orders / total views * 100)
    const conversionRate =
      totalViews > 0 ? (totalOrders / totalViews) * 100 : 0;

    // Calculate average rating from products
    const ratingsCount = products.filter((p) => p.average_rating > 0).length;
    const averageRating =
      ratingsCount > 0
        ? products.reduce((sum, p) => sum + (p.average_rating || 0), 0) /
          ratingsCount
        : 0;

    return {
      totalProducts,
      totalOrders,
      totalEarnings,
      monthlyEarnings,
      totalViews,
      conversionRate: Math.round(conversionRate * 100) / 100,
      pendingOrders,
      completedOrders,
      averageRating: Math.round(averageRating * 10) / 10,
    };
  }

  /**
   * Format orders for recent orders display
   */
  private static formatRecentOrders(orders: any[]): RecentOrder[] {
    return orders.map((order) => ({
      id: order.id,
      orderNumber: `#${order.id.slice(-8).toUpperCase()}`,
      customerName: order.profiles?.full_name || "Customer",
      amount: order.total_amount || 0,
      status: order.status || "pending",
      date: new Date(order.created_at).toLocaleDateString(),
    }));
  }

  /**
   * Calculate top products by sales and revenue
   */
  private static calculateTopProducts(
    products: any[],
    orders: any[]
  ): TopProduct[] {
    // Calculate sales and revenue for each product
    const productStats = products.map((product) => {
      // Find order items for this product
      const productOrderItems = orders.flatMap(
        (order) =>
          order.order_items?.filter(
            (item: any) => item.product_id === product.id
          ) || []
      );

      const sales = productOrderItems.reduce(
        (sum, item) => sum + (item.quantity || 0),
        0
      );
      const revenue = productOrderItems.reduce(
        (sum, item) => sum + (item.quantity || 0) * (item.price || 0),
        0
      );

      return {
        id: product.id,
        name: product.name,
        image: product.images?.[0] || "/placeholder.jpg",
        price: product.price || 0,
        sales,
        views: product.views || 0,
        revenue,
      };
    });

    // Sort by revenue and return top 5
    return productStats.sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }

  /**
   * Update artisan profile information
   */
  static async updateArtisanProfile(
    userId: string,
    profileData: ProfileUpdate,
    artisanData: ArtisanProfileUpdate
  ): Promise<void> {
    try {
      await clientDb.updateArtisanFullProfile(userId, {
        profile: profileData,
        artisanProfile: artisanData,
      });
    } catch (error) {
      console.error("Error updating artisan profile:", error);
      throw new Error("Failed to update artisan profile");
    }
  }

  /**
   * Get artisan's complete profile data
   */
  static async getArtisanProfileData(userId: string) {
    try {
      const userProfile = await clientDb.getUserProfile(userId);
      const artisanProfile = await clientDb.getArtisanProfile(userId);

      return {
        userProfile,
        artisanProfile,
      };
    } catch (error) {
      console.error("Error fetching artisan profile data:", error);
      throw new Error("Failed to fetch artisan profile data");
    }
  }
}

export default ArtisanService;
