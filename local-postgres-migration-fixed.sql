-- Active: 1753928902376@@127.0.0.1@5432@karigarverse
-- =============================================
-- KARIGARVERSE LOCAL POSTGRESQL MIGRATION - FIXED VERSION
-- Migration from Supabase to Local PostgreSQL
-- =============================================

-- Run with: psql -h localhost -U proximus -d karigarverse -f local-postgres-migration-fixed.sql

\echo 'Starting Karigarverse database migration...'

-- =============================================
-- CREATE REQUIRED EXTENSIONS
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- DROP EXISTING OBJECTS (IF ANY) - REVERSE ORDER
-- =============================================
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

-- Drop views
DROP VIEW IF EXISTS public.product_details CASCADE;

DROP VIEW IF EXISTS public.order_details CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_updated_at () CASCADE;

DROP FUNCTION IF EXISTS public.handle_new_user () CASCADE;

-- =============================================
-- CREATE AUTHENTICATION REPLACEMENT TABLE
-- =============================================
CREATE TABLE public.users (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE ('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE ('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- PROFILES TABLE (extends users)
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
    user_id UUID REFERENCES public.profiles (id) ON DELETE CASCADE UNIQUE NOT NULL,
    shop_name TEXT NOT NULL,
    description TEXT,
    specialties TEXT [],
    location TEXT,
    business_license TEXT,
    verification_status TEXT DEFAULT 'pending' CHECK (
        verification_status IN (
            'pending',
            'verified',
            'rejected'
        )
    ),
    status TEXT DEFAULT 'active' CHECK (
        status IN (
            'active',
            'inactive',
            'suspended'
        )
    ),
    phone TEXT,
    email TEXT,
    website TEXT,
    social_links JSONB,
    bank_details JSONB,
    commission_rate DECIMAL(5, 2) DEFAULT 10.00,
    total_sales DECIMAL(12, 2) DEFAULT 0.00,
    total_orders INTEGER DEFAULT 0,
    rating DECIMAL(3, 2),
    review_count INTEGER DEFAULT 0,
    banner_image TEXT,
    shop_logo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE ('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE ('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- PRODUCTS TABLE
-- =============================================
CREATE TABLE public.products (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    artisan_id UUID REFERENCES public.artisan_profiles (id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories (id) ON DELETE SET NULL NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    original_price DECIMAL(10, 2) CHECK (original_price >= price),
    images TEXT [] NOT NULL,
    features TEXT [],
    tags TEXT [],
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    sku TEXT UNIQUE,
    weight DECIMAL(8, 2),
    dimensions JSONB,
    materials TEXT [],
    care_instructions TEXT,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE ('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE ('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- CART ITEMS TABLE
-- =============================================
CREATE TABLE public.cart_items (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    user_id UUID REFERENCES public.profiles (id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products (id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE ('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE ('utc'::text, NOW()) NOT NULL,
    UNIQUE (user_id, product_id)
);

-- =============================================
-- ORDERS TABLE
-- =============================================
CREATE TABLE public.orders (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES public.profiles (id) ON DELETE CASCADE NOT NULL,
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
            'refunded'
        )
    ),
    payment_method TEXT,
    subtotal DECIMAL(12, 2) NOT NULL,
    tax_amount DECIMAL(12, 2) DEFAULT 0.00,
    shipping_cost DECIMAL(12, 2) DEFAULT 0.00,
    discount_amount DECIMAL(12, 2) DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    notes TEXT,
    tracking_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE ('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE ('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- ORDER ITEMS TABLE
-- =============================================
CREATE TABLE public.order_items (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    order_id UUID REFERENCES public.orders (id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products (id) ON DELETE CASCADE NOT NULL,
    artisan_id UUID REFERENCES public.artisan_profiles (id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'confirmed',
            'processing',
            'shipped',
            'delivered',
            'cancelled'
        )
    ),
    tracking_number TEXT,
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
    customer_id UUID REFERENCES public.profiles (id) ON DELETE CASCADE NOT NULL,
    order_item_id UUID REFERENCES public.order_items (id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (
        rating >= 1
        AND rating <= 5
    ),
    title TEXT,
    comment TEXT,
    images TEXT [],
    is_verified_purchase BOOLEAN DEFAULT false,
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
    user_id UUID REFERENCES public.profiles (id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE ('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_users_email ON public.users (email);

CREATE INDEX idx_profiles_email ON public.profiles (email);

CREATE INDEX idx_artisan_profiles_user_id ON public.artisan_profiles (user_id);

CREATE INDEX idx_artisan_profiles_status ON public.artisan_profiles (status);

CREATE INDEX idx_categories_slug ON public.categories (slug);

CREATE INDEX idx_categories_parent_id ON public.categories (parent_id);

CREATE INDEX idx_categories_is_active ON public.categories (is_active);

CREATE INDEX idx_products_artisan_id ON public.products (artisan_id);

CREATE INDEX idx_products_category_id ON public.products (category_id);

CREATE INDEX idx_products_is_active ON public.products (is_active);

CREATE INDEX idx_products_is_featured ON public.products (is_featured);

CREATE INDEX idx_products_name ON public.products (name);

CREATE INDEX idx_products_price ON public.products (price);

CREATE INDEX idx_cart_items_user_id ON public.cart_items (user_id);

CREATE INDEX idx_cart_items_product_id ON public.cart_items (product_id);

CREATE INDEX idx_orders_customer_id ON public.orders (customer_id);

CREATE INDEX idx_orders_status ON public.orders (status);

CREATE INDEX idx_orders_order_number ON public.orders (order_number);

CREATE INDEX idx_order_items_order_id ON public.order_items (order_id);

CREATE INDEX idx_order_items_product_id ON public.order_items (product_id);

CREATE INDEX idx_order_items_artisan_id ON public.order_items (artisan_id);

CREATE INDEX idx_reviews_product_id ON public.reviews (product_id);

CREATE INDEX idx_reviews_customer_id ON public.reviews (customer_id);

CREATE INDEX idx_reviews_rating ON public.reviews (rating);

CREATE INDEX idx_notifications_user_id ON public.notifications (user_id);

CREATE INDEX idx_notifications_is_read ON public.notifications (is_read);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_artisan_profiles_updated_at
    BEFORE UPDATE ON public.artisan_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_cart_items_updated_at
    BEFORE UPDATE ON public.cart_items
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_order_items_updated_at
    BEFORE UPDATE ON public.order_items
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, email)
    VALUES (
        NEW.id,
        COALESCE(split_part(NEW.email, '@', 1), 'User'),
        '',
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create profile when user is created
CREATE TRIGGER trigger_handle_new_user
    AFTER INSERT ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- VIEWS FOR BETTER DATA ACCESS
-- =============================================

-- Product details view with aggregated data (FIXED: renamed review_count to total_reviews to avoid conflict)
CREATE VIEW public.product_details AS
SELECT
    p.*,
    c.name as category_name,
    c.slug as category_slug,
    ap.shop_name,
    ap.rating as artisan_rating,
    ap.location as artisan_location,
    COUNT(r.id) as total_reviews,
    ROUND(AVG(r.rating), 2) as avg_rating
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
    SUM(oi.total_price) as calculated_total
FROM public.orders o
    LEFT JOIN public.profiles pr ON o.customer_id = pr.id
    LEFT JOIN public.order_items oi ON o.id = oi.order_id
GROUP BY
    o.id,
    pr.full_name,
    pr.email;

-- =============================================
-- INSERT SAMPLE DATA
-- =============================================

-- Insert sample categories
INSERT INTO
    public.categories (
        id,
        name,
        slug,
        description,
        sort_order,
        is_active
    )
VALUES (
        '11111111-1111-1111-1111-111111111111',
        'Pottery',
        'pottery',
        'Handcrafted pottery and ceramics',
        1,
        true
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'Textiles',
        'textiles',
        'Traditional and modern textile crafts',
        2,
        true
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'Woodwork',
        'woodwork',
        'Beautiful wooden crafts and furniture',
        3,
        true
    ),
    (
        '44444444-4444-4444-4444-444444444444',
        'Jewelry',
        'jewelry',
        'Handmade jewelry and accessories',
        4,
        true
    ),
    (
        '55555555-5555-5555-5555-555555555555',
        'Painting',
        'painting',
        'Original paintings and artwork',
        5,
        true
    ),
    (
        '66666666-6666-6666-6666-666666666666',
        'Metalwork',
        'metalwork',
        'Handcrafted metal items and sculptures',
        6,
        true
    );

-- Insert sample users (FIXED: using unique IDs)
INSERT INTO
    public.users (id, email, password_hash)
VALUES (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'admin@karigarverse.com',
        '$2b$10$example.hash.for.password123'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'artisan1@example.com',
        '$2b$10$example.hash.for.password123'
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'customer1@example.com',
        '$2b$10$example.hash.for.password123'
    );

-- Insert sample profiles (FIXED: matching user IDs)
INSERT INTO
    public.profiles (
        id,
        first_name,
        last_name,
        email,
        phone
    )
VALUES (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Admin',
        'User',
        'admin@karigarverse.com',
        '+91-9876543210'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'Rajesh',
        'Kumar',
        'artisan1@example.com',
        '+91-9876543211'
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'Test',
        'Customer',
        'customer1@example.com',
        '+91-9876543212'
    );

-- Insert sample artisan profiles
INSERT INTO
    public.artisan_profiles (
        id,
        user_id,
        shop_name,
        description,
        specialties,
        location,
        verification_status
    )
VALUES (
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'Kumar Pottery Works',
        'Traditional pottery with 20+ years of experience',
        ARRAY['pottery', 'ceramics'],
        'Jaipur, Rajasthan',
        'verified'
    ),
    (
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Artisan Admin Shop',
        'Admin test shop for development',
        ARRAY['all'],
        'Delhi',
        'verified'
    );

-- Insert sample products
INSERT INTO
    public.products (
        id,
        artisan_id,
        category_id,
        name,
        description,
        price,
        images,
        stock_quantity,
        is_active,
        is_featured
    )
VALUES (
        'ffffffff-ffff-ffff-ffff-ffffffffffff',
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        '11111111-1111-1111-1111-111111111111',
        'Handcrafted Ceramic Vase',
        'Beautiful blue ceramic vase perfect for home decoration',
        2500.00,
        ARRAY['/images/pottery-1.jpg'],
        5,
        true,
        true
    ),
    (
        'gggggggg-gggg-gggg-gggg-gggggggggggg',
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        '11111111-1111-1111-1111-111111111111',
        'Clay Dinner Set',
        'Complete 6-piece dinner set made from natural clay',
        4500.00,
        ARRAY['/images/pottery-2.jpg'],
        3,
        true,
        false
    ),
    (
        'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh',
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        '22222222-2222-2222-2222-222222222222',
        'Handwoven Cotton Scarf',
        'Soft cotton scarf with traditional patterns',
        800.00,
        ARRAY['/images/textiles-1.jpg'],
        10,
        true,
        true
    ),
    (
        'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii',
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        '33333333-3333-3333-3333-333333333333',
        'Wooden Jewelry Box',
        'Handcrafted wooden box with intricate carvings',
        1200.00,
        ARRAY['/images/woodwork-1.jpg'],
        7,
        true,
        false
    );

-- =============================================
-- COMPLETION MESSAGE
-- =============================================
\echo '✅ Karigarverse database migration completed successfully!'
\echo '📊 Database is ready for local development'
\echo ''
\echo 'Next steps:'
\echo '1. Update your .env.local file with PostgreSQL credentials'
\echo '2. Run: pnpm dev'
\echo '3. Test the application'
\echo ''

SELECT 'Karigarverse database migration completed successfully!' as status;

SELECT 'Database is ready for local development' as message;

SELECT 'Created tables:' as info;

SELECT table_name
FROM information_schema.tables
WHERE
    table_schema = 'public'
ORDER BY table_name;