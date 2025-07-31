import { type NextRequest } from "next/server";
import { redirect } from "next/navigation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const next = searchParams.get("next") ?? "/";

  // For PostgreSQL-based auth, we don't need email confirmation
  // Redirect users to login page or their intended destination
  redirect(next.startsWith("/") ? next : "/login");
}
