import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password, first_name, last_name, phone } =
      await request.json();

    if (!email || !password || !first_name || !last_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await AuthService.signUp(email, password, {
      first_name,
      last_name,
      phone,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      user: result.user,
      token: result.token,
      message: "Account created successfully",
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
