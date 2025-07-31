import { createClient } from "@/utils/supabase/server";
import type { Database } from "./database.types";

// Server-side database operations ONLY
// Do not import this in client components!

// Server-side database operations
export class DatabaseOperations {
  private async getSupabase() {
    return await createClient();
  }

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
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("profiles")
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserProfile(userId: string) {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateUserProfile(userId: string, updates: any) {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
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
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("artisan_profiles")
      .insert([artisanData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getArtisanProfile(userId: string) {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("artisan_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data;
  }

  async getArtisanProfileById(artisanId: string) {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("artisan_profiles")
      .select("*")
      .eq("id", artisanId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateArtisanProfile(userId: string, updates: any) {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("artisan_profiles")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getArtisanProducts(artisanId: string) {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("artisan_id", artisanId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  // =============================================
  // PRODUCT OPERATIONS
  // =============================================

  async createProduct(productData: any) {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("products")
      .insert([productData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getProduct(productId: string) {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (error) throw error;
    return data;
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
    const supabase = await this.getSupabase();
    let query = supabase.from("products").select("*");

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
  // CATEGORY OPERATIONS
  // =============================================

  async getCategories() {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data;
  }
}

// Export singleton instance
export const db = new DatabaseOperations();
