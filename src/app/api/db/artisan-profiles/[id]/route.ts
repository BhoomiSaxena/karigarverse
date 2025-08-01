import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database-postgres";
import { handleError } from "@/lib/api-middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const artisanProfile = await db.getArtisanProfileById(id);

    if (!artisanProfile) {
      return NextResponse.json(
        { error: "Artisan profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: artisanProfile });
  } catch (error) {
    return handleError(error);
  }
}
