-- =============================================
-- SUPABASE SCHEMA FOR KARIGARVERSE
-- Artisan Marketplace Database
-- =============================================


-- Enable Row Level Security
-- ALTER DATABASE postgres SET "app.jwt_secret" TO 'shQmBHF849PljGhJIxYg0+4G4iY8NFI4S6RI81i8u/dsVbxI4yqMgRb85kdv3ESL5BkxzBpE4+2XsDTDqiYBnw==';


-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- PROFILES TABLE (extends Supabase auth.users)
-- =============================================
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    avatar_url TEXT,
    date_of_birth DATE,
    address JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- CATEGORIES TABLE
-- =============================================
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- ARTISAN PROFILES TABLE
-- =============================================
CREATE TABLE public.artisan_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    shop_name TEXT NOT NULL,
    description TEXT,
    specialties TEXT[],
    location TEXT,
    business_license TEXT,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    total_sales DECIMAL(12,2) DEFAULT 0.00,
    total_orders INTEGER DEFAULT 0,
    rating DECIMAL(3,2),
    banner_image TEXT,
    shop_logo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- PRODUCTS TABLE
-- =============================================
CREATE TABLE public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    artisan_id UUID REFERENCES public.artisan_profiles(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    original_price DECIMAL(10,2) CHECK (original_price >= price),
    images TEXT[] NOT NULL,
    features TEXT[],
    tags TEXT[],
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    sku TEXT UNIQUE,
    weight DECIMAL(8,2),
    dimensions JSONB,
    materials TEXT[],
    care_instructions TEXT,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- CART ITEMS TABLE
-- =============================================
CREATE TABLE public.cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, product_id)
);

-- =============================================
-- ORDERS TABLE
-- =============================================
CREATE TABLE public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method TEXT,
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0.00,
    shipping_cost DECIMAL(12,2) DEFAULT 0.00,
    discount_amount DECIMAL(12,2) DEFAULT 0.00,
    total_amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    notes TEXT,
    tracking_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- ORDER ITEMS TABLE
-- =============================================
CREATE TABLE public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    artisan_id UUID REFERENCES public.artisan_profiles(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    tracking_number TEXT,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- REVIEWS TABLE
-- =============================================
CREATE TABLE public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    order_item_id UUID REFERENCES public.order_items(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    images TEXT[],
    is_verified_purchase BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(product_id, customer_id, order_item_id)
);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_artisan_profiles_user_id ON public.artisan_profiles(user_id);
CREATE INDEX idx_artisan_profiles_status ON public.artisan_profiles(status);
CREATE INDEX idx_products_artisan_id ON public.products(artisan_id);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_products_is_featured ON public.products(is_featured);
CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_artisan_id ON public.order_items(artisan_id);
CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

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

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.artisan_profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.order_items FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- =============================================
-- FUNCTION TO CREATE PROFILE ON SIGNUP
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'firstName', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'lastName', 'Name'),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
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
    ap.shop_name as artisan_shop_name,
    ap.rating as artisan_rating,
    ap.location as artisan_location,
    ROUND(AVG(r.rating), 2) as average_rating,
    COUNT(r.id) as review_count
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
LEFT JOIN public.artisan_profiles ap ON p.artisan_id = ap.id
LEFT JOIN public.reviews r ON p.id = r.product_id
GROUP BY p.id, c.name, c.slug, ap.shop_name, ap.rating, ap.location;

-- Order details view with customer information
CREATE VIEW public.order_details AS
SELECT 
    o.*,
    pr.full_name as customer_name,
    pr.email as customer_email,
    COUNT(oi.id) as item_count
FROM public.orders o
LEFT JOIN public.profiles pr ON o.customer_id = pr.id
LEFT JOIN public.order_items oi ON o.id = oi.order_id
GROUP BY o.id, pr.full_name, pr.email;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artisan_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

-- Categories policies (public read access)
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (is_active = true);

-- Artisan profiles policies
CREATE POLICY "Artisan profiles are viewable by everyone" ON public.artisan_profiles FOR SELECT USING (status = 'active');
CREATE POLICY "Users can create their own artisan profile" ON public.artisan_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own artisan profile" ON public.artisan_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Products policies
CREATE POLICY "Active products are viewable by everyone" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Artisans can create their own products" ON public.products FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.artisan_profiles 
        WHERE id = artisan_id AND user_id = auth.uid()
    )
);
CREATE POLICY "Artisans can update their own products" ON public.products FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.artisan_profiles 
        WHERE id = artisan_id AND user_id = auth.uid()
    )
);
CREATE POLICY "Artisans can delete their own products" ON public.products FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.artisan_profiles 
        WHERE id = artisan_id AND user_id = auth.uid()
    )
);

-- Cart items policies
CREATE POLICY "Users can view their own cart items" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own cart items" ON public.cart_items FOR ALL USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Users can create their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Users can update their own orders" ON public.orders FOR UPDATE USING (auth.uid() = customer_id);

-- Order items policies
CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE id = order_id AND customer_id = auth.uid()
    )
);
CREATE POLICY "Artisans can view their order items" ON public.order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.artisan_profiles 
        WHERE id = artisan_id AND user_id = auth.uid()
    )
);
CREATE POLICY "Artisans can update their order items" ON public.order_items FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.artisan_profiles 
        WHERE id = artisan_id AND user_id = auth.uid()
    )
);

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews for their purchases" ON public.reviews FOR INSERT WITH CHECK (
    auth.uid() = customer_id AND
    EXISTS (
        SELECT 1 FROM public.order_items oi
        JOIN public.orders o ON oi.order_id = o.id
        WHERE oi.id = order_item_id AND o.customer_id = auth.uid()
    )
);
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = customer_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- SAMPLE DATA FOR TESTING
-- =============================================

-- Insert sample categories
INSERT INTO public.categories (name, slug, description, sort_order) VALUES
('Pottery', 'pottery', 'Handcrafted pottery and ceramics', 1),
('Textiles', 'textiles', 'Traditional and modern textile crafts', 2),
('Woodwork', 'woodwork', 'Beautiful wooden crafts and furniture', 3),
('Jewelry', 'jewelry', 'Handmade jewelry and accessories', 4),
('Painting', 'painting', 'Original paintings and artwork', 5);

-- Note: User profiles and artisan profiles will be created through the application
-- when users sign up and become artisans.