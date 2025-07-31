# Karigarverse - AI Coding Agent Instructions

## Architecture Overview

**Karigarverse** is a Next.js 15 marketplace connecting artisans with customers, built with TypeScript, postgres, and shadcn/ui components.

### Core Architecture Patterns

- **Client/Server Split**: Strict separation between client (`src/lib/database-client.ts`) and server (`src/lib/database.ts`) database operations
- **Context-Driven State**: Three main React contexts provide global state - `DatabaseContext`, `LanguageContext`, and `ProductsContext`
- **Dual Layout System**: Standard layout for customers + specialized `ArtisanLayout` for artisan dashboard pages
- **Animation-First**: Framer Motion integrated at root level via `clientLayout.tsx` for page transitions

### Key Technology Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with Radix UI primitives
- **Database**: Supabase with generated TypeScript types (`database.types.ts`)
- **Authentication**: Supabase Auth with SSR support
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

## Supabase Integration & Database Architecture

### Database Schema Structure

The complete schema (`supabase-schema.sql`) includes 9 core tables:

- **profiles**: Extends Supabase auth.users with user details
- **categories**: Product categorization with hierarchical support
- **artisan_profiles**: Shop information and verification status
- **products**: Full product catalog with images, pricing, inventory
- **cart_items**: Shopping cart persistence
- **orders** & **order_items**: Complete order management
- **reviews**: Product reviews with ratings
- **notifications**: User notification system

### Row Level Security (RLS) Policies

```sql
-- Key RLS patterns implemented:
-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

-- Artisans can only manage their own products
CREATE POLICY "Artisans can update their own products" ON products
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM artisan_profiles WHERE id = artisan_id AND user_id = auth.uid())
);

-- Public data is accessible to everyone
CREATE POLICY "Active products are viewable by everyone" ON products
FOR SELECT USING (is_active = true);
```

### Database Setup Workflow

#### 1. Environment Configuration

```bash
# Required in .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

#### 2. Schema Deployment

```bash
# Option A: Via Supabase Dashboard
# 1. Go to SQL Editor in Supabase Dashboard
# 2. Copy entire supabase-schema.sql content
# 3. Execute the script

# Option B: Via Supabase CLI
supabase db push
```

#### 3. Verification Steps

- Check all 9 tables exist in Database > Tables
- Verify RLS is enabled on all tables
- Test authentication trigger creates profile automatically
- Confirm sample categories are populated

#### 4. Type Generation

```bash
# Generate TypeScript types after schema changes
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts
```

### Critical Database Operations Pattern

```typescript
// Server-side operations (src/lib/database.ts)
import { db } from "@/lib/database";
const products = await db.getProducts({ category: "pottery", limit: 10 });

// Client-side operations (src/lib/database-client.ts)
import { clientDb } from "@/lib/database-client";
const userProfile = await clientDb.getUserProfile(userId);
```

## Critical Development Workflows

### Database Operations Pattern

```typescript
// Server components: use DatabaseOperations class
import { db } from "@/lib/database";
const user = await db.getUserProfile(userId);

// Client components: use clientDb instance
import { clientDb } from "@/lib/database-client";
const user = await clientDb.getUserProfile(userId);
```

### Component Development

- All UI components use shadcn/ui patterns with `cn()` utility for className merging
- Client components must be marked with `"use client"` directive
- Product cards and lists follow consistent animation patterns using `cardVariants`

### Authentication Flow

- Middleware handles session updates across all routes
- `DatabaseContext` manages user state, profile, and artisan status
- Route protection handled via Supabase RLS policies

### Complete Development Workflow

#### After Database Setup - Essential Commands

```bash
# NEVER run npm run dev directly - use pnpm instead expect (pnpm dev)
pnpm build        # Production build with type checking
pnpm lint         # ESLint validation

# Database operations
supabase status   # Check connection
supabase db reset # Reset database (destructive)
```

#### Post-Setup Verification Checklist

1. **Database Connection**: Visit `/api/test-db` endpoint
2. **Authentication**: Test signup/login flow creates profile automatically
3. **RLS Policies**: Verify users can only access their own data
4. **Product Display**: Check `DynamicProductGrid` loads sample categories
5. **Artisan Flow**: Test artisan profile creation and product management

## Project-Specific Conventions

### File Organization

- **Database**: Separate client/server files prevent hydration issues
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

### Supabase Integration

- **Environment**: Requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Schema**: Database schema in `supabase-schema.sql` with setup instructions in `DATABASE_SETUP.md`
- **Types**: Auto-generated types in `database.types.ts` - regenerate after schema changes

### State Management Flow

```typescript
// Global user state flows through DatabaseContext
DatabaseContext → user/profile → components
ProductsContext → product data → ProductCard components
LanguageContext → translations → UI text
```

### Route Patterns

- **Public Routes**: `/`, `/products`, `/product/[id]`
- **Auth Routes**: `/login`, `/signup`, `/auth/confirm`
- **Artisan Routes**: `/artisan/*` - protected, use ArtisanLayout
- **Customer Routes**: `/cart`, `/checkout`, `/orders`

## Development Commands

**⚠️ IMPORTANT: NEVER use `npm run dev` - this project uses pnpm exclusively**

```bash
pnpm dev          # Start development server (localhost:3000)
pnpm build        # Production build with Next.js optimization
pnpm start        # Start production server
pnpm lint         # ESLint validation and auto-fix

# Database commands (requires Supabase CLI)
supabase status   # Check project connection
supabase db push  # Apply schema changes
supabase gen types typescript --project-id [ID] > src/lib/database.types.ts
```

## Complete Database Setup - Essential Commands to Run Project

### 1. Environment Setup

```bash
# Create .env.local with these required variables:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Database Schema Deployment

```bash
# Option A: Via Supabase Dashboard SQL Editor
# Copy entire supabase-schema.sql content and execute

# Option B: Via Supabase CLI
supabase db push
```

### 3. Post-Setup Verification

- Check all 9 tables exist in Supabase Dashboard
- Verify RLS is enabled on all tables
- Test authentication creates profile automatically
- Confirm sample categories are populated

### 4. Current RLS Policies Implementation

```sql
-- Users access own data only
profiles: Users can view/update own profile
cart_items: Users manage own cart
orders: Users see own orders

-- Artisans manage own content
products: Artisans CRUD own products, public reads active ones
artisan_profiles: Artisans update own profile, public reads active ones

-- Public access
categories: Public read access
reviews: Public read, users write own reviews
```

### 5. Essential Workflow After Database Setup

1. **Start Project**: `pnpm dev` (NOT npm run dev)
2. **Test Database**: Visit `/api/test-db` endpoint
3. **Auth Flow**: Test signup/login creates profile automatically
4. **Product Display**: Verify `DynamicProductGrid` loads sample categories
5. **Artisan Dashboard**: Test artisan profile creation and product management

## ⚠️ IMPORTANT: Supabase MCP Server Integration

### Using MCP Server Tools for Database Operations

When working with this project, **ALWAYS use the available Supabase MCP server tools** to interact with the database instead of writing manual SQL queries or trying to guess the schema structure.

#### Essential MCP Commands for Karigarverse

```bash
# 1. List all tables and their structure
mcp_supabase_list_tables

# 2. Execute queries on specific tables
mcp_supabase_execute_sql --query "SELECT * FROM profiles LIMIT 5"
mcp_supabase_execute_sql --query "SELECT * FROM products WHERE is_active = true"

# 3. Get project configuration details
mcp_supabase_get_project_url
mcp_supabase_get_anon_key

# 4. Apply database migrations
mcp_supabase_apply_migration --name "add_new_feature" --query "ALTER TABLE..."

# 5. Check for security advisors and performance issues
mcp_supabase_get_advisors --type "security"
mcp_supabase_get_advisors --type "performance"

# 6. List all database extensions
mcp_supabase_list_extensions

# 7. Generate TypeScript types
mcp_supabase_generate_typescript_types
```

#### Database Schema Discovery Workflow

**Before making any database changes**, use these MCP commands to understand the current state:

1. **Explore Tables**: `mcp_supabase_list_tables` - See all 9 tables and their relationships
2. **Check RLS Policies**: Look for existing policies on each table
3. **Examine Data**: Use `execute_sql` to see sample data and understand structure
4. **Security Check**: Run `get_advisors` to ensure no RLS policy gaps

#### Integration with Development Workflow

```typescript
// Instead of guessing table structure, use MCP to discover:
// mcp_supabase_execute_sql --query "DESCRIBE products"

// Then implement in code:
const products = await clientDb.getProducts({
  category: "pottery",
  is_active: true,
  limit: 10,
});
```

#### MCP Server Benefits for This Project

- **Schema Discovery**: Understand the 9-table structure without reading files
- **RLS Policy Verification**: Ensure security policies are correctly implemented
- **Live Data Inspection**: See actual data to understand relationships
- **Migration Safety**: Test changes before applying to production
- **Type Generation**: Keep TypeScript types in sync with database changes

**🚨 CRITICAL**: Always verify database changes using MCP tools before implementing code changes that depend on schema modifications.

## Key Files to Reference

- `src/app/clientLayout.tsx` - Root client wrapper with providers
- `src/contexts/DatabaseContext.tsx` - User authentication & profile state
- `src/lib/database-client.ts` vs `src/lib/database.ts` - Client/server data access
- `src/components/product-card.tsx` - Standard product display component
- `src/components/dynamic-product-grid.tsx` - Animated product grid with filtering
- `DATABASE_SETUP.md` - Supabase configuration instructions
- `supabase-schema.sql` - Complete database schema with RLS policies
