import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { query } from "@/lib/postgres-config";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    console.log("Debug - Received token:", token ? "TOKEN_EXISTS" : "NO_TOKEN");

    if (!token) {
      return NextResponse.json(
        {
          error: "No token provided",
          headers: Object.fromEntries(request.headers.entries()),
        },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    console.log("Debug - Token decoded:", decoded);

    if (!decoded) {
      return NextResponse.json(
        {
          error: "Invalid token",
          token: token.substring(0, 10) + "...",
        },
        { status: 401 }
      );
    }

    // Check user exists
    const userResult = await query(
      "SELECT id, email FROM users WHERE id = $1",
      [decoded.userId]
    );

    console.log("Debug - User query result:", userResult.rows);

    // Check artisan profile exists
    const artisanResult = await query(
      "SELECT id, user_id, shop_name FROM artisan_profiles WHERE user_id = $1",
      [decoded.userId]
    );

    console.log("Debug - Artisan query result:", artisanResult.rows);

    return NextResponse.json({
      success: true,
      user: userResult.rows[0] || null,
      artisanProfile: artisanResult.rows[0] || null,
      tokenInfo: { userId: decoded.userId },
    });
  } catch (error: any) {
    console.error("Debug - Error:", error);
    return NextResponse.json(
      {
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
