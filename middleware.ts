import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // For our PostgreSQL setup, we'll handle authentication at the API route level
  // rather than in middleware, since JWT verification in edge runtime can be complex

  // Simply pass through all requests - API routes will handle their own auth
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
