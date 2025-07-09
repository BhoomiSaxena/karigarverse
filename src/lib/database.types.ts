export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string
          last_name: string
          full_name: string | null
          email: string
          phone: string | null
          avatar_url: string | null
          date_of_birth: string | null
          address: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name: string
          last_name: string
          full_name?: string | null
          email: string
          phone?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          address?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          full_name?: string | null
          email?: string
          phone?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          address?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      artisan_profiles: {
        Row: {
          id: string
          user_id: string
          shop_name: string
          description: string | null
          specialties: string[] | null
          location: string | null
          business_license: string | null
          verification_status: string
          status: string
          commission_rate: number
          total_sales: number
          total_orders: number
          rating: number | null
          banner_image: string | null
          shop_logo: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          shop_name: string
          description?: string | null
          specialties?: string[] | null
          location?: string | null
          business_license?: string | null
          verification_status?: string
          status?: string
          commission_rate?: number
          total_sales?: number
          total_orders?: number
          rating?: number | null
          banner_image?: string | null
          shop_logo?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          shop_name?: string
          description?: string | null
          specialties?: string[] | null
          location?: string | null
          business_license?: string | null
          verification_status?: string
          status?: string
          commission_rate?: number
          total_sales?: number
          total_orders?: number
          rating?: number | null
          banner_image?: string | null
          shop_logo?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "artisan_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          parent_id: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          id: string
          artisan_id: string
          category_id: string
          name: string
          description: string
          price: number
          original_price: number | null
          images: string[]
          features: string[] | null
          tags: string[] | null
          stock_quantity: number
          sku: string | null
          weight: number | null
          dimensions: Json | null
          materials: string[] | null
          care_instructions: string | null
          is_active: boolean
          is_featured: boolean
          views_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          artisan_id: string
          category_id: string
          name: string
          description: string
          price: number
          original_price?: number | null
          images: string[]
          features?: string[] | null
          tags?: string[] | null
          stock_quantity: number
          sku?: string | null
          weight?: number | null
          dimensions?: Json | null
          materials?: string[] | null
          care_instructions?: string | null
          is_active?: boolean
          is_featured?: boolean
          views_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          artisan_id?: string
          category_id?: string
          name?: string
          description?: string
          price?: number
          original_price?: number | null
          images?: string[]
          features?: string[] | null
          tags?: string[] | null
          stock_quantity?: number
          sku?: string | null
          weight?: number | null
          dimensions?: Json | null
          materials?: string[] | null
          care_instructions?: string | null
          is_active?: boolean
          is_featured?: boolean
          views_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "artisan_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string
          status: string
          payment_status: string
          payment_method: string | null
          subtotal: number
          tax_amount: number
          shipping_cost: number
          discount_amount: number
          total_amount: number
          currency: string
          shipping_address: Json
          billing_address: Json | null
          notes: string | null
          tracking_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          customer_id: string
          status?: string
          payment_status?: string
          payment_method?: string | null
          subtotal: number
          tax_amount?: number
          shipping_cost?: number
          discount_amount?: number
          total_amount: number
          currency?: string
          shipping_address: Json
          billing_address?: Json | null
          notes?: string | null
          tracking_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string
          status?: string
          payment_status?: string
          payment_method?: string | null
          subtotal?: number
          tax_amount?: number
          shipping_cost?: number
          discount_amount?: number
          total_amount?: number
          currency?: string
          shipping_address?: Json
          billing_address?: Json | null
          notes?: string | null
          tracking_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          artisan_id: string
          quantity: number
          unit_price: number
          total_price: number
          status: string
          tracking_number: string | null
          shipped_at: string | null
          delivered_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          artisan_id: string
          quantity: number
          unit_price: number
          total_price: number
          status?: string
          tracking_number?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          artisan_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          status?: string
          tracking_number?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "artisan_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          customer_id: string
          order_item_id: string | null
          rating: number
          title: string | null
          comment: string | null
          images: string[] | null
          is_verified_purchase: boolean
          helpful_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          customer_id: string
          order_item_id?: string | null
          rating: number
          title?: string | null
          comment?: string | null
          images?: string[] | null
          is_verified_purchase?: boolean
          helpful_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          customer_id?: string
          order_item_id?: string | null
          rating?: number
          title?: string | null
          comment?: string | null
          images?: string[] | null
          is_verified_purchase?: boolean
          helpful_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          data: Json | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          data?: Json | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          data?: Json | null
          is_read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      product_details: {
        Row: {
          id: string
          artisan_id: string
          category_id: string
          name: string
          description: string
          price: number
          original_price: number | null
          images: string[]
          features: string[] | null
          tags: string[] | null
          stock_quantity: number
          sku: string | null
          weight: number | null
          dimensions: Json | null
          materials: string[] | null
          care_instructions: string | null
          is_active: boolean
          is_featured: boolean
          views_count: number
          created_at: string
          updated_at: string
          category_name: string | null
          category_slug: string | null
          artisan_shop_name: string | null
          artisan_rating: number | null
          artisan_location: string | null
          average_rating: number | null
          review_count: number | null
        }
        Relationships: []
      }
      order_details: {
        Row: {
          id: string
          order_number: string
          customer_id: string
          status: string
          payment_status: string
          payment_method: string | null
          subtotal: number
          tax_amount: number
          shipping_cost: number
          discount_amount: number
          total_amount: number
          currency: string
          shipping_address: Json
          billing_address: Json | null
          notes: string | null
          tracking_number: string | null
          created_at: string
          updated_at: string
          customer_name: string | null
          customer_email: string | null
          item_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
