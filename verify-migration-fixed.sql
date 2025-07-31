-- =============================================
-- KARIGARVERSE MIGRATION VERIFICATION SCRIPT
-- Run after the migration to verify everything is working
-- =============================================

-- Run with: psql -h localhost -U proximus -d karigarverse -f verify-migration-fixed.sql

\echo '🔍 Verifying Karigarverse database migration...' \echo ''

-- =============================================
-- 1. CHECK TABLE CREATION
-- =============================================
\echo '1. Checking table structure...'

SELECT table_name, (
        SELECT COUNT(*)
        FROM information_schema.columns
        WHERE
            table_name = t.table_name
            AND table_schema = 'public'
    ) as column_count
FROM information_schema.tables t
WHERE
    table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =============================================
-- 2. CHECK SAMPLE DATA
-- =============================================

\echo ''
\echo '2. Checking sample data...'

\echo 'Categories:'
SELECT id, name, slug, is_active FROM public.categories ORDER BY sort_order;

\echo ''
\echo 'Users:'
SELECT id, email, email_verified, created_at FROM public.users;

\echo ''
\echo 'Profiles:'
SELECT id, first_name, last_name, email FROM public.profiles;

\echo ''
\echo 'Artisan Profiles:'
SELECT id, shop_name, verification_status, status FROM public.artisan_profiles;

\echo ''
\echo 'Products:'
SELECT id, name, price, stock_quantity, is_active, is_featured FROM public.products;

-- =============================================
-- 3. CHECK RELATIONSHIPS
-- =============================================

\echo ''
\echo '3. Checking relationships...'

\echo 'Product-Category relationships:'
SELECT 
    p.name as product_name,
    c.name as category_name,
    ap.shop_name as artisan_shop
FROM public.products p
    JOIN public.categories c ON p.category_id = c.id
    JOIN public.artisan_profiles ap ON p.artisan_id = ap.id;

-- =============================================
-- 4. CHECK VIEWS
-- =============================================

\echo ''
\echo '4. Checking views...'

\echo 'Product details view:'
SELECT 
    name,
    price,
    category_name,
    shop_name,
    total_reviews,
    avg_rating
FROM public.product_details
LIMIT 3;

-- =============================================
-- 5. CHECK INDEXES
-- =============================================
\echo '' \echo '5. Checking indexes...'

SELECT indexname, tablename
FROM pg_indexes
WHERE
    schemaname = 'public'
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- =============================================
-- 6. CHECK FUNCTIONS AND TRIGGERS
-- =============================================
\echo '' \echo '6. Checking functions and triggers...'

SELECT routine_name, routine_type
FROM information_schema.routines
WHERE
    routine_schema = 'public'
ORDER BY routine_name;

SELECT
    trigger_name,
    event_object_table
FROM information_schema.triggers
WHERE
    trigger_schema = 'public'
ORDER BY
    event_object_table,
    trigger_name;

-- =============================================
-- 7. TEST BASIC OPERATIONS
-- =============================================
\echo '' \echo '7. Testing basic operations...'

-- Test user creation and profile trigger
INSERT INTO
    public.users (id, email, password_hash)
VALUES (
        'test-user-id-123',
        'test@example.com',
        '$2b$10$test.hash'
    )
ON CONFLICT (id) DO NOTHING;

-- Check if profile was created automatically
SELECT u.email, p.first_name, p.last_name, p.created_at
FROM public.users u
    LEFT JOIN public.profiles p ON u.id = p.id
WHERE
    u.email = 'test@example.com';

-- Clean up test data
DELETE FROM public.users WHERE email = 'test@example.com';

-- =============================================
-- 8. FINAL STATUS
-- =============================================
\echo ''
\echo '✅ Migration verification completed!'
\echo ''
\echo 'Summary:'

SELECT 'Tables created' as check_type, COUNT(*) as count
FROM information_schema.tables
WHERE
    table_schema = 'public'
    AND table_type = 'BASE TABLE'
UNION ALL
SELECT 'Views created' as check_type, COUNT(*) as count
FROM information_schema.views
WHERE
    table_schema = 'public'
UNION ALL
SELECT 'Functions created' as check_type, COUNT(*) as count
FROM information_schema.routines
WHERE
    routine_schema = 'public'
UNION ALL
SELECT 'Sample categories' as check_type, COUNT(*) as count
FROM public.categories
UNION ALL
SELECT 'Sample products' as check_type, COUNT(*) as count
FROM public.products;

\echo ''
\echo '🎉 Your Karigarverse database is ready for local development!'
\echo 'Next steps:'
\echo '1. Copy .env.local.postgres to .env.local'
\echo '2. Set JWT_SECRET in .env.local'
\echo '3. Run: pnpm dev'