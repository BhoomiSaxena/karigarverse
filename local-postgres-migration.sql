-- Active: 1753928902376@@127.0.0.1@5432@karigarverse
-- =============================================
-- KARIGARVERSE LOCAL POSTGRESQL MIGRATION
-- Complete database setup for local development
-- =============================================

-- Run this file with: psql -h localhost -U proximus -d karigarverse -f local-postgres-migration.sql

-- Create extensions (if not already exist)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- DROP EXISTING TABLES (for clean migration)
-- =============================================
-- Note: Comment out the DROP statements if you want to preserve existing data

DROP TABLE IF EXISTS public.notifications CASCADE;

DROP TABLE IF EXISTS public.reviews CASCADE;

DROP TABLE IF EXISTS public.order_items CASCADE;

DROP TABLE IF EXISTS public.orders CASCADE;

DROP TABLE IF EXISTS public.cart_items CASCADE;

DROP TABLE IF EXISTS public.products CASCADE;

DROP TABLE IF EXISTS public.artisan_profiles CASCADE;

DROP TABLE IF EXISTS public.categories CASCADE;

DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TABLE IF EXISTS public.users CASCADE;

-- Drop views if they exist
DROP VIEW IF EXISTS public.product_details CASCADE;

DROP VIEW IF EXISTS public.order_details CASCADE;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS public.handle_updated_at () CASCADE;

DROP FUNCTION IF EXISTS public.handle_new_user () CASCADE;

-- =============================================
-- USERS TABLE (replacing Supabase auth.users)
-- =============================================
CREATE TABLE public.users (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email_confirmed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE ('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE ('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE public.profiles (
    id UUID REFERENCES public.users (id) ON DELETE CASCADE PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    full_name TEXT GENERATED ALWAYS AS (
        first_name || ' ' || last_name
    ) STORED,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    avatar_url TEXT,
    date_of_birth DATE,
    address JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE ('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE ('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- CATEGORIES TABLE
-- =============================================
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    icon_name TEXT,
    parent_id UUID REFERENCES public.categories (id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE ('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE ('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- ARTISAN PROFILES TABLE
-- =============================================
CREATE TABLE public.artisan_profiles (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    user_id UUID REFERENCES public.users (id) ON DELETE CASCADE NOT NULL,
    shop_name TEXT NOT NULL,
    shop_description TEXT,
    bio TEXT,
    location TEXT,
    website_url TEXT,
    instagram_handle TEXT,
    facebook_handle TEXT,
    phone TEXT,
    profile_image_url TEXT,
    cover_image_url TEXT,
    specialties TEXT [],
    years_of_experience INTEGER DEFAULT 0,
    rating DECIMAL(2, 1) DEFAULT 0.0 CHECK (
        rating >= 0
        AND rating <= 5
    ),
    total_orders INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'active',
            'suspended',
            'inactive'
        )
    ),
    verification_status TEXT DEFAULT 'unverified' CHECK (
        verification_status IN (
            'unverified',
            'pending',
            'verified',
            'rejected'
        )
    ),
    verification_documents JSONB,
    business_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE ('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE ('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- PRODUCTS TABLE
-- =============================================
CREATE TABLE public.products (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    artisan_id UUID REFERENCES public.artisan_profiles (id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories (id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    compare_at_price DECIMAL(10, 2) CHECK (compare_at_price >= price),
    cost_per_item DECIMAL(10, 2),
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    sku TEXT,
    weight DECIMAL(8, 2),
    dimensions JSONB, -- {length, width, height, unit}
    materials TEXT [],
    care_instructions TEXT,
    images TEXT [] NOT NULL DEFAULT '{}',
    tags TEXT [],
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_customizable BOOLEAN DEFAULT false,
    customization_options JSONB,
    processing_time_days INTEGER DEFAULT 3,
    shipping_profile JSONB,
    seo_title TEXT,
    seo_description TEXT,
    rating DECIMAL(2, 1) DEFAULT 0.0 CHECK (
        rating >= 0
        AND rating <= 5
    ),
    review_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE ('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE ('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- CART ITEMS TABLE
-- =============================================
CREATE TABLE public.cart_items (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    user_id UUID REFERENCES public.users (id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products (id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    customization_details JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE ('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE ('utc'::text, NOW()) NOT NULL,
    UNIQUE (user_id, product_id)
);

-- =============================================
-- ORDERS TABLE
-- =============================================
CREATE TABLE public.orders (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    customer_id UUID REFERENCES public.users (id) ON DELETE SET NULL NOT NULL,
    order_number TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'confirmed',
            'processing',
            'shipped',
            'delivered',
            'cancelled',
            'refunded'
        )
    ),
    payment_status TEXT DEFAULT 'pending' CHECK (
        payment_status IN (
            'pending',
            'paid',
            'failed',
            'refunded',
            'partially_refunded'
        )
    ),
    payment_method TEXT,
    payment_id TEXT,
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    shipping_cost DECIMAL(10, 2) DEFAULT 0 CHECK (shipping_cost >= 0),
    tax_amount DECIMAL(10, 2) DEFAULT 0 CHECK (tax_amount >= 0),
    discount_amount DECIMAL(10, 2) DEFAULT 0 CHECK (discount_amount >= 0),
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    currency TEXT DEFAULT 'INR',
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    special_instructions TEXT,
    tracking_number TEXT,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE ('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE ('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- ORDER ITEMS TABLE
-- =============================================
CREATE TABLE public.order_items (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    order_id UUID REFERENCES public.orders (id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products (id) ON DELETE SET NULL NOT NULL,
    artisan_id UUID REFERENCES public.artisan_profiles (id) ON DELETE SET NULL NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
    product_name TEXT NOT NULL,
    product_image TEXT,
    customization_details JSONB,
    status TEXT DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'confirmed',
            'processing',
            'ready_to_ship',
            'shipped',
            'delivered',
            'cancelled'
        )
    ),
    processing_started_at TIMESTAMP WITH TIME ZONE,
    ready_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE ('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE ('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- REVIEWS TABLE
-- =============================================
CREATE TABLE public.reviews (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    product_id UUID REFERENCES public.products (id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES public.users (id) ON DELETE CASCADE NOT NULL,
    order_item_id UUID REFERENCES public.order_items (id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (
        rating >= 1
        AND rating <= 5
    ),
    title TEXT,
    comment TEXT,
    images TEXT [],
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE ('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE ('utc'::text, NOW()) NOT NULL,
    UNIQUE (
        product_id,
        customer_id,
        order_item_id
    )
);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    user_id UUID REFERENCES public.users (id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE ('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users indexes
CREATE INDEX idx_users_email ON public.users (email);

-- Profiles indexes
CREATE INDEX idx_profiles_email ON public.profiles (email);

CREATE INDEX idx_profiles_user_id ON public.profiles (id);

-- Categories indexes
CREATE INDEX idx_categories_slug ON public.categories (slug);

CREATE INDEX idx_categories_parent_id ON public.categories (parent_id);

CREATE INDEX idx_categories_active ON public.categories (is_active);

-- Artisan profiles indexes
CREATE INDEX idx_artisan_profiles_user_id ON public.artisan_profiles (user_id);

CREATE INDEX idx_artisan_profiles_status ON public.artisan_profiles (status);

CREATE INDEX idx_artisan_profiles_verification ON public.artisan_profiles (verification_status);

-- Products indexes
CREATE INDEX idx_products_artisan_id ON public.products (artisan_id);

CREATE INDEX idx_products_category_id ON public.products (category_id);

CREATE INDEX idx_products_active ON public.products (is_active);

CREATE INDEX idx_products_featured ON public.products (is_featured);

CREATE INDEX idx_products_price ON public.products (price);

CREATE INDEX idx_products_created_at ON public.products (created_at);

CREATE INDEX idx_products_rating ON public.products (rating);

CREATE INDEX idx_products_search ON public.products USING gin (
    to_tsvector(
        'english',
        name || ' ' || description
    )
);

-- Cart items indexes
CREATE INDEX idx_cart_items_user_id ON public.cart_items (user_id);

CREATE INDEX idx_cart_items_product_id ON public.cart_items (product_id);

-- Orders indexes
CREATE INDEX idx_orders_customer_id ON public.orders (customer_id);

CREATE INDEX idx_orders_status ON public.orders (status);

CREATE INDEX idx_orders_created_at ON public.orders (created_at);

CREATE INDEX idx_orders_number ON public.orders (order_number);

-- Order items indexes
CREATE INDEX idx_order_items_order_id ON public.order_items (order_id);

CREATE INDEX idx_order_items_product_id ON public.order_items (product_id);

CREATE INDEX idx_order_items_artisan_id ON public.order_items (artisan_id);

-- Reviews indexes
CREATE INDEX idx_reviews_product_id ON public.reviews (product_id);

CREATE INDEX idx_reviews_customer_id ON public.reviews (customer_id);

CREATE INDEX idx_reviews_rating ON public.reviews (rating);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON public.notifications (user_id);

CREATE INDEX idx_notifications_unread ON public.notifications (user_id, is_read)
WHERE
    is_read = false;

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all relevant tables
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.artisan_profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.order_items FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- =============================================
-- FUNCTION TO CREATE PROFILE ON USER CREATION
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, email)
    VALUES (NEW.id, '', '', NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user is created
CREATE TRIGGER on_user_created
    AFTER INSERT ON public.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =============================================
-- VIEWS FOR BETTER DATA ACCESS
-- =============================================

-- Product details view with aggregated data
CREATE VIEW public.product_details AS
SELECT
    p.*,
    c.name as category_name,
    c.slug as category_slug,
    ap.shop_name,
    ap.rating as artisan_rating,
    ap.location as artisan_location,
    COUNT(r.id) as review_count,
    AVG(r.rating) as avg_rating
FROM public.products p
    LEFT JOIN public.categories c ON p.category_id = c.id
    LEFT JOIN public.artisan_profiles ap ON p.artisan_id = ap.id
    LEFT JOIN public.reviews r ON p.id = r.product_id
GROUP BY
    p.id,
    c.name,
    c.slug,
    ap.shop_name,
    ap.rating,
    ap.location;

-- Order details view with customer information
CREATE VIEW public.order_details AS
SELECT
    o.*,
    pr.full_name as customer_name,
    pr.email as customer_email,
    COUNT(oi.id) as item_count,
    SUM(oi.total_price) as items_total
FROM public.orders o
    LEFT JOIN public.profiles pr ON o.customer_id = pr.id
    LEFT JOIN public.order_items oi ON o.id = oi.order_id
GROUP BY
    o.id,
    pr.full_name,
    pr.email;

-- =============================================
-- INSERT SAMPLE CATEGORIES
-- =============================================
INSERT INTO
    public.categories (
        id,
        name,
        slug,
        description,
        image_url,
        icon_name,
        sort_order
    )
VALUES (
        '550e8400-e29b-41d4-a716-446655440001',
        'Pottery & Ceramics',
        'pottery-ceramics',
        'Handcrafted pottery, ceramics, and clay items',
        '/images/pottery-1.jpg',
        'pottery',
        1
    ),
    (
        '550e8400-e29b-41d4-a716-446655440002',
        'Textiles & Weaving',
        'textiles-weaving',
        'Traditional textiles, fabrics, and woven goods',
        '/images/textiles-1.jpg',
        'textiles',
        2
    ),
    (
        '550e8400-e29b-41d4-a716-446655440003',
        'Jewelry & Accessories',
        'jewelry-accessories',
        'Handmade jewelry, ornaments, and accessories',
        '/images/jewelry-1.jpg',
        'jewelry',
        3
    ),
    (
        '550e8400-e29b-41d4-a716-446655440004',
        'Woodwork & Furniture',
        'woodwork-furniture',
        'Wooden crafts, furniture, and carvings',
        '/images/woodwork-1.jpg',
        'woodwork',
        4
    ),
    (
        '550e8400-e29b-41d4-a716-446655440005',
        'Paintings & Art',
        'paintings-art',
        'Traditional and contemporary paintings and art',
        '/images/painting-1.jpg',
        'paintings',
        5
    ),
    (
        '550e8400-e29b-41d4-a716-446655440006',
        'Metalwork',
        'metalwork',
        'Brass, copper, and other metalwork items',
        '/images/crafts-1.jpg',
        'metalwork',
        6
    );

-- =============================================
-- INSERT SAMPLE USERS AND PROFILES
-- =============================================
INSERT INTO
    public.users (
        id,
        email,
        password_hash,
        email_confirmed
    )
VALUES (
        '550e8400-e29b-41d4-a716-446655440101',
        'john.potter@example.com',
        '$2b$10$rQZ9QmjotUN7VmFqZQZG8emBa3FbzOq7Rv1/FQDvf4dF3IzMqnH4e',
        true
    ),
    (
        '550e8400-e29b-41d4-a716-446655440102',
        'maya.weaver@example.com',
        '$2b$10$rQZ9QmjotUN7VmFqZQZG8emBa3FbzOq7Rv1/FQDvf4dF3IzMqnH4e',
        true
    ),
    (
        '550e8400-e29b-41d4-a716-446655440103',
        'customer@example.com',
        '$2b$10$rQZ9QmjotUN7VmFqZQZG8emBa3FbzOq7Rv1/FQDvf4dF3IzMqnH4e',
        true
    );

INSERT INTO
    public.profiles (
        id,
        first_name,
        last_name,
        email,
        phone
    )
VALUES (
        '550e8400-e29b-41d4-a716-446655440101',
        'John',
        'Potter',
        'john.potter@example.com',
        '+91-9876543210'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440102',
        'Maya',
        'Weaver',
        'maya.weaver@example.com',
        '+91-9876543211'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440103',
        'Test',
        'Customer',
        'customer@example.com',
        '+91-9876543212'
    );

-- =============================================
-- INSERT SAMPLE ARTISAN PROFILES
-- =============================================
INSERT INTO
    public.artisan_profiles (
        id,
        user_id,
        shop_name,
        shop_description,
        bio,
        location,
        specialties,
        years_of_experience,
        rating,
        status,
        verification_status
    )
VALUES (
        '550e8400-e29b-41d4-a716-446655440201',
        '550e8400-e29b-41d4-a716-446655440101',
        'Potter''s Paradise',
        'Authentic handcrafted pottery and ceramics',
        'Master potter with 15+ years of experience in traditional Indian pottery techniques.',
        'Jaipur, Rajasthan',
        ARRAY[
            'Pottery',
            'Ceramics',
            'Clay Sculpture'
        ],
        15,
        4.8,
        'active',
        'verified'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440202',
        '550e8400-e29b-41d4-a716-446655440102',
        'Maya''s Weaves',
        'Traditional textiles and handwoven fabrics',
        'Passionate textile artist specializing in traditional Indian weaving patterns.',
        'Varanasi, Uttar Pradesh',
        ARRAY[
            'Weaving',
            'Textiles',
            'Traditional Patterns'
        ],
        12,
        4.9,
        'active',
        'verified'
    );

-- =============================================
-- INSERT SAMPLE PRODUCTS
-- =============================================
INSERT INTO
    public.products (
        id,
        artisan_id,
        category_id,
        name,
        description,
        price,
        stock_quantity,
        images,
        materials,
        is_active,
        is_featured
    )
VALUES (
        '550e8400-e29b-41d4-a716-446655440301',
        '550e8400-e29b-41d4-a716-446655440201',
        '550e8400-e29b-41d4-a716-446655440001',
        'Traditional Clay Pot Set',
        'Handcrafted set of 3 traditional clay pots perfect for cooking and storage',
        1299.00,
        25,
        ARRAY['/images/pottery-1.jpg'],
        ARRAY['Clay', 'Natural Glaze'],
        true,
        true
    ),
    (
        '550e8400-e29b-41d4-a716-446655440302',
        '550e8400-e29b-41d4-a716-446655440201',
        '550e8400-e29b-41d4-a716-446655440001',
        'Decorative Ceramic Vase',
        'Beautiful hand-painted ceramic vase with traditional Indian motifs',
        899.00,
        15,
        ARRAY['/images/pottery-1.jpg'],
        ARRAY['Ceramic', 'Natural Paint'],
        true,
        false
    ),
    (
        '550e8400-e29b-41d4-a716-446655440303',
        '550e8400-e29b-41d4-a716-446655440202',
        '550e8400-e29b-41d4-a716-446655440002',
        'Handwoven Cotton Saree',
        'Exquisite handwoven cotton saree with traditional border designs',
        3499.00,
        8,
        ARRAY['/images/textiles-1.jpg'],
        ARRAY['Cotton', 'Natural Dyes'],
        true,
        true
    ),
    (
        '550e8400-e29b-41d4-a716-446655440304',
        '550e8400-e29b-41d4-a716-446655440202',
        '550e8400-e29b-41d4-a716-446655440002',
        'Traditional Table Runner',
        'Handwoven table runner with intricate patterns',
        799.00,
        20,
        ARRAY['/images/textiles-1.jpg'],
        ARRAY['Cotton', 'Silk Thread'],
        true,
        false
    );

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
SELECT 'Karigarverse database migration completed successfully!' as status;

SELECT 'Database is ready for local development' as message;

-- Show created tables
SELECT 'Created tables:' as info;

SELECT table_name
FROM information_schema.tables
WHERE
    table_schema = 'public'
ORDER BY table_name;