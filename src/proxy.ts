import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./lib/auth";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;


  if (pathname.startsWith("/dashboard")) {
    const sessionCookie = request.cookies.get("better-auth.session_token");
    
    if (!sessionCookie) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(signInUrl);
    }

    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(signInUrl);
    }

    const isForwarder = session.user.orgType === "forwarder";
    const correctPath = isForwarder ? "/dashboard/forwarder" : "/dashboard/shipper";
    const wrongPath = isForwarder ? "/dashboard/shipper" : "/dashboard/forwarder";


    if (pathname === "/dashboard") {
      return NextResponse.redirect(new URL(correctPath, request.url));
    }


    if (pathname.startsWith(wrongPath)) {
      return NextResponse.redirect(new URL(correctPath, request.url));
    }
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};