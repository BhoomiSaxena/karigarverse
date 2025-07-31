# Local PostgreSQL Migration Guide

## 🚀 Complete Migration from Supabase to Local PostgreSQL

This guide will help you migrate your Karigarverse application from Supabase to your local PostgreSQL database.

### Prerequisites ✅

- PostgreSQL 15 installed via Homebrew
- Database `karigarverse` created
- User `proximus` with access to the database

### Step 1: Environment Setup

1. Copy the environment template:

```bash
cp .env.local.example .env.local
```

2. Update your `.env.local` file with:

```bash
# PostgreSQL Database Configuration
POSTGRES_USER=proximus
POSTGRES_PASSWORD=          # Leave empty if no password set
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=karigarverse

# JWT Secret for authentication (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-replace-this-with-something-secure

# App Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# Comment out or remove Supabase config
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Step 2: Run the Database Migration

Execute the migration script to set up all tables, indexes, and sample data:

```bash
psql -h localhost -U proximus -d karigarverse -f local-postgres-migration.sql
```

This will:

- ✅ Drop existing tables (if any) for clean migration
- ✅ Create all 9 core tables with proper relationships
- ✅ Set up indexes for optimal performance
- ✅ Create triggers for updated_at timestamps
- ✅ Insert sample categories and test data
- ✅ Create views for better data access

### Step 3: Install Node Dependencies

Make sure you have the PostgreSQL client library:

```bash
pnpm install pg @types/pg bcryptjs @types/bcryptjs jsonwebtoken @types/jsonwebtoken
```

### Step 4: Verify Migration

After running the migration, verify everything is set up correctly:

```bash
# Connect to your database
psql -h localhost -U proximus -d karigarverse

# Check tables were created
\dt

# Verify sample data
SELECT * FROM categories;
SELECT * FROM profiles;
SELECT * FROM products LIMIT 3;

# Exit psql
\q
```

### Step 5: Test the Application

Start your development server:

```bash
pnpm dev
```

Test key endpoints:

- `http://localhost:3000/api/db/categories` - Should return categories
- `http://localhost:3000/api/db/products` - Should return products
- `http://localhost:3000` - Main page should load with sample data

### Database Schema Overview

The migration creates these tables:

1. **users** - User authentication (replaces Supabase auth.users)
2. **profiles** - User profile information
3. **categories** - Product categories with sample data
4. **artisan_profiles** - Artisan shop information
5. **products** - Product catalog with sample items
6. **cart_items** - Shopping cart functionality
7. **orders** - Order management
8. **order_items** - Individual order line items
9. **reviews** - Product reviews and ratings
10. **notifications** - User notification system

### Sample Data Included

- 6 product categories (Pottery, Textiles, Jewelry, etc.)
- 3 test users (2 artisans, 1 customer)
- 2 artisan profiles with shops
- 4 sample products

### Key Changes from Supabase

1. **Authentication**: Custom JWT-based auth instead of Supabase Auth
2. **Database**: Direct PostgreSQL connection instead of Supabase client
3. **Row Level Security**: Removed (handled in application layer)
4. **Real-time**: Removed (can be added later with WebSockets if needed)

### Troubleshooting

**Connection Issues:**

- Ensure PostgreSQL is running: `brew services start postgresql@15`
- Check if database exists: `psql -h localhost -U proximus -l`
- Create database if missing: `createdb -h localhost -U proximus karigarverse`

**Permission Issues:**

- Grant permissions: `GRANT ALL PRIVILEGES ON DATABASE karigarverse TO proximus;`

**Migration Errors:**

- Drop and recreate database: `dropdb -h localhost -U proximus karigarverse && createdb -h localhost -U proximus karigarverse`
- Re-run migration script

### Development Workflow

1. **Database Changes**: Modify `local-postgres-migration.sql` and re-run
2. **API Development**: All database operations now go through local PostgreSQL
3. **Testing**: Use sample data provided for development and testing

### Next Steps

- Test all application functionality
- Update any hardcoded Supabase references
- Set up database backups for production
- Consider adding connection pooling for better performance

---

🎉 **Your Karigarverse application is now running on local PostgreSQL!**

All tables, relationships, and sample data are set up and ready for development.
