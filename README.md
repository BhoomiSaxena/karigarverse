# 🎨 Karigarverse - Artisan Marketplace

> _Connecting skilled artisans with customers worldwide through authentic handcrafted treasures_

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

## 🌟 Project Vision

**Karigarverse** addresses the critical gap between talented artisans and global customers by creating a comprehensive digital marketplace that:

- **Preserves Traditional Crafts**: Helps artisans digitize their businesses while maintaining cultural authenticity
- **Empowers Local Communities**: Provides economic opportunities for craftspeople in rural and urban areas
- **Connects Global Markets**: Bridges the gap between handmade excellence and modern e-commerce
- **Celebrates Heritage**: Showcases India's rich artisan traditions through a modern, accessible platform

### The Problem We Solve

1. **Artisan Challenges**: Limited digital presence, lack of direct customer access, dependency on middlemen
2. **Customer Pain Points**: Difficulty finding authentic handcrafted products, concerns about quality and authenticity
3. **Cultural Preservation**: Risk of traditional crafts being lost due to lack of commercial viability

## 🏗️ Architecture & How It Works

### Modern Tech Stack

```
Frontend: Next.js 15 (App Router) + TypeScript + Tailwind CSS
UI Framework: shadcn/ui with Radix UI primitives
Database: Supabase (PostgreSQL) with Row Level Security
Authentication: Supabase Auth with SSR support
State Management: React Context (Database, Language, Products)
Animations: Framer Motion with sophisticated transitions
Internationalization: react-i18next (English/Hindi)
```

### Core Architecture Patterns

#### 1. **Dual Database Architecture**

```typescript
// Server-side operations (SSR/API routes)
import { db } from "@/lib/database";
const products = await db.getProducts({ category: "pottery" });

// Client-side operations (Interactive components)
import { clientDb } from "@/lib/database-client";
const userProfile = await clientDb.getUserProfile(userId);
```

#### 2. **Context-Driven State Management**

```typescript
// Global state flow through three main contexts
DatabaseContext → User auth, profile, artisan status
LanguageContext → i18n translations, locale switching
ProductsContext → Product data, filtering, search
```

#### 3. **Animation-First Design System**

```typescript
// Consistent animation patterns across components
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  hover: { y: -5, scale: 1.03, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }
}

// Page transitions via AnimatePresence in clientLayout.tsx
<AnimatePresence mode="wait">
  <motion.div key={pathname} initial={{ opacity: 0, y: 15 }}>
    {children}
  </motion.div>
</AnimatePresence>
```

## 🗄️ Supabase Database Integration

### Complete Schema Architecture

The database consists of **9 interconnected tables** with comprehensive Row Level Security:

```sql
-- Core Tables Structure
profiles              (extends auth.users with user details)
├── artisan_profiles  (shop info, verification, location)
├── products         (catalog with images, pricing, inventory)
├── cart_items       (persistent shopping cart)
├── orders           (order management with status tracking)
├── order_items      (order line items with product details)
├── reviews          (product reviews and ratings)
├── categories       (hierarchical product categorization)
└── notifications    (user notification system)
```

### Row Level Security (RLS) Implementation

**Security-First Approach**: Every table implements granular access control

```sql
-- Users access their own data only
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

-- Artisans manage their own products
CREATE POLICY "Artisans can update their own products" ON products
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM artisan_profiles WHERE id = artisan_id AND user_id = auth.uid())
);

-- Public data is accessible to everyone
CREATE POLICY "Active products are viewable by everyone" ON products
FOR SELECT USING (is_active = true);
```

### Database Setup Workflow

#### 1. **Environment Configuration**

```bash
# Create .env.local with required Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 2. **Schema Deployment**

```bash
# Option A: Supabase Dashboard (Recommended)
# 1. Navigate to SQL Editor in your Supabase project
# 2. Copy complete supabase-schema.sql content
# 3. Execute to create all tables, policies, and sample data

# Option B: Supabase CLI
supabase db push
```

#### 3. **Post-Setup Verification**

- ✅ All 9 tables created with proper relationships
- ✅ RLS policies active on every table
- ✅ Authentication trigger creates user profiles automatically
- ✅ Sample categories and products populated
- ✅ Database connection working via test endpoint

#### 4. **Type Generation**

```bash
# Generate TypeScript types after schema changes
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts
```

## 🎯 Current Workflow & Development Process

### **Essential Commands to Run Project**

```bash
# ⚠️ IMPORTANT: This project uses pnpm exclusively - NEVER use npm run dev

# 1. Install dependencies
pnpm install

# 2. Start development server
pnpm dev           # Runs on http://localhost:3000

# 3. Production build
pnpm build         # Next.js optimization with type checking

# 4. Production server
pnpm start         # Serves production build

# 5. Code quality
pnpm lint          # ESLint validation and auto-fix
```

### **Database Development Commands**

```bash
# Check Supabase connection
supabase status

# Apply schema changes
supabase db push

# Reset database (destructive)
supabase db reset

# Generate fresh TypeScript types
supabase gen types typescript --project-id [YOUR_PROJECT_ID] > src/lib/database.types.ts
```

### **Development Verification Checklist**

After setup, verify these endpoints and features:

1. **Database Connection**: Visit `/api/test-db`
2. **Authentication Flow**: Test signup/login creates profile automatically
3. **Product Display**: Check homepage loads categories and products
4. **Artisan Dashboard**: Navigate to `/artisan/dashboard`
5. **Language Switching**: Toggle between English/Hindi
6. **Responsive Design**: Test mobile, tablet, desktop layouts

## 🎨 Website Design & User Experience

### **Visual Design System**

**Bold Neomorphic Aesthetic**:

- Heavy black borders (`border-2 border-black`) for distinctive card designs
- **Kalam Google Font** as primary typeface for warm, artisan feel
- Gradient backgrounds (`from-orange-50 to-yellow-50`) for visual depth
- CSS custom properties integrated with shadcn/ui color system

### **Animation Philosophy**

**Sophisticated Motion Design**:

- **Page Transitions**: Smooth fade-in/out with slight vertical movement (15px)
- **Card Interactions**: Hover states with scale (1.03) and elevation shadow
- **Staggered Animations**: Container children animate with 0.1s delays
- **Loading States**: Skeleton components with pulse animation
- **Button Feedback**: Icon transitions and state changes with AnimatePresence

### **User Interface Patterns**

#### **Homepage Experience**

- **Hero Carousel**: Showcasing artisan categories with auto-play
- **Category Slider**: Horizontal scroll with animated category cards
- **Product Grids**: Staggered animation reveals with filtering
- **Dual Language**: Seamless English/Hindi switching

#### **Artisan Dashboard**

- **Welcome Guide**: Progressive onboarding for new artisans
- **Statistics Cards**: Real-time metrics with animated counters
- **Product Management**: Drag-and-drop image uploads, voice input
- **Order Tracking**: Status updates with visual indicators

#### **Customer Journey**

- **Product Discovery**: Advanced filtering, search, category browsing
- **Product Details**: Image galleries, artisan stories, reviews
- **Shopping Cart**: Persistent cart with quantity management
- **Checkout Flow**: Multi-step process with address, payment

### **Responsive Design Strategy**

**Mobile-First Approach**:

- **Sidebar Patterns**: Collapsible navigation for artisan dashboard
- **Touch Interactions**: Optimized button sizes, swipe gestures
- **Progressive Enhancement**: Desktop features build upon mobile foundation
- **Performance Focus**: Lazy loading, optimized images, minimal bundle

## 🌍 Internationalization Support

**Bilingual Platform** (English/Hindi):

- Translation files: `public/locales/{lang}/common.json`
- Hook usage: `const { t } = useLanguage()`
- Cultural context preservation in translations
- RTL support planned for future expansion

## 🚀 Getting Started

### **Prerequisites**

- Node.js 18+
- pnpm package manager
- Supabase account and project
- Git for version control

### **Quick Setup**

1. **Clone Repository**

```bash
git clone https://github.com/BhoomiSaxena/karigarverse.git
cd karigarverse
```

2. **Install Dependencies**

```bash
pnpm install
```

3. **Environment Setup**

```bash
# Create .env.local with your Supabase credentials
cp .env.example .env.local
# Edit .env.local with your actual Supabase URL and keys
```

4. **Database Setup**

```bash
# Follow instructions in DATABASE_SETUP.md
# Execute supabase-schema.sql in your Supabase project
```

5. **Start Development**

```bash
pnpm dev
```

Visit `http://localhost:3000` to see Karigarverse in action!

## 📁 Project Structure

```
karigarverse/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── clientLayout.tsx    # Root client wrapper with providers
│   │   ├── artisan/           # Artisan dashboard routes
│   │   └── product/           # Product detail pages
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── product-card.tsx   # Product display component
│   │   └── dynamic-product-grid.tsx # Animated product grid
│   ├── contexts/             # React Context providers
│   │   ├── DatabaseContext.tsx # User auth & profile state
│   │   ├── LanguageContext.tsx # i18n translations
│   │   └── ProductsContext.tsx # Product data management
│   ├── lib/                  # Core utilities and services
│   │   ├── database.ts       # Server-side database operations
│   │   ├── database-client.ts # Client-side database operations
│   │   ├── database.types.ts  # Generated Supabase types
│   │   └── utils.ts          # Utility functions
│   └── styles/               # Global CSS and Tailwind config
├── public/
│   ├── locales/              # Translation files (en/hi)
│   └── images/               # Static assets and product images
├── supabase-schema.sql       # Complete database schema
├── DATABASE_SETUP.md         # Supabase setup instructions
└── .github/
    └── copilot-instructions.md # AI coding agent guidelines
```

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines and code of conduct.

### **Development Workflow**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow existing code patterns and animation standards
4. Test with both English and Hindi language settings
5. Ensure all database operations use appropriate client/server patterns
6. Submit pull request with detailed description

### **Code Standards**

- TypeScript strict mode enabled
- ESLint + Prettier for code formatting
- Consistent animation patterns using Framer Motion
- shadcn/ui components for UI consistency
- Proper error handling and loading states

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for artisans worldwide**

_Karigarverse - Where tradition meets technology_
