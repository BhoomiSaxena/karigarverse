-- Add missing columns to artisan_profiles table for extended features
-- Run this with: node -e "const { query } = require('./src/lib/postgres-config.ts').then(q => q.query('ALTER TABLE...'))"

-- Add social_media JSONB column
ALTER TABLE public.artisan_profiles
ADD COLUMN IF NOT EXISTS social_media JSONB;

-- Add business_hours JSONB column
ALTER TABLE public.artisan_profiles
ADD COLUMN IF NOT EXISTS business_hours JSONB;

-- Add portfolio_images array column
ALTER TABLE public.artisan_profiles
ADD COLUMN IF NOT EXISTS portfolio_images TEXT [];

-- Add certificates array column
ALTER TABLE public.artisan_profiles
ADD COLUMN IF NOT EXISTS certificates TEXT [];

-- Add awards array column
ALTER TABLE public.artisan_profiles
ADD COLUMN IF NOT EXISTS awards TEXT [];

-- Add delivery_info JSONB column
ALTER TABLE public.artisan_profiles
ADD COLUMN IF NOT EXISTS delivery_info JSONB;

-- Add payment_methods array column
ALTER TABLE public.artisan_profiles
ADD COLUMN IF NOT EXISTS payment_methods TEXT [];

-- Add return_policy text column
ALTER TABLE public.artisan_profiles
ADD COLUMN IF NOT EXISTS return_policy TEXT;

-- Add shipping_policy text column
ALTER TABLE public.artisan_profiles
ADD COLUMN IF NOT EXISTS shipping_policy TEXT;

-- Add preferred_language text column
ALTER TABLE public.artisan_profiles
ADD COLUMN IF NOT EXISTS preferred_language TEXT;

-- Add notification_preferences JSONB column
ALTER TABLE public.artisan_profiles
ADD COLUMN IF NOT EXISTS notification_preferences JSONB;

-- Show success message
SELECT 'Extended artisan profile columns added successfully!' as status;