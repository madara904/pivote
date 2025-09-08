import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { organizationMember } from "@/db/schema";
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";

// Much more aggressive caching for membership - users rarely change orgs
const getMembershipCached = unstable_cache(
  async (userId: string) => {
    return db.query.organizationMember.findFirst({
      where: eq(organizationMember.userId, userId),
      with: { organization: true },
    });
  },
  ['user-membership'],
  { 
    revalidate: 60 * 60 * 24 * 7, // 7 days - much longer since org membership rarely changes
    tags: ['membership'] // User-specific tag will be added dynamically
  }
);

// Cache the access context based on user ID (no headers() inside cache)
const getAccessContextCached = unstable_cache(
  async (userId: string) => {
    // This membership lookup is now heavily cached
    const membership = await getMembershipCached(userId);

    return {
      userId,
      organization: membership?.organization ?? null,
    };
  },
  ['access-context'],
  { 
    revalidate: 5 * 60, // 5 minutes for the combined context
    tags: ['access-context', 'membership']
  }
);

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

// Main function to get access context with session
async function getAccessContext(): Promise<AccessContext | null> {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user?.id) {
    return null;
  }

  // Get cached access context
  const cachedContext = await getAccessContextCached(session.user.id);

  return {
    user: session.user,
    organization: cachedContext.organization,
  };
}

export async function requireAccess(conditions: AccessCondition[]) {
  const ctx = await getAccessContext(); // Uses the main function, not cached version
  
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
  const ctx = await getAccessContext(); // Uses the main function, not cached version
  if (!ctx) {
    redirect("/sign-in");
  }
  return ctx;
}

export async function requireForwarderAccess() {
  const ctx = await getAccessContextWithRedirect(); // Uses the main function, not cached version
  
  if (!ctx.organization) {
    redirect("/onboarding");
  }
  
  if (ctx.organization.type !== "forwarder") {
    redirect(`/dashboard/${ctx.organization.type}`);
  }
  
  return ctx;
}

export async function requireShipperAccess() {
  const ctx = await getAccessContextWithRedirect(); // Uses the main function, not cached version
  
  if (!ctx.organization) {
    redirect("/onboarding");
  }
  
  if (ctx.organization.type !== "shipper") {
    redirect(`/dashboard/${ctx.organization.type}`);
  }
  
  return ctx;
}

export async function requireNoOrganization() {
  const ctx = await getAccessContextWithRedirect(); // Uses the main function, not cached version
  
  if (ctx.organization) {
    redirect("/dashboard");
  }
  
  return ctx;
}

export async function requireAnyOrganizationAccess(): Promise<
  Omit<AccessContext, "organization"> & { organization: NonNullable<AccessContext["organization"]> }
> {
  const ctx = await getAccessContextWithRedirect(); // Uses the main function, not cached version
  
  if (!ctx.organization) {
    redirect("/onboarding");
  }
  
  return ctx as Omit<AccessContext, "organization"> & { 
    organization: NonNullable<AccessContext["organization"]> 
  };
}

// Cache invalidation utilities
export async function invalidateUserMembershipCache(userId: string) {
  // Invalidate the specific user's membership cache
  revalidateTag('membership');
  revalidateTag('access-context');
}

// More granular cache invalidation for specific user
export async function invalidateSpecificUserCache(userId: string) {
  // This would require a more complex caching strategy with user-specific tags
  // For now, we'll invalidate the general membership cache
  revalidateTag('membership');
  revalidateTag('access-context');
}

// Export the main function for cases where you need fresh data
export { getAccessContext };