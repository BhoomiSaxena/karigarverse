import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database-postgres";
import { handleError } from "@/lib/api-middleware";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const viewsCount = await db.incrementProductViews(id);
    return NextResponse.json({ data: { views_count: viewsCount } });
  } catch (error) {
    return handleError(error);
  }
}
