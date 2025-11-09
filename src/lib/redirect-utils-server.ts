import { headers } from "next/headers";

/**
 * SERVER-ONLY utilities for redirect handling
 * 
 * This file is separate from redirect-utils.ts because it uses headers() from next/headers,
 * which can only be used in Server Components. Client components import redirect-utils.ts
 * which contains only client-safe functions.
 * 
 * Gets the current request path from headers (server-side)
 * This tries multiple methods to get the current path, but may return null
 * if the path cannot be determined (which is acceptable - we'll redirect without returnTo)
 */
export async function getCurrentPath(): Promise<string | null> {
  const headersList = await headers();
  
  // Method 1: Try x-pathname header (set by our middleware)
  const xPathname = headersList.get("x-pathname");
  if (xPathname && xPathname.startsWith("/")) {
    const path = xPathname.split("?")[0]; // Remove query params
    // Validate it's not an auth page (shouldn't happen with our middleware, but double-check)
    if (!path.startsWith("/sign-in") && 
        !path.startsWith("/sign-up") && 
        !path.startsWith("/forgot") &&
        !path.startsWith("/reset") &&
        !path.startsWith("/onboarding")) {
      return path;
    }
  }
  
  // Method 2: Try x-invoke-path header
  const xInvokePath = headersList.get("x-invoke-path");
  if (xInvokePath && xInvokePath.startsWith("/")) {
    return xInvokePath.split("?")[0];
  }
  
  // Method 3: Try to extract from referer header
  const referer = headersList.get("referer");
  if (referer) {
    try {
      const url = new URL(referer);
      const pathname = url.pathname;
      // Only return if it's a valid path (not an auth page to avoid loops)
      if (pathname.startsWith("/") && !pathname.startsWith("/sign-in") && 
          !pathname.startsWith("/sign-up") && !pathname.startsWith("/forgot") &&
          !pathname.startsWith("/reset") && !pathname.startsWith("/onboarding")) {
        return pathname;
      }
    } catch {
      // Ignore URL parsing errors
    }
  }
  
  // Method 4: Try x-url header
  const xUrl = headersList.get("x-url");
  if (xUrl) {
    try {
      const url = new URL(xUrl.startsWith("http") ? xUrl : `http://localhost${xUrl}`);
      const pathname = url.pathname;
      if (pathname.startsWith("/") && !pathname.startsWith("/sign-in") && 
          !pathname.startsWith("/sign-up") && !pathname.startsWith("/forgot") &&
          !pathname.startsWith("/reset") && !pathname.startsWith("/onboarding")) {
        return pathname;
      }
    } catch {
      // Ignore URL parsing errors
    }
  }
  
  // If we can't determine the path, return null (will redirect without returnTo)
  return null;
}

