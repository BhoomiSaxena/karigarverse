# Karigarverse API Routes Framework

This document outlines the comprehensive framework for implementing API routes in the Karigarverse Next.js 15 application with PostgreSQL backend. Follow these patterns to ensure consistency and avoid common errors.

## Table of Contents

1. [Core Architecture](#core-architecture)
2. [Database Connection Pattern](#database-connection-pattern)
3. [Authentication Middleware](#authentication-middleware)
4. [Dynamic Route Parameters (Next.js 15)](#dynamic-route-parameters-nextjs-15)
5. [CRUD Operations Framework](#crud-operations-framework)
6. [Error Handling](#error-handling)
7. [Field Validation & Filtering](#field-validation--filtering)
8. [API Route Examples](#api-route-examples)
9. [Common Pitfalls](#common-pitfalls)

## Core Architecture

### Technology Stack

- **Next.js 15** (App Router with Turbopack)
- **PostgreSQL** (Local database)
- **Custom JWT Authentication** (No Supabase)
- **TypeScript** with strict type checking

### Database Setup

- Local PostgreSQL instance
- Schema defined in `local-postgres-migration-fixed.sql`
- Connection managed via `postgres-config.ts`
- No ORM - Raw SQL queries with parameterized statements

## Database Connection Pattern

### Connection Configuration (`src/lib/postgres-config.ts`)

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'karigarverse',
  user: process.env.POSTGRES_USER || 'proximus',
  password: process.env.POSTGRES_PASSWORD || '',
});

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}
```

### Usage in API Routes

```typescript
import { query } from "@/lib/postgres-config";

// Always use parameterized queries
const result = await query(
  "SELECT * FROM table_name WHERE id = $1",
  [id]
);
```

## Authentication Middleware

### Implementation (`src/lib/api-middleware.ts`)

```typescript
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends NextRequest {
  user?: { id: string; email: string };
}

export function withAuth(handler: Function) {
  return async (request: AuthenticatedRequest, context?: any) => {
    try {
      const authHeader = request.headers.get('authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      request.user = decoded;
      return handler(request, context);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  };
}
```

### Usage

```typescript
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  const userId = request.user!.id;
  // Protected route logic
});
```

## Dynamic Route Parameters (Next.js 15)

### Critical Change in Next.js 15

In Next.js 15, route parameters must be awaited before accessing their properties.

### ❌ Wrong (Pre-Next.js 15)

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const product = await db.getProduct(params.id); // Error!
}
```

### ✅ Correct (Next.js 15)

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // Must await params
  const product = await db.getProduct(id);
}
```

### Multiple Parameters

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; productId: string }> }
) {
  const { userId, productId } = await params;
  // Use destructured parameters
}
```

## CRUD Operations Framework

### 1. GET Operations (Read)

#### Simple GET

```typescript
export async function GET(request: NextRequest) {
  try {
    const result = await query("SELECT * FROM table_name ORDER BY created_at DESC");
    return NextResponse.json({ data: result.rows });
  } catch (error) {
    return handleError(error);
  }
}
```

#### GET with Query Parameters

```typescript
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const limit = searchParams.get("limit") 
      ? parseInt(searchParams.get("limit")!) 
      : 10;
    const offset = searchParams.get("offset") 
      ? parseInt(searchParams.get("offset")!) 
      : 0;
    const category = searchParams.get("category");
    
    let queryText = "SELECT * FROM products WHERE 1=1";
    const params: any[] = [];
    
    if (category) {
      params.push(category);
      queryText += ` AND category = $${params.length}`;
    }
    
    params.push(limit, offset);
    queryText += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;
    
    const result = await query(queryText, params);
    return NextResponse.json({ data: result.rows });
  } catch (error) {
    return handleError(error);
  }
}
```

#### GET with Dynamic Parameters

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const result = await query("SELECT * FROM products WHERE id = $1", [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    return NextResponse.json({ data: result.rows[0] });
  } catch (error) {
    return handleError(error);
  }
}
```

### 2. POST Operations (Create)

```typescript
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const { shop_name, description, location } = await request.json();
    const userId = request.user!.id;
    
    // Validate required fields
    if (!shop_name) {
      return NextResponse.json(
        { error: "Shop name is required" },
        { status: 400 }
      );
    }
    
    const result = await query(
      `INSERT INTO artisan_profiles (user_id, shop_name, description, location, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *`,
      [userId, shop_name, description, location]
    );
    
    return NextResponse.json({ data: result.rows[0] }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
});
```

### 3. PUT Operations (Update)

```typescript
export const PUT = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const updates = await request.json();
    const userId = request.user!.id;
    
    // Define valid fields that can be updated
    const validFields = [
      "shop_name",
      "description",
      "location",
      "phone",
      "email",
      "website"
    ];
    
    // Filter updates to only include valid fields
    const filteredUpdates = Object.keys(updates)
      .filter((key) => validFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {} as any);
    
    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }
    
    // Build dynamic update query
    const setClause = Object.keys(filteredUpdates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ");
    
    const values = Object.values(filteredUpdates);
    
    const result = await query(
      `UPDATE artisan_profiles SET ${setClause}, updated_at = NOW() 
       WHERE user_id = $1 RETURNING *`,
      [userId, ...values]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ data: result.rows[0] });
  } catch (error) {
    return handleError(error);
  }
});
```

### 4. DELETE Operations

```typescript
export const DELETE = withAuth(async (
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const userId = request.user!.id;
    
    // Verify ownership before deletion
    const ownershipCheck = await query(
      "SELECT id FROM products WHERE id = $1 AND artisan_id = $2",
      [id, userId]
    );
    
    if (ownershipCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Product not found or unauthorized" },
        { status: 404 }
      );
    }
    
    await query("DELETE FROM products WHERE id = $1", [id]);
    
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleError(error);
  }
});
```

## Error Handling

### Error Handler Implementation (`src/lib/api-middleware.ts`)

```typescript
export function handleError(error: any) {
  console.error("API Error:", error);
  
  // Database constraint violations
  if (error.code === '23505') {
    return NextResponse.json(
      { error: "Resource already exists" },
      { status: 409 }
    );
  }
  
  // Foreign key violations
  if (error.code === '23503') {
    return NextResponse.json(
      { error: "Referenced resource not found" },
      { status: 400 }
    );
  }
  
  // Column does not exist
  if (error.code === '42703') {
    return NextResponse.json(
      { error: "Invalid field in request" },
      { status: 400 }
    );
  }
  
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
```

### Usage in Routes

```typescript
export async function GET(request: NextRequest) {
  try {
    // Route logic
  } catch (error) {
    return handleError(error);
  }
}
```

## Field Validation & Filtering

### Define Valid Fields

Always define which fields can be updated to prevent injection attacks:

```typescript
const validFields = [
  "shop_name",
  "description", 
  "location",
  "phone",
  "email"
];

// Never allow these fields to be updated
const readOnlyFields = [
  "id",
  "user_id", 
  "created_at",
  "updated_at"
];
```

### Filter Input Data

```typescript
const filteredUpdates = Object.keys(updates)
  .filter((key) => validFields.includes(key))
  .reduce((obj, key) => {
    obj[key] = updates[key];
    return obj;
  }, {} as any);
```

### Handle Field Mapping

```typescript
// Handle backwards compatibility or field aliases
if (updates.contact_email) {
  filteredUpdates.email = updates.contact_email;
}
if (updates.contact_phone) {
  filteredUpdates.phone = updates.contact_phone;
}
```

## API Route Examples

### Complete Resource Route (`/api/db/products/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/postgres-config";
import { handleError, withAuth } from "@/lib/api-middleware";

// GET /api/db/products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters = {
      category: searchParams.get("category") || undefined,
      is_active: searchParams.get("is_active") === "true",
      limit: parseInt(searchParams.get("limit") || "10"),
      offset: parseInt(searchParams.get("offset") || "0")
    };
    
    let queryText = `
      SELECT p.*, ap.shop_name as artisan_shop_name 
      FROM products p 
      LEFT JOIN artisan_profiles ap ON p.artisan_id = ap.user_id 
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (filters.category) {
      params.push(filters.category);
      queryText += ` AND p.category = $${params.length}`;
    }
    
    if (filters.is_active) {
      queryText += ` AND p.is_active = true`;
    }
    
    params.push(filters.limit, filters.offset);
    queryText += ` ORDER BY p.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;
    
    const result = await query(queryText, params);
    return NextResponse.json({ data: result.rows });
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/db/products
export const POST = withAuth(async (request) => {
  try {
    const { name, description, price, category, stock_quantity } = await request.json();
    const artisanId = request.user!.id;
    
    if (!name || !price || !category) {
      return NextResponse.json(
        { error: "Name, price, and category are required" },
        { status: 400 }
      );
    }
    
    const result = await query(
      `INSERT INTO products (name, description, price, category, stock_quantity, artisan_id, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING *`,
      [name, description, price, category, stock_quantity || 0, artisanId]
    );
    
    return NextResponse.json({ data: result.rows[0] }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
});
```

### Dynamic Route (`/api/db/products/[id]/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/postgres-config";
import { handleError, withAuth } from "@/lib/api-middleware";

// GET /api/db/products/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const result = await query(
      `SELECT p.*, ap.shop_name as artisan_shop_name 
       FROM products p 
       LEFT JOIN artisan_profiles ap ON p.artisan_id = ap.user_id 
       WHERE p.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    return NextResponse.json({ data: result.rows[0] });
  } catch (error) {
    return handleError(error);
  }
}

// PUT /api/db/products/[id]
export const PUT = withAuth(async (
  request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const updates = await request.json();
    const userId = request.user!.id;
    
    // Verify ownership
    const ownershipCheck = await query(
      "SELECT id FROM products WHERE id = $1 AND artisan_id = $2",
      [id, userId]
    );
    
    if (ownershipCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Product not found or unauthorized" },
        { status: 404 }
      );
    }
    
    const validFields = ["name", "description", "price", "stock_quantity", "is_active"];
    const filteredUpdates = Object.keys(updates)
      .filter(key => validFields.includes(key))
      .reduce((obj, key) => ({ ...obj, [key]: updates[key] }), {});
    
    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }
    
    const setClause = Object.keys(filteredUpdates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ");
    
    const result = await query(
      `UPDATE products SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...Object.values(filteredUpdates)]
    );
    
    return NextResponse.json({ data: result.rows[0] });
  } catch (error) {
    return handleError(error);
  }
});
```

## Common Pitfalls

### ❌ Common Mistakes

1. **Not awaiting params in Next.js 15**

   ```typescript
   // Wrong
   const product = await db.getProduct(params.id);
   
   // Correct
   const { id } = await params;
   const product = await db.getProduct(id);
   ```

2. **SQL Injection vulnerabilities**

   ```typescript
   // Wrong
   const result = await query(`SELECT * FROM users WHERE email = '${email}'`);
   
   // Correct
   const result = await query("SELECT * FROM users WHERE email = $1", [email]);
   ```

3. **Not filtering update fields**

   ```typescript
   // Wrong - allows any field to be updated
   const result = await query(`UPDATE users SET ${Object.keys(updates).map(k => `${k} = ?`).join(', ')}`);
   
   // Correct - filter valid fields
   const validFields = ["name", "email"];
   const filteredUpdates = Object.keys(updates)
     .filter(key => validFields.includes(key))
     .reduce((obj, key) => ({ ...obj, [key]: updates[key] }), {});
   ```

4. **Missing error handling**

   ```typescript
   // Wrong
   export async function GET() {
     const result = await query("SELECT * FROM products");
     return NextResponse.json({ data: result.rows });
   }
   
   // Correct
   export async function GET() {
     try {
       const result = await query("SELECT * FROM products");
       return NextResponse.json({ data: result.rows });
     } catch (error) {
       return handleError(error);
     }
   }
   ```

5. **Not validating required fields**

   ```typescript
   // Wrong
   const { name, email } = await request.json();
   
   // Correct
   const { name, email } = await request.json();
   if (!name || !email) {
     return NextResponse.json(
       { error: "Name and email are required" },
       { status: 400 }
     );
   }
   ```

### ✅ Best Practices

1. **Always use parameterized queries**
2. **Filter and validate all input data**
3. **Implement proper error handling**
4. **Use authentication middleware for protected routes**
5. **Follow consistent response formats**
6. **Handle database constraint violations gracefully**
7. **Verify ownership before allowing updates/deletes**
8. **Use TypeScript for better type safety**

## Environment Variables

Required environment variables for the PostgreSQL connection:

```bash
# .env.local
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=karigarverse
POSTGRES_USER=proximus
POSTGRES_PASSWORD=

# JWT Secret for authentication
JWT_SECRET=your_32_character_random_string
```

## Testing

Test your API routes using:

```bash
# GET request
curl -X GET "http://localhost:3000/api/db/products?limit=5&category=pottery"

# POST request with authentication
curl -X POST "http://localhost:3000/api/db/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name": "Test Product", "price": 100, "category": "pottery"}'

# PUT request
curl -X PUT "http://localhost:3000/api/db/products/product-id" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name": "Updated Product Name"}'
```

This framework ensures consistency, security, and maintainability across all API routes in the Karigarverse application. Follow these patterns for all new API implementations.
