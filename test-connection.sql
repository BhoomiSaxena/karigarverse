-- =============================================
-- PRE-MIGRATION CONNECTION TEST
-- Run this first to verify database connection
-- =============================================

-- Run with: psql -h localhost -U proximus -d karigarverse -f test-connection.sql

-- Test basic connection
SELECT 'Database connection successful! ✅' as status;

SELECT current_database() as database_name;

SELECT current_user as connected_user;

SELECT version() as postgres_version;

-- Check if we can create and drop a test table
CREATE TABLE test_connection (id INTEGER);

DROP TABLE test_connection;

SELECT 'Create/Drop permissions verified! ✅' as permissions;

-- Test UUID extension (required for our schema)
SELECT uuid_generate_v4 () as test_uuid;

SELECT 'UUID extension working! ✅' as uuid_status;