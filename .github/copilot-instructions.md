# Karigarverse - AI Coding Agent Instructions

## Architecture Overview

**Karigarverse** is a Next.js 15 marketplace connecting artisans with customers, built with TypeScript, **local PostgreSQL**, and shadcn/ui components.

### Core Architecture Patterns

- **Client/Server Split**: Strict separation between client (`src/lib/database-client-postgres.ts`) and server (`src/lib/database-postgres.ts`) database operations
- **Context-Driven State**: Three main React contexts provide global state - `DatabaseContext`, `LanguageContext`, and `ProductsContext`
- **Dual Layout System**: Standard layout for customers + specialized `ArtisanLayout` for artisan dashboard pages
- **Animation-First**: Framer Motion integrated at root level via `clientLayout.tsx` for page transitions

### Key Technology Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with Radix UI primitives
- **Database**: **Local PostgreSQL** with custom authentication system
- **Authentication**: **Custom JWT-based Auth** with bcrypt password hashing
- **Internationalization**: react-i18next (English/Hindi support)
- **Animations**: Framer Motion with page-level AnimatePresence

## Animation System - Modern & Sophisticated

### Core Animation Patterns

```typescript
// Standard card animations (src/components/product-card.tsx)
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  hover: { y: -5, scale: 1.03, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" },
}

// Container stagger animations (src/components/dynamic-product-grid.tsx)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

// Button state transitions with AnimatePresence
<AnimatePresence mode="wait" initial={false}>
  {isAdded ? (
    <motion.span initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <CheckCircle /> Added!
    </motion.span>
  ) : (
    <motion.span>Add to Cart</motion.span>
  )}
</AnimatePresence>
```

### Animation Implementation Rules

- **Page Transitions**: Use `AnimatePresence` in `clientLayout.tsx` with pathname as key
- **Component Entry**: Apply `cardVariants` pattern for consistent fade-in from bottom
- **Hover States**: Combine `whileHover` with CSS `transition-transform duration-300`
- **Loading States**: Use skeleton components with `animate-pulse` for perceived performance
- **Interactive Feedback**: Button state changes with `motion.span` and icon transitions

## Local PostgreSQL Integration & Database Architecture

### Database Schema Structure

The complete schema (`local-postgres-migration-fixed.sql`) includes 9 core tables:

- **users**: Local authentication table with email/password (replaces Supabase auth.users)
- **profiles**: Extends users table with user details and profile information
- **categories**: Product categorization with hierarchical support
- **artisan_profiles**: Shop information and verification status
- **products**: Full product catalog with images, pricing, inventory
- **cart_items**: Shopping cart persistence
- **orders** & **order_items**: Complete order management
- **reviews**: Product reviews with ratings
- **notifications**: User notification system

### Authentication System

```typescript
// Custom JWT-based authentication (src/lib/auth.ts)
import { AuthService } from "@/lib/auth";

// Sign up new users
const result = await AuthService.signUp(email, password, {
  first_name: "John",
  last_name: "Doe",
});

// Sign in users
const result = await AuthService.signIn(email, password);

// Get user profile
const { profile } = await AuthService.getUserProfile(userId);
```

### Database Setup Workflow

#### 1. Environment Configuration

```bash
# Required in .env.local
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=karigarverse
POSTGRES_USER=proximus
POSTGRES_PASSWORD=

# JWT Secret for authentication
JWT_SECRET=your_32_character_random_string
```

#### 2. Schema Deployment

```bash
# Apply the PostgreSQL migration
psql -h localhost -U proximus -d karigarverse -f local-postgres-migration-fixed.sql
```

#### 3. Verification Steps

- Check all 9 tables exist in PostgreSQL database
- Verify triggers and functions are created
- Test authentication creates profile automatically
- Confirm sample categories are populated

#### 4. No Type Generation Needed

Unlike Supabase, the local setup uses manually defined TypeScript types in `database.types.ts` that don't require regeneration.

### Critical Database Operations Pattern

```typescript
// Server-side operations (src/lib/database-postgres.ts)
import { db } from "@/lib/database-postgres";
const products = await db.getProducts({ category: "pottery", limit: 10 });

// Client-side operations (src/lib/database-client-postgres.ts)
import { clientDb } from "@/lib/database-client-postgres";
const userProfile = await clientDb.getUserProfile(userId);
```

## Critical Development Workflows

### Database Operations Pattern

```typescript
// Server components: use DatabaseOperations class
import { db } from "@/lib/database-postgres";
const user = await db.getUserProfile(userId);

// Client components: use clientDb instance
import { clientDb } from "@/lib/database-client-postgres";
const user = await clientDb.getUserProfile(userId);
```

### Component Development

- All UI components use shadcn/ui patterns with `cn()` utility for className merging
- Client components must be marked with `"use client"` directive
- Product cards and lists follow consistent animation patterns using `cardVariants`

### Authentication Flow

- Middleware handles session updates across all routes
- `DatabaseContext` manages user state, profile, and artisan status
- Custom JWT-based authentication with local PostgreSQL storage

### Complete Development Workflow

#### After Database Setup - Essential Commands

```bash
# Use npm for development
npm run dev       # Start development server 
npm run build     # Production build with type checking
npm run lint      # ESLint validation

# Database operations (PostgreSQL)
psql -h localhost -U proximus -d karigarverse -c "SELECT NOW();"  # Test connection
psql -h localhost -U proximus -d karigarverse -f local-postgres-migration-fixed.sql  # Apply schema
```

#### Post-Setup Verification Checklist

1. **Database Connection**: Visit `/api/test-db` endpoint
2. **Authentication**: Test signup/login flow creates profile automatically
3. **Local Tables**: Verify all 9 tables exist in PostgreSQL
4. **Product Display**: Check `DynamicProductGrid` loads sample categories
5. **Artisan Flow**: Test artisan profile creation and product management

## Project-Specific Conventions

### File Organization

- **Database**: Separate client/server files prevent hydration issues
  - `src/lib/database-postgres.ts` - Server-side database operations
  - `src/lib/database-client-postgres.ts` - Client-side database operations
  - `src/lib/auth.ts` - Custom JWT authentication service
  - `src/lib/postgres-config.ts` - PostgreSQL connection configuration
- **Components**: UI components in `/ui`, feature components at root level
- **Contexts**: Global state providers wrap the app in `clientLayout.tsx`
- **Artisan Features**: Nested under `/artisan/` routes with dedicated layout

### Styling Approach

- **Design System**: Bold, neomorphic design with heavy black borders (`border-2 border-black`)
- **Typography**: Kalam Google Font as primary typeface
- **Colors**: CSS custom properties with shadcn/ui color system
- **Responsive**: Mobile-first with sidebar patterns for artisan dashboard

### Language Support

- Translations stored in `public/locales/{lang}/common.json`
- Use `useLanguage()` hook in components: `const { t } = useLanguage()`
- All user-facing text should be wrapped with `t('key')`

## Integration Points

### Local PostgreSQL Integration

- **Environment**: Requires `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_DB`, and `JWT_SECRET`
- **Schema**: Database schema in `local-postgres-migration-fixed.sql` with setup instructions in `LOCAL_POSTGRES_SETUP.md`
- **Types**: Manually defined types in `database.types.ts` - no regeneration needed
- **Authentication**: Custom JWT-based authentication using bcrypt for password hashing

### State Management Flow

```typescript
// Global user state flows through DatabaseContext
DatabaseContext → user/profile → components
ProductsContext → product data → ProductCard components
LanguageContext → translations → UI text
```

### Route Patterns

- **Public Routes**: `/`, `/products`, `/product/[id]`
- **Auth Routes**: `/login`, `/signup` (custom auth pages)
- **Artisan Routes**: `/artisan/*` - protected, use ArtisanLayout
- **Customer Routes**: `/cart`, `/checkout`, `/orders`

## Development Commands

```bash
npm run dev       # Start development server (localhost:3000)
npm run build     # Production build with Next.js optimization
npm start         # Start production server
npm run lint      # ESLint validation and auto-fix

# Database commands (requires PostgreSQL)
psql -h localhost -U proximus -d karigarverse -c "SELECT NOW();"  # Test connection
psql -h localhost -U proximus -d karigarverse -f local-postgres-migration-fixed.sql  # Apply schema
```

## Complete Database Setup - Essential Commands to Run Project

### 1. Environment Setup

```bash
# Create .env.local with these required variables:
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=karigarverse
POSTGRES_USER=proximus
POSTGRES_PASSWORD=
JWT_SECRET=your_32_character_random_string
```

### 2. Database Schema Deployment

```bash
# Apply the PostgreSQL migration
psql -h localhost -U proximus -d karigarverse -f local-postgres-migration-fixed.sql
```

### 3. Post-Setup Verification

- Check all 9 tables exist in PostgreSQL database
- Test authentication creates profile automatically
- Confirm sample categories are populated

### 4. Essential Workflow After Database Setup

1. **Start Project**: `npm run dev`
2. **Test Database**: Visit `/api/test-db` endpoint
3. **Auth Flow**: Test signup/login creates profile automatically
4. **Product Display**: Verify `DynamicProductGrid` loads sample categories
5. **Artisan Dashboard**: Test artisan profile creation and product management

## ⚠️ IMPORTANT: PostgreSQL MCP Server Integration

### Using MCP Server Tools for Database Operations

When working with this project, you can use the available PostgreSQL MCP server tools to interact with the database.

#### Essential MCP Commands for Karigarverse

```bash
# 1. List all tables and their structure
mcp_postgres_list_tables

# 2. Execute queries on specific tables
mcp_postgres_execute "SELECT * FROM profiles LIMIT 5"
mcp_postgres_execute "SELECT * FROM products WHERE is_active = true"

# 3. Get table descriptions
mcp_postgres_describe_table profiles
mcp_postgres_describe_table products

# 4. List all schemas
mcp_postgres_list_schemas
```

#### Database Schema Discovery Workflow

**Before making any database changes**, use these MCP commands to understand the current state:

1. **Explore Tables**: `mcp_postgres_list_tables` - See all 9 tables and their relationships
2. **Examine Data**: Use `mcp_postgres_execute` to see sample data and understand structure
3. **Check Schema**: Use `mcp_postgres_describe_table` to understand table structure

#### Integration with Development Workflow

```typescript
// Instead of guessing table structure, use MCP to discover:
// mcp_postgres_execute "DESCRIBE products"

// Then implement in code:
const products = await clientDb.getProducts({
  category: "pottery",
  is_active: true,
  limit: 10,
});
```

#### MCP Server Benefits for This Project

- **Schema Discovery**: Understand the 9-table structure without reading files
- **Live Data Inspection**: See actual data to understand relationships
- **Query Testing**: Test queries before implementing in code
- **Data Verification**: Ensure authentication and profile creation works correctly

**🚨 CRITICAL**: Always verify database changes using MCP tools before implementing code changes that depend on schema modifications.

## Key Files to Reference

- `src/app/clientLayout.tsx` - Root client wrapper with providers
- `src/contexts/DatabaseContext.tsx` - User authentication & profile state
- `src/lib/database-client-postgres.ts` vs `src/lib/database-postgres.ts` - Client/server data access
- `src/lib/auth.ts` - Custom JWT authentication service
- `src/lib/postgres-config.ts` - PostgreSQL connection configuration
- `src/components/product-card.tsx` - Standard product display component
- `src/components/dynamic-product-grid.tsx` - Animated product grid with filtering
- `LOCAL_POSTGRES_SETUP.md` - PostgreSQL configuration instructions
- `local-postgres-migration-fixed.sql` - Complete database schema with triggers
