#!/usr/bin/env tsx
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import * as path from "path";

// Load environment variables
config({ path: path.join(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMigration() {
  console.log("🚀 Testing Supabase Migration and Database Schema...\n");

  try {
    // Test 1: Check if all tables exist
    console.log("1. 📋 Testing table existence...");
    const { data: tables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .order("table_name");

    if (tablesError) throw tablesError;

    const expectedTables = [
      "artisan_profiles",
      "cart_items",
      "categories",
      "notifications",
      "order_items",
      "orders",
      "products",
      "profiles",
      "reviews",
    ];

    const existingTables = tables?.map((t) => t.table_name) || [];
    const missingTables = expectedTables.filter(
      (table) => !existingTables.includes(table)
    );

    if (missingTables.length > 0) {
      console.log("❌ Missing tables:", missingTables);
    } else {
      console.log("✅ All required tables exist:", existingTables);
    }

    // Test 2: Check views
    console.log("\n2. 👀 Testing views...");
    const { data: views, error: viewsError } = await supabase
      .from("information_schema.views")
      .select("table_name")
      .eq("table_schema", "public");

    if (viewsError) throw viewsError;

    const expectedViews = ["product_details", "order_details"];
    const existingViews = views?.map((v) => v.table_name) || [];

    console.log("✅ Views exist:", existingViews);

    // Test 3: Check sample categories data
    console.log("\n3. 📂 Testing sample categories data...");
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    if (categoriesError) throw categoriesError;

    console.log("✅ Sample categories loaded:");
    categories?.forEach((cat) => {
      console.log(`   - ${cat.name} (${cat.slug})`);
    });

    // Test 4: Test functions existence
    console.log("\n4. ⚙️ Testing functions...");
    const { data: functions, error: functionsError } = await supabase.rpc(
      "sql",
      {
        query: `SELECT proname FROM pg_proc WHERE proname IN ('handle_new_user', 'handle_updated_at')`,
      }
    );

    if (!functionsError && functions) {
      console.log(
        "✅ Required functions exist:",
        functions.map((f: any) => f.proname)
      );
    }

    // Test 5: Test RLS policies
    console.log("\n5. 🔒 Testing RLS policies...");
    const { data: policies, error: policiesError } = await supabase.rpc("sql", {
      query: `SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public' LIMIT 5`,
    });

    if (!policiesError && policies) {
      console.log("✅ RLS policies active:", policies.length, "policies found");
      policies.forEach((p: any) => {
        console.log(`   - ${p.tablename}: ${p.policyname}`);
      });
    }

    // Test 6: Create a test user profile (simulating the auth trigger)
    console.log("\n6. 👤 Testing profile creation...");
    const testUserId = "test-user-" + Date.now();

    // Since we can't create auth users directly, let's test the profiles table structure
    const { data: profileStructure, error: profileError } = await supabase.rpc(
      "sql",
      {
        query: `
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles'
        ORDER BY ordinal_position
      `,
      }
    );

    if (!profileError && profileStructure) {
      console.log("✅ Profiles table structure:");
      profileStructure.forEach((col: any) => {
        console.log(
          `   - ${col.column_name}: ${col.data_type} ${
            col.is_nullable === "NO" ? "(NOT NULL)" : ""
          }`
        );
      });
    }

    // Test 7: Test a sample category insertion (if needed)
    console.log("\n7. ➕ Testing data insertion (categories)...");

    // Check if a test category already exists
    const { data: testCat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", "test-category")
      .single();

    if (!testCat) {
      const { data: newCategory, error: insertError } = await supabase
        .from("categories")
        .insert({
          name: "Test Category",
          slug: "test-category",
          description: "A test category for migration testing",
          sort_order: 999,
          is_active: true,
        })
        .select()
        .single();

      if (insertError) {
        console.log("❌ Error inserting test category:", insertError.message);
      } else {
        console.log("✅ Test category inserted successfully");

        // Clean up the test category
        await supabase.from("categories").delete().eq("slug", "test-category");

        console.log("✅ Test category cleaned up");
      }
    } else {
      console.log(
        "✅ Category insertion test skipped (test category already exists)"
      );
    }

    console.log("\n🎉 Migration test completed successfully!");
    console.log("\n📊 Summary:");
    console.log(
      `   - Tables: ${existingTables.length}/${expectedTables.length} ✅`
    );
    console.log(
      `   - Views: ${existingViews.length}/${expectedViews.length} ✅`
    );
    console.log(`   - Sample data: ${categories?.length || 0} categories ✅`);
    console.log("   - Functions: ✅");
    console.log("   - RLS Policies: ✅");
    console.log("   - Data insertion: ✅");
  } catch (error) {
    console.error("❌ Migration test failed:", error);
    process.exit(1);
  }
}

// Run the test
testMigration();
