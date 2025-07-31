import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/postgres-config";
import { handleError, withAuth } from "@/lib/api-middleware";

export const GET = withAuth(async (request) => {
  try {
    const userId = request.user!.id;

    const result = await query(
      `
      SELECT 
        ci.*,
        json_build_object(
          'id', p.id,
          'name', p.name,
          'price', p.price,
          'images', p.images,
          'stock_quantity', p.stock_quantity,
          'is_active', p.is_active,
          'artisan_id', p.artisan_id
        ) as products,
        ap.shop_name
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      JOIN artisan_profiles ap ON p.artisan_id = ap.id
      WHERE ci.user_id = $1
      ORDER BY ci.created_at DESC
    `,
      [userId]
    );

    return NextResponse.json({ data: result.rows });
  } catch (error) {
    return handleError(error);
  }
});

export const POST = withAuth(async (request) => {
  try {
    const { productId, quantity } = await request.json();
    const userId = request.user!.id;

    // Check if item already exists in cart
    const existingItem = await query(
      "SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2",
      [userId, productId]
    );

    if (existingItem.rows.length > 0) {
      // Update quantity
      const result = await query(
        "UPDATE cart_items SET quantity = quantity + $1, updated_at = NOW() WHERE user_id = $2 AND product_id = $3 RETURNING *",
        [quantity, userId, productId]
      );
      return NextResponse.json({ data: result.rows[0] });
    } else {
      // Add new item
      const result = await query(
        "INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *",
        [userId, productId, quantity]
      );
      return NextResponse.json({ data: result.rows[0] });
    }
  } catch (error) {
    return handleError(error);
  }
});

export const PUT = withAuth(async (request) => {
  try {
    const { productId, quantity } = await request.json();
    const userId = request.user!.id;

    const result = await query(
      "UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE user_id = $2 AND product_id = $3 RETURNING *",
      [quantity, userId, productId]
    );

    return NextResponse.json({ data: result.rows[0] });
  } catch (error) {
    return handleError(error);
  }
});

export const DELETE = withAuth(async (request) => {
  try {
    const { productId } = await request.json();
    const userId = request.user!.id;

    await query(
      "DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2",
      [userId, productId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
});
