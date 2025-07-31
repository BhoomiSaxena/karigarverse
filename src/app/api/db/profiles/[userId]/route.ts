import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import { handleError } from "@/lib/api-middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { profile, error } = await AuthService.getUserProfile(params.userId);

    if (error) {
      return NextResponse.json({ error }, { status: 404 });
    }

    return NextResponse.json({ data: profile });
  } catch (error) {
    return handleError(error);
  }
}
