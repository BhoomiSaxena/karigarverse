# Supabase Database Setup Instructions

## Prerequisites
1. Your Supabase project is already created and configured
2. Environment variables are set in `.env.local`

## Step 1: Set up the Database Schema

### Option A: Using Supabase Dashboard (Recommended)
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `pwbegatqguevtcjhvhue`
3. Navigate to the **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the entire contents of `supabase-schema.sql` into the editor
6. Click **Run** to execute the schema

### Option B: Using Supabase CLI
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref pwbegatqguevtcjhvhue

# Run the schema
supabase db push
```

## Step 2: Verify Database Setup

After running the schema, verify these tables were created:

### Core Tables:
- ✅ `profiles` - User profile information
- ✅ `categories` - Product categories
- ✅ `artisan_profiles` - Artisan shop information
- ✅ `products` - Product catalog
- ✅ `cart_items` - Shopping cart items
- ✅ `orders` - Customer orders
- ✅ `order_items` - Individual order line items
- ✅ `reviews` - Product reviews and ratings
- ✅ `notifications` - User notifications

### Views:
- ✅ `product_details` - Enhanced product information with aggregated data
- ✅ `order_details` - Enhanced order information with customer details

### Functions and Triggers:
- ✅ `handle_new_user()` - Automatically creates profile when user signs up
- ✅ `handle_updated_at()` - Updates timestamp fields automatically
- ✅ Row Level Security (RLS) policies for data protection

## Step 3: Test the Database

### 3.1 Test User Registration
1. Go to your app's signup page
2. Create a new account
3. Check the `profiles` table in Supabase dashboard
4. Verify a profile was automatically created

### 3.2 Test Authentication
1. Sign up and sign in with your test account
2. Check that the header shows your user information
3. Verify you can access protected routes

### 3.3 Test Database Operations
```typescript
// Test in your app or in the Supabase dashboard
import { db } from '@/lib/database'

// Create an artisan profile
const artisanProfile = await db.createArtisanProfile({
  user_id: 'your-user-id',
  shop_name: 'Test Artisan Shop',
  description: 'A test artisan shop',
  specialties: ['pottery', 'ceramics'],
  location: 'Test City'
})

// Create a product
const product = await db.createProduct({
  artisan_id: artisanProfile.id,
  category_id: 'pottery-category-id',
  name: 'Test Ceramic Vase',
  description: 'A beautiful handcrafted ceramic vase',
  price: 2500.00,
  images: ['https://example.com/vase.jpg'],
  stock_quantity: 10
})
```

## Step 4: Configure Row Level Security

The schema includes comprehensive RLS policies, but you can customize them:

### Key Security Features:
- Users can only access their own data
- Public data (products, categories) is accessible to everyone
- Artisans can only manage their own products and orders
- Customers can only view their own orders and cart items

### To modify RLS policies:
1. Go to Authentication → Policies in Supabase Dashboard
2. Select the table you want to modify
3. Edit or add new policies as needed

## Step 5: Populate Initial Data

### Add Categories (if not already done):
```sql
INSERT INTO public.categories (name, slug, description, sort_order) VALUES
('Pottery', 'pottery', 'Handcrafted pottery and ceramics', 1),
('Textiles', 'textiles', 'Traditional and modern textile crafts', 2),
('Woodwork', 'woodwork', 'Beautiful wooden crafts and furniture', 3),
('Jewelry', 'jewelry', 'Handmade jewelry and accessories', 4),
('Painting', 'painting', 'Original paintings and artwork', 5);
```

## Step 6: Enable Realtime (Optional)

For real-time features like notifications:

1. Go to Database → Replication in Supabase Dashboard
2. Enable replication for tables that need real-time updates:
   - `notifications`
   - `orders`
   - `order_items`
   - `cart_items`

## Step 7: Set up Email Templates

For authentication emails:

1. Go to Authentication → Email Templates
2. Update the confirmation email template to:
   ```
   Confirm your signup for KarigarVerse
   
   Click this link to confirm your account: {{ .ConfirmationURL }}
   ```

## Troubleshooting

### Common Issues:

1. **Permission Denied Errors**
   - Check RLS policies are correctly configured
   - Ensure user is authenticated when accessing protected data

2. **Foreign Key Constraint Errors**
   - Verify referenced records exist before creating dependent records
   - Check that category and artisan IDs are valid when creating products

3. **Auth Trigger Not Working**
   - Verify the `handle_new_user()` function is created
   - Check the trigger is properly attached to `auth.users`

### Useful SQL Queries for Testing:

```sql
-- Check if profile was created for user
SELECT * FROM auth.users;
SELECT * FROM public.profiles;

-- View product details with aggregated data
SELECT * FROM public.product_details;

-- Check RLS policies
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

## Next Steps

1. ✅ Database schema is now set up
2. ✅ Authentication is integrated
3. ✅ Database operations are ready to use
4. 🔄 Test all functionality
5. 🔄 Add sample data for development
6. 🔄 Deploy and test in production

Your Supabase integration is now complete! You can start using the database operations in your components and pages.
