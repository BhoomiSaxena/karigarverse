import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database-postgres";
import { handleError } from "@/lib/api-middleware";

export async function GET() {
  try {
    const categories = await db.getCategories();
    return NextResponse.json({ data: categories });
  } catch (error) {
    return handleError(error);
  }
}
