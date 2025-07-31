import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/postgres-config";
import { handleError } from "@/lib/api-middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    const orderResult = await query("SELECT * FROM orders WHERE id = $1", [
      orderId,
    ]);

    if (orderResult.rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsResult = await query(
      `SELECT oi.*, p.name as product_name, p.images as product_images,
              ap.shop_name as artisan_shop_name
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN artisan_profiles ap ON oi.artisan_id = ap.id
       WHERE oi.order_id = $1`,
      [orderId]
    );

    return NextResponse.json({
      data: {
        ...order,
        items: itemsResult.rows,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
