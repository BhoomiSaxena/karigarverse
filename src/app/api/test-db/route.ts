import { NextResponse } from "next/server";
import { query } from "@/lib/postgres-config";

export async function GET() {
  try {
    // Test basic connection
    const result = await query("SELECT NOW() as current_time");

    // Test if users table exists
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'profiles', 'categories')
    `);

    return NextResponse.json({
      status: "success",
      message: "Database connection successful",
      currentTime: result.rows[0]?.current_time,
      tables: tablesResult.rows.map((row) => row.table_name),
    });
  } catch (error: any) {
    console.error("Database test error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Database connection failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
