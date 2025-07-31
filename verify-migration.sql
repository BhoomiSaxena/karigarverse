-- Active: 1753928902376@@127.0.0.1@5432@karigarverse
-- =============================================
-- VERIFICATION SCRIPT
-- Run after migration to verify setup
-- =============================================

-- Run with: psql -h localhost -U proximus -d karigarverse -f verify-migration.sql

-- Check if all tables exist
SELECT 'Tables created successfully!' as status, COUNT(*) as table_count
FROM information_schema.tables
WHERE
    table_schema = 'public';

-- List all tables
SELECT 'Tables in database:' as info, table_name
FROM information_schema.tables
WHERE
    table_schema = 'public'
ORDER BY table_name;

-- Check sample data
SELECT 'Sample categories:' as info, COUNT(*) as count
FROM categories;

SELECT 'Sample users:' as info, COUNT(*) as count FROM users;

SELECT 'Sample profiles:' as info, COUNT(*) as count FROM profiles;

SELECT 'Sample artisans:' as info, COUNT(*) as count
FROM artisan_profiles;

SELECT 'Sample products:' as info, COUNT(*) as count FROM products;

-- Test a simple join query
SELECT
    'Product with category test:' as test,
    p.name as product_name,
    c.name as category_name,
    ap.shop_name
FROM
    products p
    JOIN categories c ON p.category_id = c.id
    JOIN artisan_profiles ap ON p.artisan_id = ap.id
LIMIT 2;

-- Show indexes
SELECT 'Indexes created:' as info, COUNT(*) as index_count
FROM pg_indexes
WHERE
    schemaname = 'public';

SELECT 'Migration verification completed successfully! ✅' as final_status;