#!/usr/bin/env tsx

/**
 * Local PostgreSQL Database Setup Script
 * This script creates the database and applies the schema
 */

import { Pool } from "pg";
import { readFileSync } from "fs";
import { join } from "path";

// Database connection for initial setup (connects to postgres database)
const setupPool = new Pool({
  user: process.env.POSTGRES_USER || "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  database: "postgres", // Connect to default postgres database first
  password: process.env.POSTGRES_PASSWORD || "",
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
});

// Database name
const DATABASE_NAME = process.env.POSTGRES_DB || "karigarverse";

async function setupDatabase() {
  console.log("🚀 Setting up local PostgreSQL database for Karigarverse...\n");

  try {
    // Step 1: Create database if it doesn't exist
    console.log("1. 📝 Creating database...");

    try {
      await setupPool.query(`CREATE DATABASE ${DATABASE_NAME}`);
      console.log(`✅ Database '${DATABASE_NAME}' created successfully`);
    } catch (error: any) {
      if (error.code === "42P04") {
        console.log(`✅ Database '${DATABASE_NAME}' already exists`);
      } else {
        throw error;
      }
    }

    // Step 2: Connect to the new database and apply schema
    console.log("\n2. 🔧 Applying database schema...");

    const appPool = new Pool({
      user: process.env.POSTGRES_USER || "postgres",
      host: process.env.POSTGRES_HOST || "localhost",
      database: DATABASE_NAME,
      password: process.env.POSTGRES_PASSWORD || "",
      port: parseInt(process.env.POSTGRES_PORT || "5432"),
    });

    // Read and modify the schema file
    const schemaPath = join(process.cwd(), "supabase-schema.sql");
    let schemaSQL = readFileSync(schemaPath, "utf8");

    // Remove Supabase-specific parts and adapt for PostgreSQL
    schemaSQL = schemaSQL
      // Remove Supabase JWT secret setting
      .replace(/ALTER DATABASE postgres SET "app\.jwt_secret"[^;]*;/g, "")
      // Remove auth.users references and replace with a local users table
      .replace(/REFERENCES auth\.users\(id\)/g, "REFERENCES users(id)")
      // Remove timezone function calls that might not work in standard PostgreSQL
      .replace(/TIMEZONE\('utc'::text, NOW\(\)\)/g, "NOW()")
      // Add UUID extension at the beginning
      .replace(
        /CREATE EXTENSION IF NOT EXISTS "uuid-ossp";/,
        `
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        CREATE EXTENSION IF NOT EXISTS "pgcrypto";
        
        -- Create users table to replace auth.users
        CREATE TABLE IF NOT EXISTS public.users (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          email_verified BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
        
        CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
      `
      );

    // Execute the schema
    await appPool.query(schemaSQL);
    console.log("✅ Database schema applied successfully");

    // Step 3: Insert sample categories
    console.log("\n3. 📂 Inserting sample categories...");

    const categoriesData = [
      {
        name: "Pottery & Ceramics",
        slug: "pottery",
        description: "Handcrafted pottery and ceramic items",
        sort_order: 1,
      },
      {
        name: "Textiles & Fabrics",
        slug: "textiles",
        description: "Traditional fabrics and textile products",
        sort_order: 2,
      },
      {
        name: "Jewelry & Accessories",
        slug: "jewelry",
        description: "Handmade jewelry and fashion accessories",
        sort_order: 3,
      },
      {
        name: "Woodwork & Furniture",
        slug: "woodwork",
        description: "Wooden crafts and furniture pieces",
        sort_order: 4,
      },
      {
        name: "Metalwork",
        slug: "metalwork",
        description: "Metal crafts and decorative items",
        sort_order: 5,
      },
      {
        name: "Paintings & Art",
        slug: "paintings",
        description: "Traditional and contemporary artwork",
        sort_order: 6,
      },
    ];

    for (const category of categoriesData) {
      try {
        await appPool.query(
          "INSERT INTO categories (name, slug, description, sort_order) VALUES ($1, $2, $3, $4) ON CONFLICT (slug) DO NOTHING",
          [
            category.name,
            category.slug,
            category.description,
            category.sort_order,
          ]
        );
        console.log(`   ✅ Added category: ${category.name}`);
      } catch (error) {
        console.log(
          `   ⚠️ Category ${category.name} already exists or error occurred`
        );
      }
    }

    // Step 4: Create authentication functions
    console.log("\n4. 🔐 Creating authentication functions...");

    const authFunctions = `
      -- Function to hash passwords
      CREATE OR REPLACE FUNCTION hash_password(password TEXT)
      RETURNS TEXT AS $$
      BEGIN
        RETURN crypt(password, gen_salt('bf'));
      END;
      $$ LANGUAGE plpgsql;

      -- Function to verify passwords
      CREATE OR REPLACE FUNCTION verify_password(password TEXT, hash TEXT)
      RETURNS BOOLEAN AS $$
      BEGIN
        RETURN hash = crypt(password, hash);
      END;
      $$ LANGUAGE plpgsql;

      -- Function to handle updated_at timestamps
      CREATE OR REPLACE FUNCTION handle_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- Create triggers for updated_at
      CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
        FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
      
      CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
        
      CREATE TRIGGER artisan_profiles_updated_at BEFORE UPDATE ON artisan_profiles
        FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
        
      CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
        FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
        
      CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
        FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
    `;

    await appPool.query(authFunctions);
    console.log("✅ Authentication functions created");

    await appPool.end();
    console.log("\n🎉 Database setup completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Database: ${DATABASE_NAME} ✅`);
    console.log("   - Schema: Applied ✅");
    console.log("   - Sample data: Categories inserted ✅");
    console.log("   - Auth functions: Created ✅");
    console.log("\n💡 Next steps:");
    console.log(
      "   1. Update your .env.local with PostgreSQL connection details"
    );
    console.log("   2. Test the database connection");
    console.log("   3. Update your application code to use PostgreSQL");
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    process.exit(1);
  } finally {
    await setupPool.end();
  }
}

// Run the setup
setupDatabase();
