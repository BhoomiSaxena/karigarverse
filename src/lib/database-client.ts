import { createClient } from "@/utils/supabase/client";
import type { Database } from "./database.types";
import type { ArtisanBankDetails } from "./types";

// Client-side database operations only
export class ClientDatabaseOperations {
  private supabase = createClient();

  // =============================================
  // USER PROFILE OPERATIONS
  // =============================================

  async createUserProfile(userData: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  }) {
    const { data, error } = await this.supabase
      .from("profiles")
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserProfile(userId: string) {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateUserProfile(userId: string, updates: any) {
    const { data, error } = await this.supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // =============================================
  // ARTISAN PROFILE OPERATIONS
  // =============================================

  async createArtisanProfile(artisanData: any) {
    const { data, error } = await this.supabase
      .from("artisan_profiles")
      .insert([artisanData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getArtisanProfile(
    userId: string
  ): Promise<Database["public"]["Tables"]["artisan_profiles"]["Row"] | null> {
    try {
      const { data, error } = await this.supabase
        .from("artisan_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        // If the error is "No rows found", return null (profile doesn't exist)
        if (error.code === "PGRST116") {
          return null;
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error getting artisan profile:", error);
      throw error;
    }
  }

  async updateArtisanProfile(
    userId: string,
    updates: Partial<Database["public"]["Tables"]["artisan_profiles"]["Row"]>
  ): Promise<Database["public"]["Tables"]["artisan_profiles"]["Row"]> {
    try {
      // First check if profile exists
      const existingProfile = await this.getArtisanProfile(userId);

      if (!existingProfile) {
        // Profile doesn't exist, create it
        const profileToCreate: Partial<
          Database["public"]["Tables"]["artisan_profiles"]["Insert"]
        > = {
          user_id: userId,
          shop_name: updates.shop_name || "My Shop",
          description: updates.description || null,
          specialties: updates.specialties || [],
          location: updates.location || null,
          business_license: updates.business_license || null,
          verification_status: "pending",
          status: "active",
          commission_rate: updates.commission_rate || 10.0,
          total_sales: 0.0,
          total_orders: 0,
          rating: null,
          banner_image: updates.banner_image || null,
          shop_logo: updates.shop_logo || null,
          contact_phone: updates.contact_phone || null,
          contact_email: updates.contact_email || null,
          website_url: updates.website_url || null,
          established_year: updates.established_year || null,
          experience_years: updates.experience_years || null,
          social_media: updates.social_media || null,
          business_hours: updates.business_hours || null,
          portfolio_images: updates.portfolio_images || [],
          certificates: updates.certificates || [],
          awards: updates.awards || [],
          delivery_info: updates.delivery_info || null,
          payment_methods: updates.payment_methods || [],
          return_policy: updates.return_policy || null,
          shipping_policy: updates.shipping_policy || null,
          preferred_language: updates.preferred_language || null,
          notification_preferences: updates.notification_preferences || null,
        };

        const { data, error } = await this.supabase
          .from("artisan_profiles")
          .insert(profileToCreate)
          .select()
          .single();

        if (error) {
          console.error("Error creating artisan profile:", error);
          throw new Error(`Failed to create artisan profile: ${error.message}`);
        }

        return data;
      } else {
        // Profile exists, update it
        const { data, error } = await this.supabase
          .from("artisan_profiles")
          .update(updates)
          .eq("user_id", userId)
          .select()
          .single();

        if (error) {
          console.error("Error updating artisan profile:", error);
          throw new Error(`Failed to update artisan profile: ${error.message}`);
        }

        return data;
      }
    } catch (error) {
      console.error("Error in updateArtisanProfile:", error);
      throw error;
    }
  }

  async getArtisanProducts(artisanId: string) {
    const { data, error } = await this.supabase
      .from("products")
      .select("*")
      .eq("artisan_id", artisanId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getArtisanOrders(artisanId: string, limit: number = 10) {
    const { data, error } = await this.supabase
      .from("order_items")
      .select(
        `
        *,
        orders!inner (
          id,
          order_number,
          status,
          total_amount,
          created_at,
          profiles!inner (
            full_name
          )
        ),
        products!inner (
          name,
          images
        )
      `
      )
      .eq("artisan_id", artisanId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Transform the data to include customer name and flatten structure
    return (data || []).map((item) => ({
      id: item.orders.id,
      order_number: item.orders.order_number,
      status: item.orders.status,
      total_amount: item.orders.total_amount,
      created_at: item.orders.created_at,
      customer_name: item.orders.profiles?.full_name || "Unknown Customer",
      product_name: item.products?.name || "Unknown Product",
      quantity: item.quantity,
      unit_price: item.unit_price,
    }));
  }

  async getArtisanProfileById(
    artisanId: string
  ): Promise<Database["public"]["Tables"]["artisan_profiles"]["Row"] | null> {
    try {
      const { data, error } = await this.supabase
        .from("artisan_profiles")
        .select("*")
        .eq("id", artisanId)
        .single();

      if (error) {
        // If the error is "No rows found", return null (profile doesn't exist)
        if (error.code === "PGRST116") {
          return null;
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error getting artisan profile by ID:", error);
      throw error;
    }
  }

  // =============================================
  // PRODUCT OPERATIONS
  // =============================================

  async createProduct(productData: any) {
    const { data, error } = await this.supabase
      .from("products")
      .insert([productData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getProduct(productId: string) {
    const { data, error } = await this.supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (error) throw error;
    return data;
  }

  async incrementProductViews(productId: string) {
    const { error } = await this.supabase.rpc("increment_product_views", {
      product_id: productId,
    });

    if (error) {
      // Fallback method if RPC doesn't exist
      const { data: product } = await this.supabase
        .from("products")
        .select("views_count")
        .eq("id", productId)
        .single();

      if (product) {
        await this.supabase
          .from("products")
          .update({ views_count: (product.views_count || 0) + 1 })
          .eq("id", productId);
      }
    }
  }

  async getProducts(
    filters: {
      category?: string;
      artisanId?: string;
      isActive?: boolean;
      isFeatured?: boolean;
      limit?: number;
      offset?: number;
      search?: string;
    } = {}
  ) {
    let query = this.supabase.from("products").select("*");

    if (filters.category) {
      query = query.eq("category_id", filters.category);
    }

    if (filters.artisanId) {
      query = query.eq("artisan_id", filters.artisanId);
    }

    if (filters.isActive !== undefined) {
      query = query.eq("is_active", filters.isActive);
    }

    if (filters.isFeatured !== undefined) {
      query = query.eq("is_featured", filters.isFeatured);
    }

    if (filters.search) {
      query = query.ilike("name", `%${filters.search}%`);
    }

    const limit = filters.limit || 20;
    const offset = filters.offset || 0;

    query = query
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  // =============================================
  // CART OPERATIONS
  // =============================================

  async addToCart(productId: string, quantity: number = 1) {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Check if item already exists in cart
    const { data: existingItem } = await this.supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .single();

    if (existingItem) {
      // Update quantity if item exists
      const { data, error } = await this.supabase
        .from("cart_items")
        .update({
          quantity: existingItem.quantity + quantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingItem.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Add new item to cart
      const { data, error } = await this.supabase
        .from("cart_items")
        .insert([
          {
            user_id: user.id,
            product_id: productId,
            quantity: quantity,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  async getCartItems() {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await this.supabase
      .from("cart_items")
      .select(
        `
        *,
        products (
          id,
          name,
          price,
          images,
          stock_quantity,
          is_active
        )
      `
      )
      .eq("user_id", user.id);

    if (error) throw error;
    return data || [];
  }

  async updateCartItemQuantity(cartItemId: string, quantity: number) {
    const { data, error } = await this.supabase
      .from("cart_items")
      .update({
        quantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cartItemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async removeFromCart(cartItemId: string) {
    const { error } = await this.supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId);

    if (error) throw error;
  }

  // =============================================
  // CATEGORY OPERATIONS
  // =============================================

  async getCategories() {
    const { data, error } = await this.supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data;
  }

  // =============================================
  // AUTH OPERATIONS
  // =============================================

  async getUser() {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    return user;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  // =============================================
  // ARTISAN BANK DETAILS OPERATIONS
  // =============================================

  async getArtisanBankDetails(userId: string) {
    const { data, error } = await this.supabase
      .from("artisan_bank_details")
      .select("*")
      .eq("id", userId)
      .single();
    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  async upsertArtisanBankDetails(
    userId: string,
    details: Partial<ArtisanBankDetails>
  ) {
    const { data, error } = await this.supabase
      .from("artisan_bank_details")
      .upsert([{ id: userId, ...details }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // =============================================
  // ARTISAN FULL PROFILE OPERATIONS
  // =============================================

  async getArtisanFullProfile(userId: string) {
    const [profile, artisanProfile, bankDetails] = await Promise.all([
      this.getUserProfile(userId),
      this.getArtisanProfile(userId),
      this.getArtisanBankDetails(userId),
    ]);

    return {
      profile,
      artisanProfile,
      bankDetails,
    };
  }

  async updateArtisanFullProfile(
    userId: string,
    updates: {
      profile?: any;
      artisanProfile?: any;
      bankDetails?: any;
    }
  ) {
    const promises = [];
    if (updates.profile) {
      promises.push(this.updateUserProfile(userId, updates.profile));
    }
    if (updates.artisanProfile) {
      promises.push(this.updateArtisanProfile(userId, updates.artisanProfile));
    }
    if (updates.bankDetails) {
      promises.push(this.upsertArtisanBankDetails(userId, updates.bankDetails));
    }

    const [profile, artisanProfile, bankDetails] = await Promise.all(promises);

    return {
      profile,
      artisanProfile,
      bankDetails,
    };
  }
}
export const clientDb = new ClientDatabaseOperations();
