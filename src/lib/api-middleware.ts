/**
 * Middleware for API routes to handle authentication and common functionality
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export interface AuthenticatedRequest extends NextRequest {
  userId: string;
  user: { id: string; email: string };
}

export function withAuth(
  handler: (
    request: AuthenticatedRequest,
    context?: any
  ) => Promise<NextResponse>
) {
  return async (request: AuthenticatedRequest, context?: any) => {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    request.userId = decoded.userId;
    request.user = { id: decoded.userId, email: "" }; // You can fetch full user details if needed
    return handler(request, context);
  };
}

export function handleError(error: any) {
  console.error("API Error:", error);

  if (error.message.includes("not found")) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  if (error.message.includes("already exists")) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }

  return NextResponse.json(
    { error: error.message || "Internal server error" },
    { status: 500 }
  );
}
