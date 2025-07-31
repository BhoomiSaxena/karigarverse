/**
 * PostgreSQL Database Configuration
 * Replaces Supabase client configuration
 */

import { Pool } from "pg";

// Database configuration
const dbConfig = {
  user: process.env.POSTGRES_USER || "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  database: process.env.POSTGRES_DB || "karigarverse",
  password: process.env.POSTGRES_PASSWORD || "",
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// Create connection pool
let pool: Pool | null = null;

export const getPool = (): Pool => {
  if (!pool) {
    pool = new Pool(dbConfig);

    // Handle pool errors
    pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err);
      process.exit(-1);
    });
  }

  return pool;
};

// Helper function to execute queries
export const query = async (text: string, params?: any[]) => {
  const client = await getPool().connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

// Helper function to execute transactions
export const transaction = async (callback: (client: any) => Promise<any>) => {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Close the pool (useful for cleanup)
export const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};
