import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/postgres-config";
import { handleError, withAuth } from "@/lib/api-middleware";

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
