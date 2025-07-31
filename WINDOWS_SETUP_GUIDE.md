# 🎨 Karigarverse - Complete Windows Setup Guide

> _Step-by-step guide to run the Karigarverse artisan marketplace on Windows with PostgreSQL_

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Windows](https://img.shields.io/badge/Windows-10%2F11-blue?style=for-the-badge&logo=windows)](https://www.microsoft.com/windows)

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Prerequisites](#-prerequisites)
3. [Step 1: Install Node.js and pnpm](#step-1-install-nodejs-and-pnpm)
4. [Step 2: Install PostgreSQL](#step-2-install-postgresql)
5. [Step 3: Download and Setup Project](#step-3-download-and-setup-project)
6. [Step 4: Configure Database](#step-4-configure-database)
7. [Step 5: Environment Configuration](#step-5-environment-configuration)
8. [Step 6: Install Dependencies](#step-6-install-dependencies)
9. [Step 7: Run Database Migration](#step-7-run-database-migration)
10. [Step 8: Start the Application](#step-8-start-the-application)
11. [Verification & Testing](#-verification--testing)
12. [Troubleshooting](#-troubleshooting)
13. [Project Structure](#-project-structure)
14. [Development Workflow](#-development-workflow)

## 🌟 Project Overview

**Karigarverse** is a modern Next.js 15 marketplace that connects skilled artisans with customers worldwide. It features:

- **Next.js 15** with App Router and TypeScript
- **Local PostgreSQL** database with custom authentication
- **shadcn/ui** components with Tailwind CSS
- **Framer Motion** animations
- **Internationalization** (English/Hindi support)
- **Custom JWT Authentication** system

### Architecture Highlights

- **Client/Server Split**: Separate database operations for client and server
- **Context-Driven State**: React contexts for global state management
- **Animation-First**: Sophisticated animations with Framer Motion
- **Modern UI**: Neomorphic design with bold borders and Kalam font

## ✅ Prerequisites

Before starting, ensure you have:

- Windows 10 or Windows 11
- Administrator access for software installation
- At least 4GB RAM
- 2GB free disk space
- Stable internet connection

## Step 1: Install Node.js and pnpm

### 1.1 Download and Install Node.js

1. **Visit Node.js Official Website**
   - Go to [https://nodejs.org/](https://nodejs.org/)
   - Download the **LTS version** (recommended for most users)
   - Choose the Windows Installer (.msi) for your system (x64 for 64-bit)

2. **Install Node.js**
   - Run the downloaded installer
   - Follow the setup wizard
   - ✅ Check "Automatically install the necessary tools" when prompted
   - Accept the license agreement
   - Complete the installation

3. **Verify Installation**
   Open Command Prompt or PowerShell and run:

   ```cmd
   node --version
   npm --version
   ```

   You should see version numbers (e.g., v20.x.x and 10.x.x)

### 1.2 Install pnpm (Package Manager)

1. **Install pnpm globally**

   ```cmd
   npm install -g pnpm
   ```

2. **Verify pnpm installation**

   ```cmd
   pnpm --version
   ```

## Step 2: Install PostgreSQL

### 2.1 Download PostgreSQL

1. **Visit PostgreSQL Official Website**
   - Go to [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
   - Click "Download the installer"
   - Choose **PostgreSQL 15** or higher
   - Download the Windows x86-64 installer

### 2.2 Install PostgreSQL

1. **Run the Installer**
   - Right-click and "Run as administrator"
   - Follow the installation wizard

2. **Installation Configuration**
   - **Installation Directory**: Use default (`C:\Program Files\PostgreSQL\15\`)
   - **Data Directory**: Use default (`C:\Program Files\PostgreSQL\15\data\`)
   - **Password**: Set a password for the `postgres` user (remember this!)
   - **Port**: Use default `5432`
   - **Locale**: Use default

3. **Complete Installation**
   - Wait for installation to complete
   - ✅ Launch Stack Builder (optional - skip for now)

### 2.3 Verify PostgreSQL Installation

1. **Open Command Prompt as Administrator**
2. **Test PostgreSQL Connection**

   ```cmd
   cd "C:\Program Files\PostgreSQL\15\bin"
   psql -U postgres
   ```

3. **Enter the password** you set during installation
4. **You should see the PostgreSQL prompt**: `postgres=#`
5. **Exit PostgreSQL**: Type `\q` and press Enter

### 2.4 Add PostgreSQL to PATH (Optional)

1. **Open System Environment Variables**
   - Press `Windows + R`, type `sysdm.cpl`, press Enter
   - Click "Environment Variables"
   - In "System Variables", find and select "Path"
   - Click "Edit"
   - Click "New"
   - Add: `C:\Program Files\PostgreSQL\15\bin`
   - Click "OK" to save

2. **Restart Command Prompt** to use `psql` from anywhere

## Step 3: Download and Setup Project

### 3.1 Download the Project

**Option A: Download ZIP**

1. Go to the GitHub repository
2. Click "Code" → "Download ZIP"
3. Extract the ZIP file to a folder (e.g., `C:\Projects\karigarverse`)

**Option B: Clone with Git** (if you have Git installed)

```cmd
git clone https://github.com/yourusername/karigarverse.git
cd karigarverse
```

### 3.2 Navigate to Project Directory

```cmd
cd C:\Projects\karigarverse
```

## Step 4: Configure Database

### 4.1 Create Database and User

1. **Open Command Prompt as Administrator**
2. **Connect to PostgreSQL**

   ```cmd
   psql -U postgres
   ```

3. **Create Database and User**

   ```sql
   -- Create the database
   CREATE DATABASE karigarverse;
   
   -- Create a user (replace 'yourpassword' with a secure password)
   CREATE USER karigaruser WITH PASSWORD 'yourpassword';
   
   -- Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE karigarverse TO karigaruser;
   
   -- Exit PostgreSQL
   \q
   ```

### 4.2 Test Database Connection

```cmd
psql -h localhost -U karigaruser -d karigarverse
```

Enter your password when prompted. If successful, you'll see the `karigarverse=#` prompt.

## Step 5: Environment Configuration

### 5.1 Create Environment File

1. **In the project directory**, create a file named `.env.local`
2. **Copy and paste the following configuration**:

```env
# PostgreSQL Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=karigarverse
POSTGRES_USER=karigaruser
POSTGRES_PASSWORD=yourpassword

# JWT Secret for authentication (generate a secure random string)
JWT_SECRET=your-super-secure-jwt-secret-key-replace-this-with-64-character-random-string

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 5.2 Generate JWT Secret

**Option A: Using Node.js**

```cmd
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option B: Use an online generator**

- Visit [https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx](https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx)
- Generate a 256-bit key
- Copy and replace `JWT_SECRET` value in `.env.local`

**Replace `yourpassword`** with the actual password you set for the `karigaruser` database user.

## Step 6: Install Dependencies

### 6.1 Install Project Dependencies

In the project directory, run:

```cmd
pnpm install
```

This will install all required packages including:

- Next.js 15
- TypeScript
- PostgreSQL client (`pg`)
- Authentication libraries (`bcryptjs`, `jsonwebtoken`)
- UI components (`@radix-ui/*`, `framer-motion`)
- Styling (`tailwindcss`)

**Wait for installation to complete** (may take 2-5 minutes depending on internet speed)

## Step 7: Run Database Migration

### 7.1 Apply Database Schema

The project includes a complete database migration script that will create all necessary tables and sample data.

```cmd
psql -h localhost -U karigaruser -d karigarverse -f local-postgres-migration-fixed.sql
```

**Expected Output:**

- ✅ Extensions created (uuid-ossp, pgcrypto)
- ✅ 10 tables created with proper relationships
- ✅ Indexes and triggers set up
- ✅ Sample data inserted (categories, users, products)
- ✅ Views created for enhanced queries

### 7.2 Verify Migration

```cmd
psql -h localhost -U karigaruser -d karigarverse -f verify-migration-fixed.sql
```

This will verify:

- All tables exist
- Sample data is inserted correctly
- Relationships are working
- Views and functions are created

## Step 8: Start the Application

### 8.1 Start Development Server

```cmd
pnpm dev
```

**You should see output like:**

```
▲ Next.js 15.2.4
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.3s
```

### 8.2 Open Application

1. **Open your web browser**
2. **Navigate to**: [http://localhost:3000](http://localhost:3000)
3. **You should see the Karigarverse homepage** with:
   - Hero carousel
   - Product categories
   - Featured products
   - Artisan marketplace interface

## 🔍 Verification & Testing

### Test Database Connection

1. **Visit**: [http://localhost:3000/api/test-db](http://localhost:3000/api/test-db)
2. **Expected Response**:

   ```json
   {
     "status": "success",
     "message": "Database connection successful",
     "currentTime": "2025-01-31T...",
     "tables": ["users", "profiles", "categories"]
   }
   ```

### Test Key Features

- [ ] **Homepage loads** with sample products and categories
- [ ] **Product browsing** and category filtering works
- [ ] **User registration** creates new accounts
- [ ] **User login** authenticates successfully
- [ ] **Artisan dashboard** is accessible after login
- [ ] **Product creation** works for artisan accounts
- [ ] **Cart functionality** adds/removes items

### Sample Login Credentials

The migration includes test users:

**Artisan Account:**

- Email: `artisan1@example.com`
- Password: `password123`

**Customer Account:**

- Email: `customer1@example.com`
- Password: `password123`

## 🛠 Troubleshooting

### Common Issues and Solutions

#### 1. PostgreSQL Connection Failed

**Error**: `Database connection failed`

**Solutions**:

```cmd
# Check if PostgreSQL is running
net start postgresql-x64-15

# Test connection manually
psql -h localhost -U karigaruser -d karigarverse

# Check PostgreSQL service status
services.msc
# Look for "postgresql-x64-15" service
```

#### 2. Permission Denied Errors

**Error**: `permission denied for database`

**Solution**: Grant proper permissions

```sql
-- Connect as postgres user
psql -U postgres

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE karigarverse TO karigaruser;
ALTER USER karigaruser CREATEDB;
\q
```

#### 3. Port Already in Use

**Error**: `Port 3000 is already in use`

**Solutions**:

```cmd
# Option 1: Kill process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Option 2: Use different port
pnpm dev -- -p 3001
```

#### 4. Node.js/pnpm Not Recognized

**Error**: `'node' is not recognized as an internal or external command`

**Solution**: Add Node.js to PATH

1. Open System Environment Variables
2. Add to PATH: `C:\Program Files\nodejs\`
3. Restart Command Prompt

#### 5. Migration Script Errors

**Error**: Database migration fails

**Solution**: Reset and re-run migration

```cmd
# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS karigarverse;"
psql -U postgres -c "CREATE DATABASE karigarverse;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE karigarverse TO karigaruser;"

# Re-run migration
psql -h localhost -U karigaruser -d karigarverse -f local-postgres-migration-fixed.sql
```

#### 6. Module Not Found Errors

**Error**: `Cannot find module`

**Solution**: Clear cache and reinstall

```cmd
# Remove node_modules and lock file
rmdir /s node_modules
del pnpm-lock.yaml

# Reinstall dependencies
pnpm install
```

### Getting Help

If you encounter issues:

1. **Check the console output** for specific error messages
2. **Review the troubleshooting section** above
3. **Verify all prerequisites** are installed correctly
4. **Check environment variables** in `.env.local`
5. **Test database connection** independently

## 📁 Project Structure

```
karigarverse/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── api/               # API routes
│   │   ├── artisan/           # Artisan dashboard pages
│   │   ├── auth/              # Authentication pages
│   │   └── page.tsx           # Homepage
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   └── *.tsx             # Feature components
│   ├── contexts/             # React contexts
│   │   ├── DatabaseContext.tsx
│   │   ├── LanguageContext.tsx
│   │   └── ProductsContext.tsx
│   ├── lib/                  # Utility libraries
│   │   ├── auth.ts           # JWT authentication
│   │   ├── database-postgres.ts      # Server-side DB operations
│   │   ├── database-client-postgres.ts # Client-side DB operations
│   │   └── postgres-config.ts # PostgreSQL configuration
│   └── styles/               # Global styles
├── public/                   # Static assets
├── local-postgres-migration-fixed.sql # Database schema
├── verify-migration-fixed.sql         # Migration verification
├── package.json             # Dependencies and scripts
├── .env.local              # Environment variables (you create this)
└── README.md               # Project documentation
```

### Key Files Explained

- **`src/lib/auth.ts`**: Custom JWT-based authentication system
- **`src/lib/database-postgres.ts`**: Server-side database operations
- **`src/lib/database-client-postgres.ts`**: Client-side database operations
- **`src/contexts/DatabaseContext.tsx`**: Global user state management
- **`local-postgres-migration-fixed.sql`**: Complete database schema with sample data
- **`middleware.ts`**: Request middleware (authentication, routing)

## 💻 Development Workflow

### Daily Development Commands

```cmd
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Test database connection
# Visit: http://localhost:3000/api/test-db
```

### Database Operations

```cmd
# Connect to database
psql -h localhost -U karigaruser -d karigarverse

# View all tables
\dt

# View table structure
\d table_name

# Query data
SELECT * FROM categories;
SELECT * FROM products LIMIT 5;

# Exit
\q
```

### Making Changes

1. **Frontend Changes**: Edit files in `src/` directory
2. **Database Changes**: Modify and re-run migration scripts
3. **API Changes**: Edit files in `src/app/api/` directory
4. **Styling Changes**: Modify Tailwind classes or global CSS

### Project Features

#### 🎨 Animation System

- **Framer Motion** integration for smooth page transitions
- **Card animations** with hover effects
- **Stagger animations** for lists and grids
- **Loading states** with skeleton components

#### 🔐 Authentication System

- **Custom JWT-based** authentication
- **Password hashing** with bcryptjs
- **Session management** with local storage
- **Role-based access** (customer/artisan)

#### 🌐 Internationalization

- **English/Hindi** language support
- **Dynamic language switching**
- **Translated UI components**
- **Localized content**

#### 📱 Responsive Design

- **Mobile-first** approach
- **Tailwind CSS** utility classes
- **shadcn/ui** components
- **Neomorphic design** with bold borders

### Database Schema

The application includes 10 main tables:

1. **users** - Authentication (replaces Supabase auth.users)
2. **profiles** - User profile information
3. **categories** - Product categories with sample data
4. **artisan_profiles** - Artisan shop information
5. **products** - Product catalog with sample items
6. **cart_items** - Shopping cart functionality
7. **orders** - Order management
8. **order_items** - Individual order line items
9. **reviews** - Product reviews and ratings
10. **notifications** - User notification system

## 🎉 Success

You have successfully set up Karigarverse on Windows! The application should now be running at [http://localhost:3000](http://localhost:3000) with a fully functional PostgreSQL database.

### Next Steps

1. **Explore the application** - Browse products, create accounts, test features
2. **Customize the content** - Add your own products and categories
3. **Modify the design** - Update colors, fonts, and layout
4. **Add new features** - Extend functionality as needed
5. **Deploy to production** - Consider hosting options when ready

### Production Deployment

For production deployment, consider:

- **Vercel** or **Netlify** for hosting
- **Railway** or **Supabase** for PostgreSQL database
- **Cloudinary** for image storage
- **SendGrid** for email notifications

---

**🚨 Important**: This setup is for **development purposes**. For production deployment, ensure proper security measures, environment variable protection, and database hosting.

**Happy coding!** 🎨✨
