import { createClient } from '@/utils/supabase/server'
import { createClient as createBrowserClient } from '@/utils/supabase/client'
import type { Database } from './database.types'

// Server-side database operations
export class DatabaseOperations {
  private supabase: ReturnType<typeof createClient>

  constructor() {
    this.supabase = createClient()
  }

  // =============================================
  // USER PROFILE OPERATIONS
  // =============================================

  async createUserProfile(userData: {
    id: string
    first_name: string
    last_name: string
    email: string
    phone?: string
  }) {
    const { data, error } = await this.supabase
      .from('profiles')
      .insert([userData])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getUserProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  }

  async updateUserProfile(userId: string, updates: Partial<Database['public']['Tables']['profiles']['Update']>) {
    const { data, error } = await this.supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // =============================================
  // ARTISAN PROFILE OPERATIONS
  // =============================================

  async createArtisanProfile(artisanData: Database['public']['Tables']['artisan_profiles']['Insert']) {
    const { data, error } = await this.supabase
      .from('artisan_profiles')
      .insert([artisanData])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getArtisanProfile(artisanId: string) {
    const { data, error } = await this.supabase
      .from('artisan_profiles')
      .select('*')
      .eq('id', artisanId)
      .single()

    if (error) throw error
    return data
  }

  async updateArtisanProfile(artisanId: string, updates: Partial<Database['public']['Tables']['artisan_profiles']['Update']>) {
    const { data, error } = await this.supabase
      .from('artisan_profiles')
      .update(updates)
      .eq('id', artisanId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getActiveArtisans(limit = 10, offset = 0) {
    const { data, error } = await this.supabase
      .from('artisan_profiles')
      .select('*')
      .eq('status', 'active')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  // =============================================
  // PRODUCT OPERATIONS
  // =============================================

  async createProduct(productData: Database['public']['Tables']['products']['Insert']) {
    const { data, error } = await this.supabase
      .from('products')
      .insert([productData])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getProduct(productId: string) {
    const { data, error } = await this.supabase
      .from('product_details')
      .select('*')
      .eq('id', productId)
      .single()

    if (error) throw error
    return data
  }

  async getProducts(filters: {
    category?: string
    artisanId?: string
    isActive?: boolean
    isFeatured?: boolean
    limit?: number
    offset?: number
    search?: string
  } = {}) {
    let query = this.supabase
      .from('product_details')
      .select('*')

    if (filters.category) {
      query = query.eq('category_id', filters.category)
    }

    if (filters.artisanId) {
      query = query.eq('artisan_id', filters.artisanId)
    }

    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive)
    }

    if (filters.isFeatured !== undefined) {
      query = query.eq('is_featured', filters.isFeatured)
    }

    if (filters.search) {
      query = query.textSearch('name', filters.search)
    }

    const limit = filters.limit || 20
    const offset = filters.offset || 0

    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) throw error
    return data
  }

  async updateProduct(productId: string, updates: Partial<Database['public']['Tables']['products']['Update']>) {
    const { data, error } = await this.supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteProduct(productId: string) {
    const { error } = await this.supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) throw error
  }

  async incrementProductViews(productId: string) {
    const { error } = await this.supabase
      .from('products')
      .update({ views_count: this.supabase.sql`views_count + 1` })
      .eq('id', productId)

    if (error) throw error
  }

  // =============================================
  // CATEGORY OPERATIONS
  // =============================================

  async getCategories() {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return data
  }

  // =============================================
  // CART OPERATIONS
  // =============================================

  async addToCart(userId: string, productId: string, quantity: number) {
    const { data, error } = await this.supabase
      .from('cart_items')
      .upsert({
        user_id: userId,
        product_id: productId,
        quantity: quantity
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getCartItems(userId: string) {
    const { data, error } = await this.supabase
      .from('cart_items')
      .select(`
        *,
        products:product_id (
          id,
          name,
          price,
          images,
          stock_quantity,
          is_active,
          artisan_profiles:artisan_id (
            shop_name
          )
        )
      `)
      .eq('user_id', userId)

    if (error) throw error
    return data
  }

  async updateCartItem(cartItemId: string, quantity: number) {
    const { data, error } = await this.supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async removeFromCart(cartItemId: string) {
    const { error } = await this.supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)

    if (error) throw error
  }

  async clearCart(userId: string) {
    const { error } = await this.supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)

    if (error) throw error
  }

  // =============================================
  // ORDER OPERATIONS
  // =============================================

  async createOrder(orderData: Database['public']['Tables']['orders']['Insert']) {
    const { data, error } = await this.supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async createOrderItems(orderItems: Database['public']['Tables']['order_items']['Insert'][]) {
    const { data, error } = await this.supabase
      .from('order_items')
      .insert(orderItems)
      .select()

    if (error) throw error
    return data
  }

  async getCustomerOrders(customerId: string, limit = 10, offset = 0) {
    const { data, error } = await this.supabase
      .from('order_details')
      .select('*')
      .eq('customer_id', customerId)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async getArtisanOrders(artisanId: string, limit = 10, offset = 0) {
    const { data, error } = await this.supabase
      .from('order_items')
      .select(`
        *,
        orders:order_id (
          id,
          order_number,
          status,
          total_amount,
          created_at,
          shipping_address,
          profiles:customer_id (
            full_name,
            email
          )
        ),
        products:product_id (
          name,
          images
        )
      `)
      .eq('artisan_id', artisanId)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async updateOrderStatus(orderId: string, status: string) {
    const { data, error } = await this.supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateOrderItemStatus(orderItemId: string, status: string, trackingNumber?: string) {
    const updates: any = { status }
    if (trackingNumber) {
      updates.tracking_number = trackingNumber
    }
    if (status === 'shipped') {
      updates.shipped_at = new Date().toISOString()
    }
    if (status === 'delivered') {
      updates.delivered_at = new Date().toISOString()
    }

    const { data, error } = await this.supabase
      .from('order_items')
      .update(updates)
      .eq('id', orderItemId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // =============================================
  // REVIEW OPERATIONS
  // =============================================

  async createReview(reviewData: Database['public']['Tables']['reviews']['Insert']) {
    const { data, error } = await this.supabase
      .from('reviews')
      .insert([reviewData])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getProductReviews(productId: string, limit = 10, offset = 0) {
    const { data, error } = await this.supabase
      .from('reviews')
      .select(`
        *,
        profiles:customer_id (
          full_name,
          avatar_url
        )
      `)
      .eq('product_id', productId)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  // =============================================
  // NOTIFICATION OPERATIONS
  // =============================================

  async createNotification(notificationData: Database['public']['Tables']['notifications']['Insert']) {
    const { data, error } = await this.supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getUserNotifications(userId: string, unreadOnly = false) {
    let query = this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    return data
  }

  async markNotificationAsRead(notificationId: string) {
    const { error } = await this.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (error) throw error
  }

  async markAllNotificationsAsRead(userId: string) {
    const { error } = await this.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) throw error
  }
}

// Client-side database operations (for browser usage)
export class ClientDatabaseOperations {
  private supabase: ReturnType<typeof createBrowserClient>

  constructor() {
    this.supabase = createBrowserClient()
  }

  // Add similar methods as above but using the browser client
  // This is useful for real-time subscriptions and client-side operations

  async subscribeToOrderUpdates(customerId: string, callback: (payload: any) => void) {
    return this.supabase
      .channel('order_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `customer_id=eq.${customerId}`
        },
        callback
      )
      .subscribe()
  }

  async subscribeToArtisanOrderUpdates(artisanId: string, callback: (payload: any) => void) {
    return this.supabase
      .channel('artisan_order_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items',
          filter: `artisan_id=eq.${artisanId}`
        },
        callback
      )
      .subscribe()
  }

  async subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    return this.supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }
}

// Utility functions
export const db = new DatabaseOperations()
export const clientDb = new ClientDatabaseOperations()
