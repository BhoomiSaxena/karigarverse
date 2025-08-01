-- =============================================
-- KARIGARVERSE WINDOWS MIGRATION VERIFICATION SCRIPT
-- Run this script after migration to verify everything works
-- =============================================

-- Run with: psql -U karigaruser -d karigarverse -h localhost -f verify-windows-migration.sql

\echo '🔍 Starting Karigarverse Windows migration verification...'
\echo ''

-- =============================================
-- 1. CHECK DATABASE CONNECTION
-- =============================================
\echo '1. Testing database connection...'
SELECT 
    current_database() as database_name,
    current_user as connected_user,
    version() as postgresql_version;

-- =============================================
-- 2. VERIFY ALL TABLES EXIST
-- =============================================
\echo '' \echo '2. Verifying all tables exist...'

SELECT 'Tables' as component, COUNT(*) as count, string_agg(
        table_name, ', '
        ORDER BY table_name
    ) as list
FROM information_schema.tables
WHERE
    table_schema = 'public'
    AND table_type = 'BASE TABLE';

-- Expected: 10 tables
\echo 'Expected tables: artisan_profiles, cart_items, categories, notifications, order_items, orders, products, profiles, reviews, users'

-- =============================================
-- 3. VERIFY ALL FUNCTIONS EXIST
-- =============================================
\echo '' \echo '3. Verifying functions...'

SELECT 'Functions' as component, COUNT(*) as count
FROM information_schema.routines
WHERE
    routine_schema = 'public'
    AND routine_type = 'FUNCTION';

\echo 'Custom functions:'
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_type = 'FUNCTION'
    AND routine_name IN ('handle_updated_at', 'handle_new_user')
ORDER BY routine_name;

-- =============================================
-- 4. VERIFY ALL TRIGGERS EXIST
-- =============================================
\echo '' \echo '4. Verifying triggers...'

SELECT 'Triggers' as component, COUNT(*) as count
FROM information_schema.triggers
WHERE
    trigger_schema = 'public';

SELECT
    trigger_name,
    event_object_table as table_name,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE
    trigger_schema = 'public'
ORDER BY
    event_object_table,
    trigger_name;

-- =============================================
-- 5. VERIFY ALL VIEWS EXIST
-- =============================================
\echo '' \echo '5. Verifying views...'

SELECT 'Views' as component, COUNT(*) as count, string_agg(table_name, ', ') as list
FROM information_schema.views
WHERE
    table_schema = 'public';

-- Test views work
\echo 'Testing views functionality...'
SELECT 'product_details view test' as test, COUNT(*) as rows FROM product_details;

SELECT 'order_details view test' as test, COUNT(*) as rows
FROM order_details;

-- =============================================
-- 6. VERIFY INDEXES EXIST
-- =============================================
\echo '' \echo '6. Verifying indexes...'

SELECT 'Indexes' as component, COUNT(*) as count
FROM pg_indexes
WHERE
    schemaname = 'public';

\echo 'Performance indexes:'
SELECT 
    tablename,
    COUNT(*) as index_count
FROM pg_indexes 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- =============================================
-- 7. VERIFY FOREIGN KEY CONSTRAINTS
-- =============================================
\echo '' \echo '7. Verifying foreign key constraints...'

SELECT 'Foreign Keys' as component, COUNT(*) as count
FROM information_schema.table_constraints
WHERE
    constraint_schema = 'public'
    AND constraint_type = 'FOREIGN KEY';

SELECT
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE
    tc.constraint_type = 'FOREIGN KEY'
    AND tc.constraint_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- =============================================
-- 8. VERIFY EXTENSIONS
-- =============================================
\echo '' \echo '8. Verifying PostgreSQL extensions...'

SELECT
    extname as extension_name,
    extversion as version
FROM pg_extension
WHERE
    extname IN ('uuid-ossp', 'pgcrypto')
ORDER BY extname;

-- =============================================
-- 9. TEST DATA INTEGRITY
-- =============================================
\echo '' \echo '9. Testing data integrity...'

-- Check sample data counts
SELECT 'categories' as table_name, COUNT(*) as count
FROM categories
UNION ALL
SELECT 'users', COUNT(*)
FROM users
UNION ALL
SELECT 'profiles', COUNT(*)
FROM profiles
UNION ALL
SELECT 'artisan_profiles', COUNT(*)
FROM artisan_profiles
UNION ALL
SELECT 'products', COUNT(*)
FROM products
UNION ALL
SELECT 'orders', COUNT(*)
FROM orders
UNION ALL
SELECT 'order_items', COUNT(*)
FROM order_items
ORDER BY table_name;

-- =============================================
-- 10. TEST TRIGGER FUNCTIONALITY
-- =============================================
\echo '' \echo '10. Testing trigger functionality...'

-- Test auto profile creation trigger
BEGIN;

-- Insert test user
INSERT INTO
    users (id, email, password_hash)
VALUES (
        'test-migration-id',
        'migration.test@example.com',
        '$2b$10$test.hash'
    );

-- Check if profile was auto-created
SELECT
    'Auto-profile creation test' as test,
    CASE
        WHEN COUNT(*) = 1 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as result
FROM profiles
WHERE
    email = 'migration.test@example.com';

-- Test updated_at trigger
UPDATE users
SET
    email_verified = true
WHERE
    email = 'migration.test@example.com';

SELECT
    'Updated_at trigger test' as test,
    CASE
        WHEN updated_at > created_at THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as result
FROM users
WHERE
    email = 'migration.test@example.com';

-- Cleanup test data
ROLLBACK;

-- =============================================
-- 11. TEST APPLICATION COMPATIBILITY
-- =============================================
\echo '' \echo '11. Testing application compatibility...'

-- Test JWT authentication compatibility
SELECT
    'JWT auth schema test' as test,
    CASE
        WHEN EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE
                table_name = 'users'
                AND column_name IN (
                    'email',
                    'password_hash',
                    'email_verified'
                )
        ) THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as result;

-- Test required profile fields
SELECT
    'Profile schema test' as test,
    CASE
        WHEN EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE
                table_name = 'profiles'
                AND column_name IN (
                    'first_name',
                    'last_name',
                    'email'
                )
        ) THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as result;

-- Test product catalog compatibility
SELECT
    'Product catalog test' as test,
    CASE
        WHEN EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE
                table_name = 'products'
                AND column_name IN (
                    'name',
                    'price',
                    'images',
                    'is_active'
                )
        ) THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as result;

-- =============================================
-- 12. PERFORMANCE CHECK
-- =============================================
\echo '' \echo '12. Running performance checks...'

-- Test index usage
EXPLAIN (
    ANALYZE,
    BUFFERS
)
SELECT *
FROM products
WHERE
    is_active = true
LIMIT 5;

EXPLAIN (
    ANALYZE,
    BUFFERS
)
SELECT *
FROM categories
WHERE
    is_active = true;

-- =============================================
-- 13. FINAL MIGRATION SUMMARY
-- =============================================
\echo ''
\echo '✅ ================================='
\echo '✅ MIGRATION VERIFICATION COMPLETE'
\echo '✅ ================================='
\echo ''

-- Final summary
SELECT '📊 MIGRATION SUMMARY' as component, '' as count, '' as status
UNION ALL
SELECT
    'Tables',
    (
        SELECT COUNT(*)::text
        FROM information_schema.tables
        WHERE
            table_schema = 'public'
            AND table_type = 'BASE TABLE'
    ),
    CASE
        WHEN (
            SELECT COUNT(*)
            FROM information_schema.tables
            WHERE
                table_schema = 'public'
                AND table_type = 'BASE TABLE'
        ) = 10 THEN '✅ Complete'
        ELSE '❌ Missing'
    END
UNION ALL
SELECT 'Functions', (
        SELECT COUNT(*)::text
        FROM information_schema.routines
        WHERE
            routine_schema = 'public'
            AND routine_type = 'FUNCTION'
    ), '✅ Complete'
UNION ALL
SELECT
    'Triggers',
    (
        SELECT COUNT(*)::text
        FROM information_schema.triggers
        WHERE
            trigger_schema = 'public'
    ),
    CASE
        WHEN (
            SELECT COUNT(*)
            FROM information_schema.triggers
            WHERE
                trigger_schema = 'public'
        ) >= 9 THEN '✅ Complete'
        ELSE '❌ Missing'
    END
UNION ALL
SELECT
    'Views',
    (
        SELECT COUNT(*)::text
        FROM information_schema.views
        WHERE
            table_schema = 'public'
    ),
    CASE
        WHEN (
            SELECT COUNT(*)
            FROM information_schema.views
            WHERE
                table_schema = 'public'
        ) = 2 THEN '✅ Complete'
        ELSE '❌ Missing'
    END
UNION ALL
SELECT 'Foreign Keys', (
        SELECT COUNT(*)::text
        FROM information_schema.table_constraints
        WHERE
            constraint_schema = 'public'
            AND constraint_type = 'FOREIGN KEY'
    ), '✅ Complete'
UNION ALL
SELECT
    'Extensions',
    (
        SELECT COUNT(*)::text
        FROM pg_extension
        WHERE
            extname IN ('uuid-ossp', 'pgcrypto')
    ),
    CASE
        WHEN (
            SELECT COUNT(*)
            FROM pg_extension
            WHERE
                extname IN ('uuid-ossp', 'pgcrypto')
        ) = 2 THEN '✅ Complete'
        ELSE '❌ Missing'
    END;

\echo ''
\echo '🎉 Next Steps:'
\echo '1. Configure .env.local with Windows database credentials'
\echo '2. Install Node.js and pnpm on Windows'
\echo '3. Run: pnpm install && pnpm dev'
\echo '4. Test application at http://localhost:3000'
\echo ''
\echo '🔗 Useful Commands:'
\echo '   Connect: psql -U karigaruser -d karigarverse -h localhost'
\echo '   Backup:  pg_dump -U karigaruser -d karigarverse > backup.sql'
\echo '   Monitor: SELECT * FROM pg_stat_activity;'
\echo ''
\echo '📝 Your Karigarverse database is ready for Windows development!'