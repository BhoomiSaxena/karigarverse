import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import { handleError } from "@/lib/api-middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { profile, error } = await AuthService.getUserProfile(userId);

    if (error) {
      return NextResponse.json({ error }, { status: 404 });
    }

    return NextResponse.json({ data: profile });
  } catch (error) {
    return handleError(error);
  }
}
