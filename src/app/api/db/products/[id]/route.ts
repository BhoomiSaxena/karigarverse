import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database-postgres";
import {
  handleError,
  withAuth,
  AuthenticatedRequest,
} from "@/lib/api-middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await db.getProductById(id);
    return NextResponse.json({ data: product });
  } catch (error) {
    return handleError(error);
  }
}

export const PUT = withAuth(
  async (
    request: AuthenticatedRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id } = await params;
      const updates = await request.json();
      const product = await db.updateProduct(id, updates);
      return NextResponse.json({ data: product });
    } catch (error) {
      return handleError(error);
    }
  }
);

export const DELETE = withAuth(
  async (
    request: AuthenticatedRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id } = await params;
      const result = await db.deleteProduct(id);
      return NextResponse.json({ data: { success: true } });
    } catch (error) {
      return handleError(error);
    }
  }
);
