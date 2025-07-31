import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/postgres-config";
import { handleError, withAuth } from "@/lib/api-middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;
    const { searchParams } = new URL(request.url);

    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : undefined;
    const offset = searchParams.get("offset")
      ? parseInt(searchParams.get("offset")!)
      : undefined;

    let queryText = `
      SELECT r.*, pr.first_name || ' ' || pr.last_name as customer_name,
             pr.avatar_url as customer_avatar
      FROM reviews r
      JOIN profiles pr ON r.customer_id = pr.id
      WHERE r.product_id = $1
      ORDER BY r.created_at DESC
    `;
    const params_array: any[] = [productId];
    let paramIndex = 2;

    if (limit) {
      queryText += ` LIMIT $${paramIndex}`;
      params_array.push(limit);
      paramIndex++;
    }

    if (offset) {
      queryText += ` OFFSET $${paramIndex}`;
      params_array.push(offset);
      paramIndex++;
    }

    const result = await query(queryText, params_array);
    return NextResponse.json({ data: result.rows });
  } catch (error) {
    return handleError(error);
  }
}

export const POST = withAuth(async (request) => {
  try {
    const {
      product_id,
      order_item_id,
      rating,
      title,
      comment,
      images = [],
    } = await request.json();

    const userId = request.user!.id;

    const result = await query(
      `INSERT INTO reviews (
        product_id, customer_id, order_item_id, rating, title, comment, images, is_verified_purchase
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        product_id,
        userId,
        order_item_id,
        rating,
        title,
        comment,
        images,
        !!order_item_id, // verified if linked to order item
      ]
    );

    return NextResponse.json({ data: result.rows[0] });
  } catch (error) {
    return handleError(error);
  }
});
