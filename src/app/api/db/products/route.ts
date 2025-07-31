import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database-postgres";
import {
  handleError,
  withAuth,
  AuthenticatedRequest,
} from "@/lib/api-middleware";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const options = {
      category: searchParams.get("category") || undefined,
      artisan_id: searchParams.get("artisan_id") || undefined,
      is_featured: searchParams.get("is_featured")
        ? searchParams.get("is_featured") === "true"
        : undefined,
      is_active: searchParams.get("is_active")
        ? searchParams.get("is_active") === "true"
        : true,
      search: searchParams.get("search") || undefined,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : undefined,
      offset: searchParams.get("offset")
        ? parseInt(searchParams.get("offset")!)
        : undefined,
    };

    const products = await db.getProducts(options);
    return NextResponse.json({ data: products });
  } catch (error) {
    return handleError(error);
  }
}

export const POST = withAuth(async (request) => {
  try {
    const productData = await request.json();
    const product = await db.createProduct(productData);
    return NextResponse.json({ data: product });
  } catch (error) {
    return handleError(error);
  }
});
