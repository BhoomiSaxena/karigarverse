/**
 * PostgreSQL Database Operations - Server Side
 * Replaces the Supabase-based database.ts
 */

import { query, transaction } from "./postgres-config";
import type { Database } from "./database.types";

// Server-side database operations ONLY
// Do not import this in client components!

export class DatabaseOperations {
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
    try {
      const result = await query(
        "INSERT INTO profiles (id, first_name, last_name, email, phone) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [
          userData.id,
          userData.first_name,
          userData.last_name,
          userData.email,
          userData.phone,
        ]
      );
      return result.rows[0];
    } catch (error: any) {
      throw new Error(`Failed to create user profile: ${error.message}`);
    }
  }

  async getUserProfile(userId: string) {
    try {
      const result = await query("SELECT * FROM profiles WHERE id = $1", [
        userId,
      ]);
      if (result.rows.length === 0) {
        throw new Error("Profile not found");
      }
      return result.rows[0];
    } catch (error: any) {
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  }

  async updateUserProfile(userId: string, updates: any) {
    try {
      const setClause = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(", ");

      const values = Object.values(updates);

      const result = await query(
        `UPDATE profiles SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
        [userId, ...values]
      );

      if (result.rows.length === 0) {
        throw new Error("Profile not found");
      }
      return result.rows[0];
    } catch (error: any) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }
  }

  // =============================================
  // ARTISAN PROFILE OPERATIONS
  // =============================================

  async createArtisanProfile(artisanData: {
    user_id: string;
    shop_name: string;
    description?: string;
    specialties?: string[];
    location?: string;
    business_license?: string;
  }) {
    try {
      const result = await query(
        "INSERT INTO artisan_profiles (user_id, shop_name, description, specialties, location, business_license) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [
          artisanData.user_id,
          artisanData.shop_name,
          artisanData.description,
          artisanData.specialties,
          artisanData.location,
          artisanData.business_license,
        ]
      );
      return result.rows[0];
    } catch (error: any) {
      throw new Error(`Failed to create artisan profile: ${error.message}`);
    }
  }

  async getArtisanProfile(userId: string) {
    try {
      const result = await query(
        "SELECT * FROM artisan_profiles WHERE user_id = $1",
        [userId]
      );
      return result.rows[0] || null;
    } catch (error: any) {
      throw new Error(`Failed to get artisan profile: ${error.message}`);
    }
  }

  async getArtisanProfileById(artisanId: string) {
    try {
      const result = await query(
        "SELECT * FROM artisan_profiles WHERE id = $1",
        [artisanId]
      );
      return result.rows[0] || null;
    } catch (error: any) {
      throw new Error(`Failed to get artisan profile by ID: ${error.message}`);
    }
  }

  async updateArtisanProfile(userId: string, updates: any) {
    try {
      const setClause = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(", ");

      const values = Object.values(updates);

      const result = await query(
        `UPDATE artisan_profiles SET ${setClause}, updated_at = NOW() WHERE user_id = $1 RETURNING *`,
        [userId, ...values]
      );

      if (result.rows.length === 0) {
        throw new Error("Artisan profile not found");
      }
      return result.rows[0];
    } catch (error: any) {
      throw new Error(`Failed to update artisan profile: ${error.message}`);
    }
  }

  // =============================================
  // CATEGORY OPERATIONS
  // =============================================

  async getCategories(options: { includeInactive?: boolean } = {}) {
    try {
      let queryText = "SELECT * FROM categories";
      const params: any[] = [];

      if (!options.includeInactive) {
        queryText += " WHERE is_active = true";
      }

      queryText += " ORDER BY sort_order, name";

      const result = await query(queryText, params);
      return result.rows;
    } catch (error: any) {
      throw new Error(`Failed to get categories: ${error.message}`);
    }
  }

  async getCategoryBySlug(slug: string) {
    try {
      const result = await query(
        "SELECT * FROM categories WHERE slug = $1 AND is_active = true",
        [slug]
      );
      return result.rows[0] || null;
    } catch (error: any) {
      throw new Error(`Failed to get category: ${error.message}`);
    }
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
    try {
      let queryText = `
        SELECT p.*, c.name as category_name, c.slug as category_slug,
               ap.shop_name as artisan_shop_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN artisan_profiles ap ON p.artisan_id = ap.id
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;

      if (options.category) {
        queryText += ` AND c.slug = $${paramIndex}`;
        params.push(options.category);
        paramIndex++;
      }

      if (options.artisan_id) {
        queryText += ` AND p.artisan_id = $${paramIndex}`;
        params.push(options.artisan_id);
        paramIndex++;
      }

      if (options.is_featured !== undefined) {
        queryText += ` AND p.is_featured = $${paramIndex}`;
        params.push(options.is_featured);
        paramIndex++;
      }

      if (options.is_active !== undefined) {
        queryText += ` AND p.is_active = $${paramIndex}`;
        params.push(options.is_active);
        paramIndex++;
      }

      if (options.search) {
        queryText += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex} OR $${paramIndex} = ANY(p.tags))`;
        params.push(`%${options.search}%`);
        paramIndex++;
      }

      queryText += " ORDER BY p.created_at DESC";

      if (options.limit) {
        queryText += ` LIMIT $${paramIndex}`;
        params.push(options.limit);
        paramIndex++;
      }

      if (options.offset) {
        queryText += ` OFFSET $${paramIndex}`;
        params.push(options.offset);
        paramIndex++;
      }

      const result = await query(queryText, params);
      return result.rows;
    } catch (error: any) {
      throw new Error(`Failed to get products: ${error.message}`);
    }
  }

  async getProductById(productId: string) {
    try {
      const result = await query(
        `SELECT p.*, c.name as category_name, c.slug as category_slug,
                ap.shop_name as artisan_shop_name, ap.user_id as artisan_user_id
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         LEFT JOIN artisan_profiles ap ON p.artisan_id = ap.id
         WHERE p.id = $1`,
        [productId]
      );

      if (result.rows.length === 0) {
        throw new Error("Product not found");
      }
      return result.rows[0];
    } catch (error: any) {
      throw new Error(`Failed to get product: ${error.message}`);
    }
  }

  async incrementProductViews(productId: string) {
    try {
      const result = await query(
        "UPDATE products SET views_count = COALESCE(views_count, 0) + 1 WHERE id = $1 RETURNING views_count",
        [productId]
      );
      return result.rows[0]?.views_count || 0;
    } catch (error: any) {
      throw new Error(`Failed to increment product views: ${error.message}`);
    }
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
    try {
      const result = await query(
        `INSERT INTO products (
          artisan_id, category_id, name, description, price, original_price,
          images, features, tags, stock_quantity, sku, weight, dimensions,
          materials, care_instructions, is_featured
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *`,
        [
          productData.artisan_id,
          productData.category_id,
          productData.name,
          productData.description,
          productData.price,
          productData.original_price,
          productData.images,
          productData.features,
          productData.tags,
          productData.stock_quantity,
          productData.sku,
          productData.weight,
          productData.dimensions,
          productData.materials,
          productData.care_instructions,
          productData.is_featured,
        ]
      );
      return result.rows[0];
    } catch (error: any) {
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  async updateProduct(productId: string, updates: any) {
    try {
      const setClause = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(", ");

      const values = Object.values(updates);

      const result = await query(
        `UPDATE products SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
        [productId, ...values]
      );

      if (result.rows.length === 0) {
        throw new Error("Product not found");
      }
      return result.rows[0];
    } catch (error: any) {
      throw new Error(`Failed to update product: ${error.message}`);
    }
  }

  async deleteProduct(productId: string) {
    try {
      const result = await query(
        "DELETE FROM products WHERE id = $1 RETURNING id",
        [productId]
      );

      if (result.rows.length === 0) {
        throw new Error("Product not found");
      }
      return { success: true };
    } catch (error: any) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }

  // =============================================
  // CART OPERATIONS
  // =============================================

  async getCartItems(userId: string) {
    try {
      const result = await query(
        `SELECT ci.*, p.name as product_name, p.price, p.images, p.stock_quantity,
                ap.shop_name as artisan_shop_name
         FROM cart_items ci
         JOIN products p ON ci.product_id = p.id
         JOIN artisan_profiles ap ON p.artisan_id = ap.id
         WHERE ci.user_id = $1
         ORDER BY ci.created_at DESC`,
        [userId]
      );
      return result.rows;
    } catch (error: any) {
      throw new Error(`Failed to get cart items: ${error.message}`);
    }
  }

  async addToCart(userId: string, productId: string, quantity: number) {
    try {
      const result = await query(
        `INSERT INTO cart_items (user_id, product_id, quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, product_id)
         DO UPDATE SET quantity = cart_items.quantity + $3, updated_at = NOW()
         RETURNING *`,
        [userId, productId, quantity]
      );
      return result.rows[0];
    } catch (error: any) {
      throw new Error(`Failed to add to cart: ${error.message}`);
    }
  }

  async updateCartItem(userId: string, productId: string, quantity: number) {
    try {
      if (quantity <= 0) {
        return this.removeFromCart(userId, productId);
      }

      const result = await query(
        "UPDATE cart_items SET quantity = $3, updated_at = NOW() WHERE user_id = $1 AND product_id = $2 RETURNING *",
        [userId, productId, quantity]
      );

      if (result.rows.length === 0) {
        throw new Error("Cart item not found");
      }
      return result.rows[0];
    } catch (error: any) {
      throw new Error(`Failed to update cart item: ${error.message}`);
    }
  }

  async removeFromCart(userId: string, productId: string) {
    try {
      const result = await query(
        "DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2 RETURNING id",
        [userId, productId]
      );

      if (result.rows.length === 0) {
        throw new Error("Cart item not found");
      }
      return { success: true };
    } catch (error: any) {
      throw new Error(`Failed to remove from cart: ${error.message}`);
    }
  }

  async clearCart(userId: string) {
    try {
      await query("DELETE FROM cart_items WHERE user_id = $1", [userId]);
      return { success: true };
    } catch (error: any) {
      throw new Error(`Failed to clear cart: ${error.message}`);
    }
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
    try {
      return await transaction(async (client) => {
        // Generate order number
        const orderNumber = `KV-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)
          .toUpperCase()}`;

        // Create order
        const orderResult = await client.query(
          `INSERT INTO orders (
            order_number, customer_id, subtotal, tax_amount, shipping_cost,
            discount_amount, total_amount, shipping_address, billing_address,
            payment_method, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *`,
          [
            orderNumber,
            orderData.customer_id,
            orderData.subtotal,
            orderData.tax_amount,
            orderData.shipping_cost,
            orderData.discount_amount,
            orderData.total_amount,
            JSON.stringify(orderData.shipping_address),
            orderData.billing_address
              ? JSON.stringify(orderData.billing_address)
              : null,
            orderData.payment_method,
            orderData.notes,
          ]
        );

        const order = orderResult.rows[0];

        // Create order items
        for (const item of orderData.items) {
          await client.query(
            `INSERT INTO order_items (
              order_id, product_id, artisan_id, quantity, unit_price, total_price
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              order.id,
              item.product_id,
              item.artisan_id,
              item.quantity,
              item.unit_price,
              item.quantity * item.unit_price,
            ]
          );

          // Update product stock
          await client.query(
            "UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2",
            [item.quantity, item.product_id]
          );
        }

        // Clear cart
        await client.query("DELETE FROM cart_items WHERE user_id = $1", [
          orderData.customer_id,
        ]);

        return order;
      });
    } catch (error: any) {
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  async getOrders(
    userId: string,
    options: { limit?: number; offset?: number } = {}
  ) {
    try {
      let queryText = `
        SELECT o.*, 
               COUNT(oi.id) as item_count,
               array_agg(p.name) as product_names
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE o.customer_id = $1
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `;
      const params: any[] = [userId];
      let paramIndex = 2;

      if (options.limit) {
        queryText += ` LIMIT $${paramIndex}`;
        params.push(options.limit);
        paramIndex++;
      }

      if (options.offset) {
        queryText += ` OFFSET $${paramIndex}`;
        params.push(options.offset);
        paramIndex++;
      }

      const result = await query(queryText, params);
      return result.rows;
    } catch (error: any) {
      throw new Error(`Failed to get orders: ${error.message}`);
    }
  }

  async getOrderById(orderId: string) {
    try {
      const orderResult = await query("SELECT * FROM orders WHERE id = $1", [
        orderId,
      ]);

      if (orderResult.rows.length === 0) {
        throw new Error("Order not found");
      }

      const order = orderResult.rows[0];

      // Get order items
      const itemsResult = await query(
        `SELECT oi.*, p.name as product_name, p.images as product_images,
                ap.shop_name as artisan_shop_name
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         JOIN artisan_profiles ap ON oi.artisan_id = ap.id
         WHERE oi.order_id = $1`,
        [orderId]
      );

      return {
        ...order,
        items: itemsResult.rows,
      };
    } catch (error: any) {
      throw new Error(`Failed to get order: ${error.message}`);
    }
  }

  // =============================================
  // REVIEW OPERATIONS
  // =============================================

  async getProductReviews(
    productId: string,
    options: { limit?: number; offset?: number } = {}
  ) {
    try {
      let queryText = `
        SELECT r.*, p.first_name || ' ' || p.last_name as customer_name,
               p.avatar_url as customer_avatar
        FROM reviews r
        JOIN profiles p ON r.customer_id = p.id
        WHERE r.product_id = $1
        ORDER BY r.created_at DESC
      `;
      const params: any[] = [productId];
      let paramIndex = 2;

      if (options.limit) {
        queryText += ` LIMIT $${paramIndex}`;
        params.push(options.limit);
        paramIndex++;
      }

      if (options.offset) {
        queryText += ` OFFSET $${paramIndex}`;
        params.push(options.offset);
        paramIndex++;
      }

      const result = await query(queryText, params);
      return result.rows;
    } catch (error: any) {
      throw new Error(`Failed to get reviews: ${error.message}`);
    }
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
    try {
      const result = await query(
        `INSERT INTO reviews (
          product_id, customer_id, order_item_id, rating, title, comment, images, is_verified_purchase
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          reviewData.product_id,
          reviewData.customer_id,
          reviewData.order_item_id,
          reviewData.rating,
          reviewData.title,
          reviewData.comment,
          reviewData.images,
          !!reviewData.order_item_id, // verified if linked to order item
        ]
      );
      return result.rows[0];
    } catch (error: any) {
      throw new Error(`Failed to create review: ${error.message}`);
    }
  }
}

// Export singleton instance
export const db = new DatabaseOperations();
