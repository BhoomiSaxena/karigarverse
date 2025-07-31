import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database-postgres";
import { handleError } from "@/lib/api-middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const category = await db.getCategoryBySlug(params.slug);

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: category });
  } catch (error) {
    return handleError(error);
  }
}
