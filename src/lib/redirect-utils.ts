/**
 * Validates that a returnTo URL is safe to redirect to
 * Only allows relative URLs (same origin)
 */
export function isValidReturnTo(url: string | null): boolean {
  if (!url) return false;
  
  try {
    // Only allow relative URLs (starting with /)
    // This prevents open redirect vulnerabilities
    if (!url.startsWith("/")) return false;
    
    // Don't allow redirects to auth pages (would cause loops)
    const authPaths = ["/sign-in", "/sign-up", "/forgot", "/reset", "/onboarding"];
    if (authPaths.some(path => url.startsWith(path))) return false;
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Builds a sign-in URL with returnTo parameter
 */
export function buildSignInUrl(returnTo: string | null = null): string {
  if (returnTo && isValidReturnTo(returnTo)) {
    return `/sign-in?returnTo=${encodeURIComponent(returnTo)}`;
  }
  return "/sign-in";
}

/**
 * Gets returnTo from search params (client-side)
 */
export function getReturnToFromSearchParams(searchParams: URLSearchParams): string | null {
  const returnTo = searchParams.get("returnTo");
  return isValidReturnTo(returnTo) ? returnTo : null;
}

