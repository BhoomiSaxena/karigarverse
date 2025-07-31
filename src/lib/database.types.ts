export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)";
  };
  public: {
    Tables: {
      artisan_profiles: {
        Row: {
          banner_image: string | null;
          business_license: string | null;
          commission_rate: number | null;
          contact_email: string | null;
          contact_phone: string | null;
          created_at: string;
          description: string | null;
          established_year: number | null;
          experience_years: number | null;
          id: string;
          location: string | null;
          rating: number | null;
          shop_logo: string | null;
          shop_name: string;
          specialties: string[] | null;
          status: string | null;
          total_orders: number | null;
          total_sales: number | null;
          updated_at: string;
          user_id: string;
          verification_status: string | null;
          website_url: string | null;
          // Additional fields for extended artisan profile
          social_media: Json | null;
          business_hours: Json | null;
          portfolio_images: string[] | null;
          certificates: string[] | null;
          awards: string[] | null;
          delivery_info: Json | null;
          payment_methods: string[] | null;
          return_policy: string | null;
          shipping_policy: string | null;
          preferred_language: string | null;
          notification_preferences: Json | null;
        };
        Insert: {
          banner_image?: string | null;
          business_license?: string | null;
          commission_rate?: number | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          description?: string | null;
          established_year?: number | null;
          experience_years?: number | null;
          id?: string;
          location?: string | null;
          rating?: number | null;
          shop_logo?: string | null;
          shop_name: string;
          specialties?: string[] | null;
          status?: string | null;
          total_orders?: number | null;
          total_sales?: number | null;
          updated_at?: string;
          user_id: string;
          verification_status?: string | null;
          website_url?: string | null;
          // Additional fields for extended artisan profile
          social_media?: Json | null;
          business_hours?: Json | null;
          portfolio_images?: string[] | null;
          certificates?: string[] | null;
          awards?: string[] | null;
          delivery_info?: Json | null;
          payment_methods?: string[] | null;
          return_policy?: string | null;
          shipping_policy?: string | null;
          preferred_language?: string | null;
          notification_preferences?: Json | null;
        };
        Update: {
          banner_image?: string | null;
          business_license?: string | null;
          commission_rate?: number | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          description?: string | null;
          established_year?: number | null;
          experience_years?: number | null;
          id?: string;
          location?: string | null;
          rating?: number | null;
          shop_logo?: string | null;
          shop_name?: string;
          specialties?: string[] | null;
          status?: string | null;
          total_orders?: number | null;
          total_sales?: number | null;
          updated_at?: string;
          user_id?: string;
          verification_status?: string | null;
          website_url?: string | null;
          // Additional fields for extended artisan profile
          social_media?: Json | null;
          business_hours?: Json | null;
          portfolio_images?: string[] | null;
          certificates?: string[] | null;
          awards?: string[] | null;
          delivery_info?: Json | null;
          payment_methods?: string[] | null;
          return_policy?: string | null;
          shipping_policy?: string | null;
          preferred_language?: string | null;
          notification_preferences?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "artisan_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      cart_items: {
        Row: {
          created_at: string;
          id: string;
          product_id: string;
          quantity: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          product_id: string;
          quantity: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          product_id?: string;
          quantity?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "product_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cart_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cart_items_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      categories: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          image_url: string | null;
          is_active: boolean | null;
          name: string;
          parent_id: string | null;
          slug: string;
          sort_order: number | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean | null;
          name: string;
          parent_id?: string | null;
          slug: string;
          sort_order?: number | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean | null;
          name?: string;
          parent_id?: string | null;
          slug?: string;
          sort_order?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      notifications: {
        Row: {
          created_at: string;
          data: Json | null;
          id: string;
          is_read: boolean | null;
          message: string;
          title: string;
          type: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          data?: Json | null;
          id?: string;
          is_read?: boolean | null;
          message: string;
          title: string;
          type: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          data?: Json | null;
          id?: string;
          is_read?: boolean | null;
          message?: string;
          title?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      order_items: {
        Row: {
          artisan_id: string;
          created_at: string;
          delivered_at: string | null;
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          shipped_at: string | null;
          status: string | null;
          total_price: number;
          tracking_number: string | null;
          unit_price: number;
          updated_at: string;
        };
        Insert: {
          artisan_id: string;
          created_at?: string;
          delivered_at?: string | null;
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          shipped_at?: string | null;
          status?: string | null;
          total_price: number;
          tracking_number?: string | null;
          unit_price: number;
          updated_at?: string;
        };
        Update: {
          artisan_id?: string;
          created_at?: string;
          delivered_at?: string | null;
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          shipped_at?: string | null;
          status?: string | null;
          total_price?: number;
          tracking_number?: string | null;
          unit_price?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_artisan_id_fkey";
            columns: ["artisan_id"];
            isOneToOne: false;
            referencedRelation: "artisan_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "order_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "product_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: {
          billing_address: Json | null;
          created_at: string;
          currency: string | null;
          customer_id: string;
          discount_amount: number | null;
          id: string;
          notes: string | null;
          order_number: string;
          payment_method: string | null;
          payment_status: string | null;
          shipping_address: Json;
          shipping_cost: number | null;
          status: string | null;
          subtotal: number;
          tax_amount: number | null;
          total_amount: number;
          tracking_number: string | null;
          updated_at: string;
        };
        Insert: {
          billing_address?: Json | null;
          created_at?: string;
          currency?: string | null;
          customer_id: string;
          discount_amount?: number | null;
          id?: string;
          notes?: string | null;
          order_number: string;
          payment_method?: string | null;
          payment_status?: string | null;
          shipping_address: Json;
          shipping_cost?: number | null;
          status?: string | null;
          subtotal: number;
          tax_amount?: number | null;
          total_amount: number;
          tracking_number?: string | null;
          updated_at?: string;
        };
        Update: {
          billing_address?: Json | null;
          created_at?: string;
          currency?: string | null;
          customer_id?: string;
          discount_amount?: number | null;
          id?: string;
          notes?: string | null;
          order_number?: string;
          payment_method?: string | null;
          payment_status?: string | null;
          shipping_address?: Json;
          shipping_cost?: number | null;
          status?: string | null;
          subtotal?: number;
          tax_amount?: number | null;
          total_amount?: number;
          tracking_number?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      products: {
        Row: {
          artisan_id: string;
          care_instructions: string | null;
          category_id: string;
          created_at: string;
          description: string;
          dimensions: Json | null;
          features: string[] | null;
          id: string;
          images: string[];
          is_active: boolean | null;
          is_featured: boolean | null;
          materials: string[] | null;
          name: string;
          original_price: number | null;
          price: number;
          sku: string | null;
          stock_quantity: number;
          tags: string[] | null;
          updated_at: string;
          views_count: number | null;
          weight: number | null;
        };
        Insert: {
          artisan_id: string;
          care_instructions?: string | null;
          category_id: string;
          created_at?: string;
          description: string;
          dimensions?: Json | null;
          features?: string[] | null;
          id?: string;
          images: string[];
          is_active?: boolean | null;
          is_featured?: boolean | null;
          materials?: string[] | null;
          name: string;
          original_price?: number | null;
          price: number;
          sku?: string | null;
          stock_quantity?: number;
          tags?: string[] | null;
          updated_at?: string;
          views_count?: number | null;
          weight?: number | null;
        };
        Update: {
          artisan_id?: string;
          care_instructions?: string | null;
          category_id?: string;
          created_at?: string;
          description?: string;
          dimensions?: Json | null;
          features?: string[] | null;
          id?: string;
          images?: string[];
          is_active?: boolean | null;
          is_featured?: boolean | null;
          materials?: string[] | null;
          name?: string;
          original_price?: number | null;
          price?: number;
          sku?: string | null;
          stock_quantity?: number;
          tags?: string[] | null;
          updated_at?: string;
          views_count?: number | null;
          weight?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "products_artisan_id_fkey";
            columns: ["artisan_id"];
            isOneToOne: false;
            referencedRelation: "artisan_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          address: Json | null;
          avatar_url: string | null;
          created_at: string;
          date_of_birth: string | null;
          email: string;
          first_name: string;
          full_name: string | null;
          id: string;
          last_name: string;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          address?: Json | null;
          avatar_url?: string | null;
          created_at?: string;
          date_of_birth?: string | null;
          email: string;
          first_name: string;
          full_name?: string | null;
          id: string;
          last_name: string;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          address?: Json | null;
          avatar_url?: string | null;
          created_at?: string;
          date_of_birth?: string | null;
          email?: string;
          first_name?: string;
          full_name?: string | null;
          id?: string;
          last_name?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          comment: string | null;
          created_at: string;
          customer_id: string;
          helpful_count: number | null;
          id: string;
          images: string[] | null;
          is_verified_purchase: boolean | null;
          order_item_id: string | null;
          product_id: string;
          rating: number;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          customer_id: string;
          helpful_count?: number | null;
          id?: string;
          images?: string[] | null;
          is_verified_purchase?: boolean | null;
          order_item_id?: string | null;
          product_id: string;
          rating: number;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          customer_id?: string;
          helpful_count?: number | null;
          id?: string;
          images?: string[] | null;
          is_verified_purchase?: boolean | null;
          order_item_id?: string | null;
          product_id?: string;
          rating?: number;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_order_item_id_fkey";
            columns: ["order_item_id"];
            isOneToOne: false;
            referencedRelation: "order_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "product_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      order_details: {
        Row: {
          billing_address: Json | null;
          created_at: string | null;
          currency: string | null;
          customer_email: string | null;
          customer_id: string | null;
          customer_name: string | null;
          discount_amount: number | null;
          id: string | null;
          item_count: number | null;
          notes: string | null;
          order_number: string | null;
          payment_method: string | null;
          payment_status: string | null;
          shipping_address: Json | null;
          shipping_cost: number | null;
          status: string | null;
          subtotal: number | null;
          tax_amount: number | null;
          total_amount: number | null;
          tracking_number: string | null;
          updated_at: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      product_details: {
        Row: {
          artisan_id: string | null;
          artisan_location: string | null;
          artisan_rating: number | null;
          artisan_shop_name: string | null;
          average_rating: number | null;
          care_instructions: string | null;
          category_id: string | null;
          category_name: string | null;
          category_slug: string | null;
          created_at: string | null;
          description: string | null;
          dimensions: Json | null;
          features: string[] | null;
          id: string | null;
          images: string[] | null;
          is_active: boolean | null;
          is_featured: boolean | null;
          materials: string[] | null;
          name: string | null;
          original_price: number | null;
          price: number | null;
          review_count: number | null;
          sku: string | null;
          stock_quantity: number | null;
          tags: string[] | null;
          updated_at: string | null;
          views_count: number | null;
          weight: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "products_artisan_id_fkey";
            columns: ["artisan_id"];
            isOneToOne: false;
            referencedRelation: "artisan_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;

// Define ArtisanProfileData type based on the artisan_profiles table
export type ArtisanProfileData = Tables<"artisan_profiles">;
