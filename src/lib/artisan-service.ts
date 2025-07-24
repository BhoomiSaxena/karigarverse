// src/lib/artisan-service.ts

import { clientDb } from "@/lib/database-client";
import type { Artisan, ArtisanBankDetails, DashboardStats, ArtisanOrder } from "@/lib/types";
import type { Database } from "@/lib/database.types";

type ProfileUpdate = Partial<Database['public']['Tables']['profiles']['Update']>;
type ArtisanProfileUpdate = Partial<Database['public']['Tables']['artisan_profiles']['Update']>;

export interface DashboardData {
  stats: DashboardStats;
  recentOrders: ArtisanOrder[];
  topProducts: Array<{
    id: string;
    name: string;
    price: number;
    sales: number;
    views: number;
  }>;
  unreadNotificationCount: number;
}

export const artisanService = {
  // Fetch artisan profile, shop, and bank details from Supabase
  getArtisanFullProfile: async (userId: string) => {
    // Fetch profile
    const profile = await clientDb.getUserProfile(userId);

    // Fetch artisan profile
    const artisanProfile = await clientDb.getArtisanProfile(userId);

    // Fetch bank details
    const bankDetails = await clientDb.getArtisanBankDetails(userId);

    return {
      profile,
      artisanProfile,
      bankDetails: bankDetails || null,
    };
  },

  // Update profile, artisan profile, and bank details
  updateArtisanFullProfile: async (userId: string, updates: {
    profile?: ProfileUpdate,
    artisanProfile?: ArtisanProfileUpdate,
    bankDetails?: Partial<ArtisanBankDetails>
  }) => {
    let profileRes, artisanRes, bankRes;

    if (updates.profile) {
      profileRes = await clientDb.updateUserProfile(userId, updates.profile);
    }
    if (updates.artisanProfile) {
      artisanRes = await clientDb.updateArtisanProfile(userId, updates.artisanProfile);
    }
    if (updates.bankDetails) {
      bankRes = await clientDb.upsertArtisanBankDetails(userId, updates.bankDetails);
    }

    return {
      profile: profileRes,
      artisanProfile: artisanRes,
      bankDetails: bankRes,
    };
  },

  // Get dashboard data for artisan
  getDashboardData: async (userId: string): Promise<DashboardData> => {
    // Mock data for now - this would be replaced with actual database queries
    const mockStats: DashboardStats = {
      totalProducts: 12,
      totalOrders: 48,
      totalEarnings: 125000,
      monthlyEarnings: 25000,
      pendingOrders: 3,
      completedOrders: 45,
      totalViews: 1250,
      conversionRate: 3.8,
    };

    const mockRecentOrders: ArtisanOrder[] = [
      {
        id: "1",
        orderNumber: "ORD-2024-001",
        productId: "prod-1",
        productName: "Handcrafted Clay Pot",
        productImage: "/placeholder.jpg",
        quantity: 2,
        pricePerItem: 1200,
        totalAmount: 2400,
        buyerName: "Raj Sharma",
        buyerEmail: "raj@example.com",
        shippingAddress: "Mumbai, Maharashtra",
        status: "Pending",
        orderDate: "2024-01-15",
        estimatedDelivery: "2024-01-20",
      },
      {
        id: "2",
        orderNumber: "ORD-2024-002",
        productId: "prod-2",
        productName: "Wooden Sculpture",
        productImage: "/placeholder.jpg",
        quantity: 1,
        pricePerItem: 3500,
        totalAmount: 3500,
        buyerName: "Priya Singh",
        buyerEmail: "priya@example.com",
        shippingAddress: "Delhi, Delhi",
        status: "Shipped",
        orderDate: "2024-01-14",
        estimatedDelivery: "2024-01-19",
      },
    ];

    const mockTopProducts = [
      {
        id: "prod-1",
        name: "Handcrafted Clay Pot",
        price: 1200,
        sales: 25,
        views: 156,
      },
      {
        id: "prod-2",
        name: "Wooden Sculpture",
        price: 3500,
        sales: 18,
        views: 89,
      },
    ];

    return {
      stats: mockStats,
      recentOrders: mockRecentOrders,
      topProducts: mockTopProducts,
      unreadNotificationCount: 2,
    };
  },
};