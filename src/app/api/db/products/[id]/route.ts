import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database-postgres";
import { handleError, withAuth } from "@/lib/api-middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await db.getProductById(params.id);
    return NextResponse.json({ data: product });
  } catch (error) {
    return handleError(error);
  }
}

export const PUT = withAuth(
  async (request, { params }: { params: { id: string } }) => {
    try {
      const updates = await request.json();
      const product = await db.updateProduct(params.id, updates);
      return NextResponse.json({ data: product });
    } catch (error) {
      return handleError(error);
    }
  }
);

export const DELETE = withAuth(
  async (request, { params }: { params: { id: string } }) => {
    try {
      const result = await db.deleteProduct(params.id);
      return NextResponse.json({ data: result });
    } catch (error) {
      return handleError(error);
    }
  }
);
