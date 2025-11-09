import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Set the pathname as a header so server components can access it
  const pathname = request.nextUrl.pathname;
  
  // Create a response
  const response = NextResponse.next();
  
  // Set the pathname header (only for non-auth pages to avoid loops)
  if (!pathname.startsWith("/sign-in") && 
      !pathname.startsWith("/sign-up") && 
      !pathname.startsWith("/forgot") &&
      !pathname.startsWith("/reset") &&
      !pathname.startsWith("/onboarding") &&
      !pathname.startsWith("/api") &&
      !pathname.startsWith("/_next")) {
    response.headers.set("x-pathname", pathname);
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

