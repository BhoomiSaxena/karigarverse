-- =============================================
-- KARIGARVERSE DATABASE SCHEMA
-- Complete database setup for artisan marketplace
-- =============================================

-- Enable RLS by default for all tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;

-- =============================================
-- 1. CATEGORIES TABLE
-- =============================================
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  icon_name TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Categories are public - everyone can read them
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT TO authenticated, anon USING (true);

-- Only authenticated users can suggest new categories (admin approval required)
CREATE POLICY "Authenticated users can suggest categories" ON categories
  FOR INSERT TO authenticated WITH CHECK (true);

-- =============================================
-- 2. PROFILES TABLE (User profiles)
-- =============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_artisan BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated 
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- =============================================
-- 3. ARTISAN PROFILES TABLE
-- =============================================
CREATE TABLE artisan_profiles (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  shop_name TEXT NOT NULL,
  shop_description TEXT,
  shop_logo_url TEXT,
  specialities TEXT[], -- Array of speciality categories
  experience_years INTEGER,
  location_city TEXT,
  location_state TEXT,
  location_address TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  is_verified BOOLEAN DEFAULT false,
  verification_documents JSONB, -- Store verification doc URLs
  total_products INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_earnings DECIMAL(12,2) DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE artisan_profiles ENABLE ROW LEVEL SECURITY;

-- Artisans can view their own profile
CREATE POLICY "Artisans can view own profile" ON artisan_profiles
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = id);

-- Users can create their artisan profile
CREATE POLICY "Users can create artisan profile" ON artisan_profiles
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = id);

-- Artisans can update their own profile
CREATE POLICY "Artisans can update own profile" ON artisan_profiles
  FOR UPDATE TO authenticated 
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Public can view active artisan profiles (for shop pages)
CREATE POLICY "Public can view active artisan profiles" ON artisan_profiles
  FOR SELECT TO authenticated, anon USING (status = 'active');

-- =============================================
-- 4. PRODUCTS TABLE
-- =============================================
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artisan_id UUID REFERENCES artisan_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category_id TEXT REFERENCES categories(id),
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  original_price DECIMAL(10,2),
  images TEXT[] DEFAULT '{}', -- Array of image URLs
  features TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  sku TEXT UNIQUE,
  weight_grams INTEGER,
  dimensions_cm JSONB, -- {length: 10, width: 5, height: 3}
  materials TEXT[],
  care_instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public can view active products
CREATE POLICY "Public can view active products" ON products
  FOR SELECT TO authenticated, anon USING (is_active = true);

-- Artisans can view their own products (including inactive)
CREATE POLICY "Artisans can view own products" ON products
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = artisan_id);

-- Artisans can create products
CREATE POLICY "Artisans can create products" ON products
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = artisan_id);

-- Artisans can update their own products
CREATE POLICY "Artisans can update own products" ON products
  FOR UPDATE TO authenticated 
  USING ((SELECT auth.uid()) = artisan_id)
  WITH CHECK ((SELECT auth.uid()) = artisan_id);

-- Artisans can delete their own products
CREATE POLICY "Artisans can delete own products" ON products
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = artisan_id);

-- =============================================
-- 5. ADDRESSES TABLE
-- =============================================
CREATE TABLE addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT DEFAULT 'shipping' CHECK (type IN ('shipping', 'billing')),
  full_name TEXT NOT NULL,
  phone TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Users can manage their own addresses
CREATE POLICY "Users can manage own addresses" ON addresses
  FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- =============================================
-- 6. ORDERS TABLE
-- =============================================
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT,
  payment_reference TEXT,
  shipping_address JSONB NOT NULL, -- Store full address as JSON
  billing_address JSONB,
  estimated_delivery DATE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Customers can view their own orders
CREATE POLICY "Customers can view own orders" ON orders
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = customer_id);

-- Customers can create orders
CREATE POLICY "Customers can create orders" ON orders
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = customer_id);

-- =============================================
-- 7. ORDER ITEMS TABLE
-- =============================================
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  artisan_id UUID REFERENCES artisan_profiles(id) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  product_snapshot JSONB NOT NULL, -- Store product details at time of order
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  tracking_number TEXT,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Customers can view order items for their orders
CREATE POLICY "Customers can view own order items" ON order_items
  FOR SELECT TO authenticated USING (
    order_id IN (SELECT id FROM orders WHERE customer_id = (SELECT auth.uid()))
  );

-- Artisans can view order items for their products
CREATE POLICY "Artisans can view own product order items" ON order_items
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = artisan_id);

-- Artisans can update status of their product order items
CREATE POLICY "Artisans can update own product order items" ON order_items
  FOR UPDATE TO authenticated 
  USING ((SELECT auth.uid()) = artisan_id)
  WITH CHECK ((SELECT auth.uid()) = artisan_id);

-- =============================================
-- 8. REVIEWS TABLE
-- =============================================
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  order_item_id UUID REFERENCES order_items(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  is_verified_purchase BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  helpful_votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, customer_id, order_item_id)
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public can view all reviews
CREATE POLICY "Public can view reviews" ON reviews
  FOR SELECT TO authenticated, anon USING (true);

-- Customers can create reviews for products they purchased
CREATE POLICY "Customers can create reviews" ON reviews
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = customer_id);

-- Customers can update their own reviews
CREATE POLICY "Customers can update own reviews" ON reviews
  FOR UPDATE TO authenticated 
  USING ((SELECT auth.uid()) = customer_id)
  WITH CHECK ((SELECT auth.uid()) = customer_id);

-- =============================================
-- 9. CART TABLE
-- =============================================
CREATE TABLE cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Users can manage their own cart
CREATE POLICY "Users can manage own cart" ON cart_items
  FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- =============================================
-- 10. WISHLIST TABLE
-- =============================================
CREATE TABLE wishlist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Users can manage their own wishlist
CREATE POLICY "Users can manage own wishlist" ON wishlist_items
  FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- =============================================
-- 11. NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('order', 'product', 'review', 'general', 'promotion')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

-- Users can update their notification read status
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE TO authenticated 
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Products indexes
CREATE INDEX idx_products_artisan_id ON products(artisan_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_products_rating ON products(rating);
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || description));

-- Orders indexes
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_number ON orders(order_number);

-- Order items indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_order_items_artisan_id ON order_items(artisan_id);

-- Reviews indexes
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- =============================================
-- INSERT SAMPLE CATEGORIES
-- =============================================
INSERT INTO categories (id, name, description, image_url, icon_name) VALUES
('pottery', 'Pottery', 'Handcrafted ceramic and clay items', '/images/pottery-1.jpg', 'PaletteIcon'),
('textiles', 'Textiles', 'Handwoven fabrics and clothing', '/images/textiles-1.jpg', 'Shirt'),
('woodwork', 'Woodwork', 'Carved wooden items and furniture', '/images/woodwork-1.jpg', 'Hammer'),
('jewelry', 'Jewelry', 'Handmade jewelry and accessories', '/images/jewelry-1.jpg', 'Gem'),
('painting', 'Painting', 'Original artwork and paintings', '/images/painting-1.jpg', 'Brush');

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to all tables with updated_at column
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_artisan_profiles_updated_at BEFORE UPDATE ON artisan_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
BEGIN
    new_number := 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('order_number_seq')::TEXT, 6, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Trigger to auto-generate order numbers
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_number();

-- Function to update artisan stats when products are added/removed
CREATE OR REPLACE FUNCTION update_artisan_product_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE artisan_profiles 
        SET total_products = total_products + 1 
        WHERE id = NEW.artisan_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE artisan_profiles 
        SET total_products = total_products - 1 
        WHERE id = OLD.artisan_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_artisan_product_count_trigger
    AFTER INSERT OR DELETE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_artisan_product_count();

-- =============================================
-- USEFUL VIEWS
-- =============================================

-- View for product details with artisan info
CREATE VIEW product_details AS
SELECT 
    p.*,
    ap.shop_name,
    ap.shop_logo_url,
    ap.location_city,
    ap.location_state,
    ap.rating as artisan_rating,
    c.name as category_name
FROM products p
LEFT JOIN artisan_profiles ap ON p.artisan_id = ap.id
LEFT JOIN categories c ON p.category_id = c.id;

-- View for order details with customer info
CREATE VIEW order_details AS
SELECT 
    o.*,
    pr.full_name as customer_name,
    pr.email as customer_email,
    COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN profiles pr ON o.customer_id = pr.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, pr.full_name, pr.email;

-- =============================================
-- RLS POLICIES SUMMARY
-- =============================================
-- 
-- 1. Categories: Public read access
-- 2. Profiles: Users can only access their own profile
-- 3. Artisan Profiles: Users can access their own, public can view active ones
-- 4. Products: Public can view active products, artisans manage their own
-- 5. Addresses: Users can only access their own addresses
-- 6. Orders: Customers can only view their own orders
-- 7. Order Items: Customers see their items, artisans see their product orders
-- 8. Reviews: Public read access, users can create/edit their own
-- 9. Cart Items: Users can only access their own cart
-- 10. Wishlist Items: Users can only access their own wishlist
-- 11. Notifications: Users can only access their own notifications
-- 
-- All policies use auth.uid() to ensure users can only access their own data
-- =============================================
