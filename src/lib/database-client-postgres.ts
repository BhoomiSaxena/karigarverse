/**
 * PostgreSQL Database Operations - Client Side
 * Replaces the Supabase-based database-client.ts
 */

import { AuthService } from "./auth";

// Client-side database operations only
export class ClientDatabaseOperations {
  // Helper method to make API calls to our backend endpoints
  private async apiCall(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem("auth_token");

    console.log("API Call:", {
      endpoint,
      hasToken: !!token,
      method: options.method || "GET",
    });

    const response = await fetch(`/api/db${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    console.log("API Response:", {
      endpoint,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      let error;
      try {
        error = await response.json();
      } catch {
        error = { message: `HTTP ${response.status}: ${response.statusText}` };
      }

      console.error("API Error Details:", {
        endpoint,
        error,
        status: response.status,
      });
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log("API Success:", { endpoint, hasData: !!result.data });

    // Return the data property if it exists, otherwise return the whole result
    return result.data !== undefined ? result.data : result;
  }

  // =============================================
  // AUTHENTICATION OPERATIONS
  // =============================================

  async signUp(
    email: string,
    password: string,
    userData: {
      first_name: string;
      last_name: string;
      phone?: string;
    }
  ) {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, ...userData }),
    });

    const result = await response.json();

    if (result.token) {
      localStorage.setItem("auth_token", result.token);
    }

    return result;
  }

  async signIn(email: string, password: string) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (result.token) {
      localStorage.setItem("auth_token", result.token);
    }

    return result;
  }

  async signOut() {
    localStorage.removeItem("auth_token");
    return { success: true };
  }

  async getCurrentUser() {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        return { user: null };
      }

      const response = await fetch("/api/auth/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        localStorage.removeItem("auth_token");
        return { user: null };
      }

      return response.json();
    } catch {
      localStorage.removeItem("auth_token");
      return { user: null };
    }
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
    return this.apiCall("/profiles", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async getUserProfile(userId?: string) {
    // If no userId provided, get current user's profile
    if (!userId) {
      return this.apiCall("/profiles");
    }
    return this.apiCall(`/profiles/${userId}`);
  }

  async updateUserProfile(userId: string, updates: any) {
    return this.apiCall("/profiles", {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  // =============================================
  // ARTISAN PROFILE OPERATIONS
  // =============================================

  async createArtisanProfile(artisanData: {
    user_id?: string; // Optional since we get it from auth
    shop_name: string;
    description?: string;
    specialties?: string[];
    location?: string;
    business_license?: string;
    phone?: string;
    email?: string;
    website?: string;
    contact_phone?: string;
    contact_email?: string;
    website_url?: string;
    established_year?: number;
    experience_years?: number;
    verification_status?: string;
    status?: string;
  }) {
    // Remove user_id since it's handled by auth
    const { user_id, ...data } = artisanData;
    return this.apiCall("/artisan-profiles", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getArtisanProfile(userId?: string) {
    // Get current user's artisan profile
    return this.apiCall("/artisan-profiles");
  }

  async getArtisanProfileById(artisanId: string) {
    // Get artisan profile by artisan ID
    return this.apiCall(`/artisan-profiles/${artisanId}`);
  }

  async updateArtisanProfile(userId: string, updates: any) {
    return this.apiCall("/artisan-profiles", {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  // =============================================
  // CATEGORY OPERATIONS
  // =============================================

  async getCategories(options: { includeInactive?: boolean } = {}) {
    const params = new URLSearchParams();
    if (options.includeInactive) {
      params.append("includeInactive", "true");
    }

    return this.apiCall(`/categories?${params.toString()}`);
  }

  async getCategoryBySlug(slug: string) {
    return this.apiCall(`/categories/slug/${slug}`);
  }

  // =============================================
  // PRODUCT OPERATIONS
  // =============================================

  async getProducts(
    options: {
      category?: string;
      artisan_id?: string;
      is_featured?: boolean;
      is_active?: boolean;
      search?: string;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    return this.apiCall(`/products?${params.toString()}`);
  }

  async getProductById(productId: string) {
    return this.apiCall(`/products/${productId}`);
  }

  async incrementProductViews(productId: string) {
    return this.apiCall(`/products/${productId}/views`, {
      method: "POST",
    });
  }

  async createProduct(productData: {
    artisan_id: string;
    category_id: string;
    name: string;
    description: string;
    price: number;
    original_price?: number;
    images: string[];
    features?: string[];
    tags?: string[];
    stock_quantity: number;
    sku?: string;
    weight?: number;
    dimensions?: any;
    materials?: string[];
    care_instructions?: string;
    is_featured?: boolean;
  }) {
    return this.apiCall("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(productId: string, updates: any) {
    return this.apiCall(`/products/${productId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteProduct(productId: string) {
    return this.apiCall(`/products/${productId}`, {
      method: "DELETE",
    });
  }

  // =============================================
  // CART OPERATIONS
  // =============================================

  async getCartItems(userId?: string) {
    // Get current user's cart items
    return this.apiCall("/cart");
  }

  async addToCart(userId: string, productId: string, quantity: number) {
    return this.apiCall("/cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async updateCartItem(userId: string, productId: string, quantity: number) {
    return this.apiCall("/cart", {
      method: "PUT",
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async updateCartItemQuantity(productId: string, quantity: number) {
    return this.apiCall("/cart", {
      method: "PUT",
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async removeFromCart(userId: string, productId: string) {
    return this.apiCall("/cart", {
      method: "DELETE",
      body: JSON.stringify({ productId }),
    });
  }

  async clearCart(userId: string) {
    return this.apiCall(`/cart/${userId}/clear`, {
      method: "DELETE",
    });
  }

  // =============================================
  // ORDER OPERATIONS
  // =============================================

  async createOrder(orderData: {
    customer_id: string;
    items: Array<{
      product_id: string;
      artisan_id: string;
      quantity: number;
      unit_price: number;
    }>;
    subtotal: number;
    tax_amount: number;
    shipping_cost: number;
    discount_amount: number;
    total_amount: number;
    shipping_address: any;
    billing_address?: any;
    payment_method?: string;
    notes?: string;
  }) {
    return this.apiCall("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(
    userId: string,
    options: { limit?: number; offset?: number } = {}
  ) {
    const params = new URLSearchParams();
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.offset) params.append("offset", options.offset.toString());

    return this.apiCall(`/orders?${params.toString()}`);
  }

  async getUserOrders(
    userId: string,
    options: { limit?: number; offset?: number } = {}
  ) {
    // Alias for getOrders to maintain compatibility
    return this.getOrders(userId, options);
  }

  async cancelOrder(orderId: string) {
    return this.apiCall(`/orders/${orderId}/cancel`, {
      method: "POST",
    });
  }

  async getOrderById(orderId: string) {
    return this.apiCall(`/orders/detail/${orderId}`);
  }

  // =============================================
  // REVIEW OPERATIONS
  // =============================================

  async getProductReviews(
    productId: string,
    options: { limit?: number; offset?: number } = {}
  ) {
    const params = new URLSearchParams();
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.offset) params.append("offset", options.offset.toString());

    return this.apiCall(`/reviews/${productId}?${params.toString()}`);
  }

  async createReview(reviewData: {
    product_id: string;
    customer_id: string;
    order_item_id?: string;
    rating: number;
    title?: string;
    comment?: string;
    images?: string[];
  }) {
    return this.apiCall("/reviews", {
      method: "POST",
      body: JSON.stringify(reviewData),
    });
  }

  // =============================================
  // UTILITY METHODS (for compatibility with existing code)
  // =============================================

  // Helper method for search functionality
  async searchProducts(
    query: string,
    options: { category?: string; limit?: number } = {}
  ) {
    return this.getProducts({
      search: query,
      category: options.category,
      limit: options.limit,
      is_active: true,
    });
  }

  // Helper method for featured products
  async getFeaturedProducts(limit?: number) {
    return this.getProducts({
      is_featured: true,
      is_active: true,
      limit,
    });
  }

  // Helper method for artisan's products
  async getArtisanProducts(
    artisanId: string,
    options: { limit?: number; offset?: number } = {}
  ) {
    return this.getProducts({
      artisan_id: artisanId,
      is_active: true,
      ...options,
    });
  }

  // Helper method for getting artisan orders
  async getArtisanOrders(
    artisanId?: string,
    options: { limit?: number; offset?: number } = {}
  ) {
    const params = new URLSearchParams();
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.offset) params.append("offset", options.offset.toString());

    return this.apiCall(`/artisan-orders?${params.toString()}`);
  }

  // Helper method for updating full artisan profile (both user and artisan)
  async updateArtisanFullProfile(
    userId: string,
    updates: {
      profile?: any;
      artisanProfile?: any;
    }
  ) {
    const promises = [];

    if (updates.profile) {
      promises.push(this.updateUserProfile(userId, updates.profile));
    }

    if (updates.artisanProfile) {
      promises.push(this.updateArtisanProfile(userId, updates.artisanProfile));
    }

    const results = await Promise.all(promises);

    return {
      profile: updates.profile ? results[0] : null,
      artisanProfile: updates.artisanProfile
        ? results[updates.profile ? 1 : 0]
        : null,
    };
  }

  // Helper method for category products
  async getCategoryProducts(
    categorySlug: string,
    options: { limit?: number; offset?: number } = {}
  ) {
    return this.getProducts({
      category: categorySlug,
      is_active: true,
      ...options,
    });
  }
}

// Export singleton instance
export const clientDb = new ClientDatabaseOperations();
