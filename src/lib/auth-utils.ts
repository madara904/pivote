import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { organizationMember } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag, unstable_cache } from "next/cache";
import { getSessionCookie } from "better-auth/cookies";

// Better Auth already handles session caching through cookieCache
// The issue is that getSession() with headers still bypasses cache in production

// Cache membership lookup by user ID - this works fine
const getMembershipCached = unstable_cache(
  async (userId: string) => {
    return db.query.organizationMember.findFirst({
      where: eq(organizationMember.userId, userId),
      with: { organization: true },
    });
  },
  ['user-membership'],
  { 
    revalidate: 24 * 60 * 60, // 24 hours
    tags: ['membership']
  }
);

// Simple and reliable approach - recommended to start with
async function getAccessContextSimple(): Promise<AccessContext | null> {
  const headersList = await headers();
  
  // Get session - Better Auth should handle its own caching here
  const session = await auth.api.getSession({ headers: headersList });
  
  if (!session?.user?.id) {
    return null;
  }

  // Only cache the database lookup part
  const membership = await getMembershipCached(session.user.id);

  return {
    user: session.user,
    organization: membership?.organization ?? null,
  };
}

// Option 1: Use Better Auth's built-in session method (recommended)
async function getAccessContext(): Promise<AccessContext | null> {
  // Better Auth's getSession should respect cookieCache
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user?.id) {
    return null;
  }

  // Only cache the database lookup, not the session
  const membership = await getMembershipCached(session.user.id);

  return {
    user: session.user,
    organization: membership?.organization ?? null,
  };
}

// Option 2: Use the session cookie approach (for middleware-style checks)
// This is more efficient as it doesn't hit the database for session validation
async function getAccessContextOptimized(): Promise<AccessContext | null> {
  const headersList = await headers();
  
  // First check if session cookie exists (fast)
  const sessionCookie = getSessionCookie(headersList);
  if (!sessionCookie) {
    return null;
  }

  // If cookie exists, get the full session
  const session = await auth.api.getSession({ headers: headersList });
  
  if (!session?.user?.id) {
    return null;
  }

  // Cache the database lookup
  const membership = await getMembershipCached(session.user.id);

  return {
    user: session.user,
    organization: membership?.organization ?? null,
  };
}


// Types
type AccessContext = {
  user: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>["user"];
  organization: NonNullable<
    Awaited<ReturnType<typeof getMembershipCached>>
  >["organization"] | null;
};

type AccessCondition = {
  check: (ctx: AccessContext) => boolean;
  redirectTo: string | ((ctx: AccessContext) => string);
};

// Main functions using the simple reliable approach
export async function requireAccess(conditions: AccessCondition[]) {
  // Start with the simple approach first
  const ctx = await getAccessContextSimple(); // Change this to test different approaches
  
  if (!ctx) {
    redirect("/sign-in");
  }

  for (const { check, redirectTo } of conditions) {
    if (!check(ctx)) {
      const target =
        typeof redirectTo === "function" ? redirectTo(ctx) : redirectTo;
      redirect(target);
    }
  }

  return ctx;
}

async function getAccessContextWithRedirect(): Promise<AccessContext> {
  const ctx = await getAccessContextSimple(); // Use simple approach
  if (!ctx) {
    redirect("/sign-in");
  }
  return ctx;
}

export async function requireForwarderAccess() {
  const ctx = await getAccessContextWithRedirect();
  
  if (!ctx.organization) {
    redirect("/onboarding");
  }
  
  if (ctx.organization.type !== "forwarder") {
    redirect(`/dashboard/${ctx.organization.type}`);
  }
  
  return ctx;
}

export async function requireShipperAccess() {
  const ctx = await getAccessContextWithRedirect();
  
  if (!ctx.organization) {
    redirect("/onboarding");
  }
  
  if (ctx.organization.type !== "shipper") {
    redirect(`/dashboard/${ctx.organization.type}`);
  }
  
  return ctx;
}

export async function requireNoOrganization() {
  const ctx = await getAccessContextWithRedirect();
  
  if (ctx.organization) {
    redirect("/dashboard");
  }
  
  return ctx;
}

export async function requireAnyOrganizationAccess(): Promise<
  Omit<AccessContext, "organization"> & { organization: NonNullable<AccessContext["organization"]> }
> {
  const ctx = await getAccessContextWithRedirect();
  
  if (!ctx.organization) {
    redirect("/onboarding");
  }
  
  return ctx as Omit<AccessContext, "organization"> & { 
    organization: NonNullable<AccessContext["organization"]> 
  };
}

// Cache invalidation helpers
export function invalidateUserCache(userId: string) {
  revalidateTag('membership');
}

export function invalidateAllUserCache() {
  revalidateTag('membership');
}

// Public exports
export { 
  getAccessContext,
  getAccessContextWithRedirect,
  getAccessContextSimple,
  getAccessContextOptimized,
};