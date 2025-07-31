import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import { handleError, withAuth } from "@/lib/api-middleware";

export const GET = withAuth(async (request) => {
  try {
    const userId = request.user!.id;
    const { profile, error } = await AuthService.getUserProfile(userId);

    if (error) {
      return NextResponse.json({ error }, { status: 404 });
    }

    return NextResponse.json({ data: profile });
  } catch (error) {
    return handleError(error);
  }
});

export const PUT = withAuth(async (request) => {
  try {
    const userId = request.user!.id;
    const updates = await request.json();

    const { profile, error } = await AuthService.updateUserProfile(
      userId,
      updates
    );

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ data: profile });
  } catch (error) {
    return handleError(error);
  }
});
