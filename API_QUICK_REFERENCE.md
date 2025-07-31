# Quick Reference: API Routes Patterns

This is a quick reference for the most common API route patterns in Karigarverse. For complete details, see [API_ROUTES_FRAMEWORK.md](./API_ROUTES_FRAMEWORK.md).

## Essential Imports

```typescript
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/postgres-config";
import { handleError, withAuth, AuthenticatedRequest } from "@/lib/api-middleware";
```

## Dynamic Route Parameters (Next.js 15)

```typescript
// ✅ Always await params in Next.js 15
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // Must await!
  // Use id...
}
```

## Basic CRUD Patterns

### GET (Public)

```typescript
export async function GET(request: NextRequest) {
  try {
    const result = await query("SELECT * FROM table_name");
    return NextResponse.json({ data: result.rows });
  } catch (error) {
    return handleError(error);
  }
}
```

### GET (Protected)

```typescript
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const userId = request.user!.id;
    const result = await query("SELECT * FROM table_name WHERE user_id = $1", [userId]);
    return NextResponse.json({ data: result.rows });
  } catch (error) {
    return handleError(error);
  }
});
```

### POST (Create)

```typescript
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const { name, description } = await request.json();
    const userId = request.user!.id;
    
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    
    const result = await query(
      "INSERT INTO table_name (user_id, name, description) VALUES ($1, $2, $3) RETURNING *",
      [userId, name, description]
    );
    
    return NextResponse.json({ data: result.rows[0] }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
});
```

### PUT (Update)

```typescript
export const PUT = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const updates = await request.json();
    const userId = request.user!.id;
    
    // Filter valid fields
    const validFields = ["name", "description", "status"];
    const filteredUpdates = Object.keys(updates)
      .filter(key => validFields.includes(key))
      .reduce((obj, key) => ({ ...obj, [key]: updates[key] }), {});
    
    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }
    
    // Dynamic update query
    const setClause = Object.keys(filteredUpdates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ");
    
    const result = await query(
      `UPDATE table_name SET ${setClause}, updated_at = NOW() WHERE user_id = $1 RETURNING *`,
      [userId, ...Object.values(filteredUpdates)]
    );
    
    return NextResponse.json({ data: result.rows[0] });
  } catch (error) {
    return handleError(error);
  }
});
```

### DELETE

```typescript
export const DELETE = withAuth(async (
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const userId = request.user!.id;
    
    // Verify ownership
    const check = await query("SELECT id FROM table_name WHERE id = $1 AND user_id = $2", [id, userId]);
    if (check.rows.length === 0) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }
    
    await query("DELETE FROM table_name WHERE id = $1", [id]);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleError(error);
  }
});
```

## Field Filtering Pattern

```typescript
// Always filter input fields to prevent injection
const validFields = ["field1", "field2", "field3"];
const readOnlyFields = ["id", "user_id", "created_at", "updated_at"];

const filteredUpdates = Object.keys(updates)
  .filter(key => validFields.includes(key))
  .reduce((obj, key) => ({ ...obj, [key]: updates[key] }), {});

// Handle field mapping if needed
if (updates.contact_email) {
  filteredUpdates.email = updates.contact_email;
}
```

## Query with Filters

```typescript
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    let queryText = "SELECT * FROM products WHERE 1=1";
    const params: any[] = [];
    
    const category = searchParams.get("category");
    if (category) {
      params.push(category);
      queryText += ` AND category = $${params.length}`;
    }
    
    const isActive = searchParams.get("is_active");
    if (isActive === "true") {
      queryText += " AND is_active = true";
    }
    
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    
    params.push(limit, offset);
    queryText += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;
    
    const result = await query(queryText, params);
    return NextResponse.json({ data: result.rows });
  } catch (error) {
    return handleError(error);
  }
}
```

## Common Error Patterns

```typescript
// Required field validation
if (!name || !email) {
  return NextResponse.json(
    { error: "Name and email are required" },
    { status: 400 }
  );
}

// Resource not found
if (result.rows.length === 0) {
  return NextResponse.json(
    { error: "Resource not found" },
    { status: 404 }
  );
}

// Ownership verification
const ownerCheck = await query("SELECT id FROM table WHERE id = $1 AND user_id = $2", [id, userId]);
if (ownerCheck.rows.length === 0) {
  return NextResponse.json(
    { error: "Not found or unauthorized" },
    { status: 404 }
  );
}
```

## Database Fields Reference

### Artisan Profiles

Valid fields: `shop_name`, `description`, `specialties`, `location`, `business_license`, `phone`, `email`, `website`, `social_media`, `business_hours`, `portfolio_images`, `certificates`, `awards`, `delivery_info`, `payment_methods`, `return_policy`, `shipping_policy`, `preferred_language`, `notification_preferences`, `established_year`, `experience_years`

Read-only: `id`, `user_id`, `created_at`, `updated_at`, `commission_rate`, `total_sales`, `total_orders`, `rating`, `review_count`, `verification_status`

### Products

Valid fields: `name`, `description`, `price`, `category`, `stock_quantity`, `images`, `is_active`, `is_featured`, `weight`, `dimensions`, `materials`, `care_instructions`, `customization_available`, `min_order_quantity`, `processing_time`, `tags`

Read-only: `id`, `artisan_id`, `created_at`, `updated_at`, `views_count`, `sales_count`

## Testing Commands

```bash
# Test GET
curl "http://localhost:3000/api/db/products?limit=5"

# Test POST with auth
curl -X POST "http://localhost:3000/api/db/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name": "Test", "price": 100}'

# Test PUT with auth
curl -X PUT "http://localhost:3000/api/db/products/id" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name": "Updated Name"}'
```
