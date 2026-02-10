import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./lib/auth";
import { headers } from "next/headers";

export async function proxy(request: NextRequest) {
  
  const pathname = request.nextUrl.pathname;

  if (pathname === "/dashboard") {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    if (!session) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(signInUrl);
    }
    const path = session.user.orgType === "forwarder"
      ? "/dashboard/forwarder"
      : "/dashboard/shipper";

    return NextResponse.redirect(new URL(path, request.url));
  }

      
  const response = NextResponse.next();
  
  if (
    !pathname.startsWith("/sign-in") &&
    !pathname.startsWith("/sign-up") &&
    !pathname.startsWith("/forgot") &&
    !pathname.startsWith("/reset") &&
    !pathname.startsWith("/onboarding") &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next")
  ) {
    response.headers.set("x-pathname", pathname);
  }

  return response;
}

export default proxy;

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
