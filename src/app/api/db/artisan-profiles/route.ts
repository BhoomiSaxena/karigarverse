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

    console.log("PUT /artisan-profiles - User ID:", userId);
    console.log("PUT /artisan-profiles - Updates:", Object.keys(updates));

    // Filter out invalid or read-only fields
    const validFields = [
      "shop_name",
      "description",
      "specialties",
      "location",
      "business_license",
      "verification_status",
      "status",
      "phone",
      "email",
      "website",
      "social_links",
      "bank_details",
      "commission_rate",
      "total_sales",
      "total_orders",
      "rating",
      "review_count",
      "banner_image",
      "shop_logo",
      "social_media",
      "business_hours",
      "portfolio_images",
      "certificates",
      "awards",
      "delivery_info",
      "payment_methods",
      "return_policy",
      "shipping_policy",
      "preferred_language",
      "notification_preferences",
      "established_year",
      "experience_years",
    ];

    // Filter updates to only include valid fields
    const filteredUpdates = Object.keys(updates)
      .filter((key) => validFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {} as any);

    // Handle field mapping for backwards compatibility
    if (updates.contact_email) {
      filteredUpdates.email = updates.contact_email;
    }
    if (updates.contact_phone) {
      filteredUpdates.phone = updates.contact_phone;
    }
    if (updates.website_url) {
      filteredUpdates.website = updates.website_url;
    }

    console.log(
      "PUT /artisan-profiles - Filtered updates:",
      Object.keys(filteredUpdates)
    );

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // First check if artisan profile exists
    const existingProfile = await query(
      "SELECT id FROM artisan_profiles WHERE user_id = $1",
      [userId]
    );

    if (existingProfile.rows.length === 0) {
      console.log("PUT /artisan-profiles - No existing profile, creating one");

      // Create a new artisan profile with minimal required fields
      const createResult = await query(
        `INSERT INTO artisan_profiles (user_id, shop_name, description, specialties, location, phone, email, website) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          userId,
          filteredUpdates.shop_name || "My Shop",
          filteredUpdates.description || null,
          filteredUpdates.specialties || [],
          filteredUpdates.location || null,
          filteredUpdates.phone || null,
          filteredUpdates.email || null,
          filteredUpdates.website || null,
        ]
      );

      return NextResponse.json({ data: createResult.rows[0] });
    }

    // Build dynamic update query using filtered updates
    const setClause = Object.keys(filteredUpdates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ");

    const values = Object.values(filteredUpdates);

    console.log("PUT /artisan-profiles - Update query:", {
      setClause,
      values: values.length,
    });

    const result = await query(
      `UPDATE artisan_profiles SET ${setClause}, updated_at = NOW() WHERE user_id = $1 RETURNING *`,
      [userId, ...values]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Artisan profile not found after update" },
        { status: 404 }
      );
    }

    console.log("PUT /artisan-profiles - Success");
    return NextResponse.json({ data: result.rows[0] });
  } catch (error) {
    console.error("PUT /artisan-profiles - Error:", error);
    return handleError(error);
  }
});
