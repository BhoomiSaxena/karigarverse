#!/bin/bash

# =============================================
# KARIGARVERSE POSTGRESQL MIGRATION SCRIPT
# Automated migration from Supabase to Local PostgreSQL
# =============================================

set -e

echo "🚀 Starting Karigarverse PostgreSQL Migration..."
echo ""

# Check if PostgreSQL is running
if ! pgrep -x postgres > /dev/null; then
    echo "❌ PostgreSQL is not running. Please start it first:"
    echo "   brew services start postgresql@15"
    exit 1
fi

echo "✅ PostgreSQL is running"

# Test database connection
echo "🔍 Testing database connection..."
if psql -h localhost -U proximus -d karigarverse -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "❌ Cannot connect to database. Please check:"
    echo "   - PostgreSQL is running: brew services list | grep postgresql"
    echo "   - Database exists: psql -h localhost -U proximus -c \"CREATE DATABASE karigarverse;\""
    exit 1
fi

# Run migration
echo ""
echo "📊 Running database migration..."
psql -h localhost -U proximus -d karigarverse -f local-postgres-migration-fixed.sql

echo ""
echo "🔍 Running migration verification..."
psql -h localhost -U proximus -d karigarverse -f verify-migration-fixed.sql

echo ""
echo "🎉 Migration completed successfully!"
echo ""
echo "Next steps:"
echo "1. Copy environment file:"
echo "   cp .env.local.postgres .env.local"
echo ""
echo "2. Generate JWT secret and update .env.local:"
echo "   node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
echo ""
echo "3. Start the application:"
echo "   pnpm dev"
echo ""
echo "Your Karigarverse application is now running on local PostgreSQL! 🐘"
