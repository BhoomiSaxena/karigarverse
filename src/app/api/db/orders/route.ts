import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/postgres-config";
import { handleError, withAuth } from "@/lib/api-middleware";

export const GET = withAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = request.user!.id;

    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : undefined;
    const offset = searchParams.get("offset")
      ? parseInt(searchParams.get("offset")!)
      : undefined;

    let queryText = `
      SELECT o.*, 
             COUNT(oi.id) as item_count,
             array_agg(p.name) as product_names
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.customer_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;
    const params: any[] = [userId];
    let paramIndex = 2;

    if (limit) {
      queryText += ` LIMIT $${paramIndex}`;
      params.push(limit);
      paramIndex++;
    }

    if (offset) {
      queryText += ` OFFSET $${paramIndex}`;
      params.push(offset);
      paramIndex++;
    }

    const result = await query(queryText, params);
    return NextResponse.json({ data: result.rows });
  } catch (error) {
    return handleError(error);
  }
});

export const POST = withAuth(async (request) => {
  try {
    const orderData = await request.json();
    const userId = request.user!.id;

    // Generate order number
    const orderNumber = `KV-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    // Create order
    const orderResult = await query(
      `INSERT INTO orders (
        order_number, customer_id, subtotal, tax_amount, shipping_cost,
        discount_amount, total_amount, shipping_address, billing_address,
        payment_method, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        orderNumber,
        userId,
        orderData.subtotal,
        orderData.tax_amount || 0,
        orderData.shipping_cost || 0,
        orderData.discount_amount || 0,
        orderData.total_amount,
        JSON.stringify(orderData.shipping_address),
        orderData.billing_address
          ? JSON.stringify(orderData.billing_address)
          : null,
        orderData.payment_method,
        orderData.notes,
      ]
    );

    const order = orderResult.rows[0];

    // Create order items
    for (const item of orderData.items) {
      await query(
        `INSERT INTO order_items (
          order_id, product_id, artisan_id, quantity, unit_price, total_price
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          order.id,
          item.product_id,
          item.artisan_id,
          item.quantity,
          item.unit_price,
          item.quantity * item.unit_price,
        ]
      );

      // Update product stock
      await query(
        "UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2",
        [item.quantity, item.product_id]
      );
    }

    // Clear cart
    await query("DELETE FROM cart_items WHERE user_id = $1", [userId]);

    return NextResponse.json({ data: order });
  } catch (error) {
    return handleError(error);
  }
});
