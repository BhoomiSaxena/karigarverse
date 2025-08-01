# 🚀 Karigarverse Database Migration to Windows - Complete Guide

## 📋 Overview

This guide will help you migrate the complete Karigarverse database from your current Mac/Linux setup to a Windows laptop with PostgreSQL.

**What will be migrated:**

- ✅ 10 Tables with all relationships
- ✅ 48 Functions (including PostgreSQL extensions)
- ✅ 9 Triggers for data integrity
- ✅ 2 Views for enhanced queries
- ✅ All indexes and constraints
- ✅ Sample data structure

---

## 🛠️ Method 1: Direct SQL Migration (Recommended)

### Step 1: Install PostgreSQL on Windows

1. **Download PostgreSQL 15+**
   - Visit: <https://www.postgresql.org/download/windows/>
   - Download the Windows installer for your system (x64)

2. **Install PostgreSQL**
   - Run installer as Administrator
   - Set a strong password for `postgres` user
   - Accept default port (5432)
   - Complete installation

3. **Verify Installation**

   ```cmd
   # Open Command Prompt as Administrator
   psql -U postgres -h localhost
   # Enter your password when prompted
   ```

### Step 2: Create Database and User

```sql
-- Connect as postgres superuser
psql -U postgres -h localhost

-- Create database
CREATE DATABASE karigarverse;

-- Create user (replace 'yourpassword' with a strong password)
CREATE USER karigaruser WITH PASSWORD 'yourpassword';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE karigarverse TO karigaruser;
GRANT ALL ON SCHEMA public TO karigaruser;

-- Exit
\q
```

### Step 3: Run Migration Script

1. **Download the migration file** from this repository: `windows-migration-complete.sql`

2. **Execute the migration**:

   ```cmd
   # Navigate to the downloaded file directory
   cd C:\path\to\downloaded\files

   # Run the migration
   psql -U karigaruser -d karigarverse -h localhost -f windows-migration-complete.sql
   ```

3. **Verify the migration**:

   ```sql
   # Connect to verify
   psql -U karigaruser -d karigarverse -h localhost

   # Check tables
   \dt

   # Check sample data
   SELECT COUNT(*) FROM categories;
   SELECT name FROM categories;

   # Test views
   SELECT * FROM product_details LIMIT 1;
   ```

### Step 4: Configure Your Application

Create `.env.local` file in your Karigarverse project:

```env
# PostgreSQL Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=karigarverse
POSTGRES_USER=karigaruser
POSTGRES_PASSWORD=yourpassword

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secure-jwt-secret-key-64-characters-long

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Step 5: Install and Run Application

```cmd
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

---

## 🗂️ Method 2: Database Dump and Restore

### Option A: Using pg_dump (With Data)

**On your current machine (Mac/Linux):**

```bash
# Create complete dump including data
pg_dump -U proximus -h localhost -d karigarverse \
  --clean --create --if-exists \
  --verbose --file=karigarverse_complete_dump.sql

# Or create dump without data (structure only)
pg_dump -U proximus -h localhost -d karigarverse \
  --schema-only --clean --create --if-exists \
  --verbose --file=karigarverse_schema_only.sql
```

**On Windows machine:**

```cmd
# Restore the dump
psql -U postgres -h localhost -f karigarverse_complete_dump.sql
```

### Option B: Using Compressed Backup

**Create compressed backup:**

```bash
# On source machine
pg_dump -U proximus -h localhost -d karigarverse \
  --format=custom --compress=9 \
  --file=karigarverse_backup.backup
```

**Restore on Windows:**

```cmd
# On Windows
pg_restore -U postgres -h localhost -d postgres \
  --create --clean --if-exists \
  --verbose karigarverse_backup.backup
```

---

## 📁 Method 3: Alternative Transfer Methods

### 1. Cloud Storage Transfer

- Upload SQL file to Google Drive, Dropbox, or OneDrive
- Download on Windows machine
- Run the migration script

### 2. USB Drive Transfer

- Copy `windows-migration-complete.sql` to USB drive
- Transfer to Windows machine
- Execute the script

### 3. Network Transfer

```bash
# On source machine (create a simple HTTP server)
python3 -m http.server 8000

# On Windows machine (download via browser)
# Visit: http://[source-machine-ip]:8000
# Download the SQL file
```

### 4. Email Transfer

- Compress the SQL file: `zip karigarverse-migration.zip windows-migration-complete.sql`
- Email to yourself
- Download and extract on Windows

### 5. GitHub Repository

- Commit the migration file to your repository
- Clone/pull on Windows machine
- Run the script

---

## ✅ Post-Migration Verification

### 1. Verify Database Structure

```sql
-- Connect to database
psql -U karigaruser -d karigarverse -h localhost

-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Should show: artisan_profiles, cart_items, categories, notifications, 
-- order_items, orders, products, profiles, reviews, users

-- Check functions
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- Check triggers
SELECT trigger_name, event_object_table FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Check views
SELECT table_name FROM information_schema.views 
WHERE table_schema = 'public';

-- Should show: order_details, product_details
```

### 2. Test Application Integration

```sql
-- Test user creation (should auto-create profile)
INSERT INTO users (email, password_hash) 
VALUES ('test@example.com', '$2b$10$test.hash');

-- Verify profile was created
SELECT u.email, p.first_name FROM users u 
JOIN profiles p ON u.id = p.id 
WHERE u.email = 'test@example.com';

-- Clean up test data
DELETE FROM users WHERE email = 'test@example.com';
```

### 3. Performance Check

```sql
-- Test indexes are working
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM products WHERE is_active = true;

-- Test views performance
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM product_details LIMIT 10;
```

---

## 🔧 Troubleshooting

### Common Issues

1. **Permission Denied**

   ```sql
   -- Grant additional permissions
   GRANT ALL ON ALL TABLES IN SCHEMA public TO karigaruser;
   GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO karigaruser;
   ```

2. **Extension Not Found**

   ```sql
   -- Install extensions as superuser
   psql -U postgres -d karigarverse
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";
   ```

3. **Connection Issues**
   - Check PostgreSQL service is running
   - Verify firewall settings
   - Confirm port 5432 is available

4. **Memory Issues on Large Datasets**

   ```cmd
   # Increase work_mem for migration
   psql -U postgres -c "ALTER SYSTEM SET work_mem = '256MB';"
   psql -U postgres -c "SELECT pg_reload_conf();"
   ```

---

## 📊 Migration Summary

After successful migration, you will have:

| Component | Count | Status |
|-----------|-------|--------|
| Tables | 10 | ✅ Complete with relationships |
| Functions | 48 | ✅ All extensions + custom functions |
| Triggers | 9 | ✅ Data integrity triggers |
| Views | 2 | ✅ Enhanced query views |
| Indexes | 40+ | ✅ Performance optimized |
| Constraints | 15 | ✅ Foreign key relationships |

**Next Steps:**

1. Configure `.env.local` with Windows database credentials
2. Install Node.js and pnpm on Windows
3. Clone Karigarverse repository
4. Run `pnpm install && pnpm dev`
5. Access application at `http://localhost:3000`

---

## 🎯 Quick Commands Reference

```cmd
# Windows PostgreSQL Commands
net start postgresql-x64-15    # Start PostgreSQL service
net stop postgresql-x64-15     # Stop PostgreSQL service

# Connection
psql -U karigaruser -d karigarverse -h localhost

# Backup (Windows)
pg_dump -U karigaruser -h localhost -d karigarverse > backup.sql

# Restore (Windows)
psql -U karigaruser -h localhost -d karigarverse < backup.sql
```

---

**🎉 Your Karigarverse database is now ready on Windows!**
