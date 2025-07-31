import { NextRequest, NextResponse } from "next/server";
import { AuthService, verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { user: null, error: "No token provided" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { user: null, error: "Invalid token" },
        { status: 401 }
      );
    }

    const { user, error } = await AuthService.getUser(decoded.userId);

    if (error) {
      return NextResponse.json({ user: null, error }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { user: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
