// Add missing columns to artisan_profiles table
const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

const pool = new Pool({
  user: process.env.POSTGRES_USER || "proximus",
  host: process.env.POSTGRES_HOST || "localhost",
  database: process.env.POSTGRES_DB || "karigarverse",
  password: process.env.POSTGRES_PASSWORD || "",
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
});

async function addColumns() {
  try {
    console.log("Adding missing columns to artisan_profiles table...");

    const alterQueries = [
      "ALTER TABLE public.artisan_profiles ADD COLUMN IF NOT EXISTS social_media JSONB",
      "ALTER TABLE public.artisan_profiles ADD COLUMN IF NOT EXISTS business_hours JSONB",
      "ALTER TABLE public.artisan_profiles ADD COLUMN IF NOT EXISTS portfolio_images TEXT[]",
      "ALTER TABLE public.artisan_profiles ADD COLUMN IF NOT EXISTS certificates TEXT[]",
      "ALTER TABLE public.artisan_profiles ADD COLUMN IF NOT EXISTS awards TEXT[]",
      "ALTER TABLE public.artisan_profiles ADD COLUMN IF NOT EXISTS delivery_info JSONB",
      "ALTER TABLE public.artisan_profiles ADD COLUMN IF NOT EXISTS payment_methods TEXT[]",
      "ALTER TABLE public.artisan_profiles ADD COLUMN IF NOT EXISTS return_policy TEXT",
      "ALTER TABLE public.artisan_profiles ADD COLUMN IF NOT EXISTS shipping_policy TEXT",
      "ALTER TABLE public.artisan_profiles ADD COLUMN IF NOT EXISTS preferred_language TEXT",
      "ALTER TABLE public.artisan_profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB",
    ];

    for (const query of alterQueries) {
      await pool.query(query);
      console.log("✅", query.split("ADD COLUMN IF NOT EXISTS ")[1]);
    }

    console.log("\n✅ All missing columns added successfully!");

    // Verify the columns were added
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'artisan_profiles' 
      AND column_name IN ('social_media', 'business_hours', 'portfolio_images', 'certificates', 'awards', 'delivery_info', 'payment_methods', 'return_policy', 'shipping_policy', 'preferred_language', 'notification_preferences')
      ORDER BY column_name
    `);

    console.log("\n📋 Added columns:");
    result.rows.forEach((row) =>
      console.log(`  - ${row.column_name}: ${row.data_type}`)
    );
  } catch (error) {
    console.error("❌ Error adding columns:", error.message);
  } finally {
    await pool.end();
  }
}

addColumns();
