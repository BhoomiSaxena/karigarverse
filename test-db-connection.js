// Simple test script to check PostgreSQL connection
const { Pool } = require("pg");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const pool = new Pool({
  user: process.env.POSTGRES_USER || "proximus",
  host: process.env.POSTGRES_HOST || "localhost",
  database: process.env.POSTGRES_DB || "karigarverse",
  password: process.env.POSTGRES_PASSWORD || "",
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
});

async function testConnection() {
  try {
    console.log("Testing PostgreSQL connection...");
    const client = await pool.connect();
    console.log("✅ Connected to PostgreSQL");

    // Test basic query
    const result = await client.query(
      "SELECT NOW() as current_time, VERSION() as version"
    );
    console.log("✅ Query successful");
    console.log("Current Time:", result.rows[0].current_time);
    console.log("PostgreSQL Version:", result.rows[0].version.split(" ")[0]);

    // Check if tables exist
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log("\n📋 Available tables:");
    tables.rows.forEach((row) => console.log("  -", row.table_name));

    client.release();
    await pool.end();

    console.log("\n✅ Database connection test successful!");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
}

testConnection();
