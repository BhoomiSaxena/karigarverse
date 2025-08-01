import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database-postgres";
import { verifyAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = authResult.user.id;
    const artisanData = await request.json();

    // Check if user already has an artisan profile
    const existingProfile = await db.getArtisanProfile(userId);
    if (existingProfile) {
      return NextResponse.json(
        { error: "Artisan profile already exists" },
        { status: 409 }
      );
    }

    // Clean up the artisan data object to match database schema
    const cleanArtisanData: any = {
      user_id: userId,
    };

    // Map the frontend field names to database field names
    const fieldMapping: { [key: string]: string } = {
      contact_email: "email",
      contact_phone: "phone",
      website_url: "website",
    };

    // Direct mappings (field names are the same)
    const directFields = [
      "shop_name",
      "description",
      "specialties",
      "location",
      "business_license",
      "phone",
      "email",
      "website",
      "established_year",
      "experience_years",
    ];

    // Process direct mappings
    directFields.forEach((field) => {
      if (artisanData[field] !== undefined) {
        cleanArtisanData[field] = artisanData[field];
      }
    });

    // Process field mappings
    Object.entries(fieldMapping).forEach(([frontendField, dbField]) => {
      if (artisanData[frontendField] !== undefined) {
        cleanArtisanData[dbField] = artisanData[frontendField];
      }
    });

    // Create the artisan profile
    const newProfile = await db.createArtisanProfile(cleanArtisanData);

    return NextResponse.json(
      {
        success: true,
        data: newProfile,
        message: "Artisan profile created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating artisan profile:", error);
    return NextResponse.json(
      {
        error: "Failed to create artisan profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = authResult.user.id;
    const updates = await request.json();

    // Get current artisan profile to ensure it exists
    const currentProfile = await db.getArtisanProfile(userId);
    if (!currentProfile) {
      return NextResponse.json(
        { error: "Artisan profile not found" },
        { status: 404 }
      );
    }

    // Clean up the updates object to match database schema
    const cleanUpdates: any = {};

    // Map the frontend field names to database field names
    const fieldMapping: { [key: string]: string } = {
      contact_email: "email",
      contact_phone: "phone",
      website_url: "website",
      social_media: "social_media",
      business_hours: "business_hours",
      portfolio_images: "portfolio_images",
      certificates: "certificates",
      awards: "awards",
      delivery_info: "delivery_info",
      payment_methods: "payment_methods",
      return_policy: "return_policy",
      shipping_policy: "shipping_policy",
      preferred_language: "preferred_language",
      notification_preferences: "notification_preferences",
    };

    // Direct mappings (field names are the same)
    const directFields = [
      "shop_name",
      "description",
      "specialties",
      "location",
      "business_license",
      "verification_status",
      "status",
      "banner_image",
      "shop_logo",
      "established_year",
      "experience_years",
    ];

    // Process direct mappings
    directFields.forEach((field) => {
      if (updates[field] !== undefined) {
        cleanUpdates[field] = updates[field];
      }
    });

    // Process field mappings
    Object.entries(fieldMapping).forEach(([frontendField, dbField]) => {
      if (updates[frontendField] !== undefined) {
        cleanUpdates[dbField] = updates[frontendField];
      }
    });

    // Always update the updated_at field
    cleanUpdates.updated_at = new Date().toISOString();

    // Update the artisan profile
    const updatedProfile = await db.updateArtisanProfile(userId, cleanUpdates);

    return NextResponse.json(
      {
        success: true,
        data: updatedProfile,
        message: "Artisan profile updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating artisan profile:", error);
    return NextResponse.json(
      {
        error: "Failed to update artisan profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = authResult.user.id;

    // Get artisan profile
    const profile = await db.getArtisanProfile(userId);
    if (!profile) {
      return NextResponse.json(
        { error: "Artisan profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: profile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching artisan profile:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch artisan profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
