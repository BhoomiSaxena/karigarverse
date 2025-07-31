import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/postgres-config";
import { handleError, withAuth } from "@/lib/api-middleware";

export const GET = withAuth(async (request) => {
  try {
    const userId = request.user!.id;

    const result = await query(
      "SELECT * FROM artisan_profiles WHERE user_id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Artisan profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: result.rows[0] });
  } catch (error) {
    return handleError(error);
  }
});

export const POST = withAuth(async (request) => {
  try {
    const {
      shop_name,
      description,
      specialties = [],
      location,
      business_license,
      phone,
      email,
      website,
    } = await request.json();

    const userId = request.user!.id;

    const result = await query(
      `
      INSERT INTO artisan_profiles (
        user_id, shop_name, description, specialties, location, 
        business_license, phone, email, website
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `,
      [
        userId,
        shop_name,
        description,
        specialties,
        location,
        business_license,
        phone,
        email,
        website,
      ]
    );

    return NextResponse.json({ data: result.rows[0] });
  } catch (error) {
    return handleError(error);
  }
});

export const PUT = withAuth(async (request) => {
  try {
    const updates = await request.json();
    const userId = request.user!.id;

    // Build dynamic update query
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ");

    const values = Object.values(updates);

    const result = await query(
      `UPDATE artisan_profiles SET ${setClause}, updated_at = NOW() WHERE user_id = $1 RETURNING *`,
      [userId, ...values]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Artisan profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: result.rows[0] });
  } catch (error) {
    return handleError(error);
  }
});
