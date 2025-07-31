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

    // First get the artisan profile for this user
    const artisanResult = await query(
      "SELECT id FROM artisan_profiles WHERE user_id = $1",
      [userId]
    );

    if (artisanResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Artisan profile not found" },
        { status: 404 }
      );
    }

    const artisanId = artisanResult.rows[0].id;

    let queryText = `
      SELECT DISTINCT o.*, 
             pr.first_name || ' ' || pr.last_name as customer_name,
             COUNT(oi.id) as item_count,
             array_agg(DISTINCT p.name) as product_names
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      JOIN profiles pr ON o.customer_id = pr.id
      WHERE oi.artisan_id = $1
      GROUP BY o.id, pr.first_name, pr.last_name
      ORDER BY o.created_at DESC
    `;
    const params: any[] = [artisanId];
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
