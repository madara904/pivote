import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { organizationMember } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag, unstable_cache } from "next/cache";

// Cache the session lookup with headers passed as parameter
const getSessionCached = unstable_cache(
  async (headersList: Headers) => {
    return auth.api.getSession({ headers: headersList });
  },
  ['user-session'],
  { 
    revalidate: 24 * 60 * 60, // 24 hours - cache until logout
    tags: ['session']
  }
);

// Cache membership lookup - extended duration since users shouldn't change org
const getMembershipCached = unstable_cache(
  async (userId: string) => {
    return db.query.organizationMember.findFirst({
      where: eq(organizationMember.userId, userId),
      with: { organization: true },
    });
  },
  ['user-membership'],
  { 
    revalidate: 24 * 60 * 60, // 24 hours - cache until logout
    tags: ['membership']
  }
);

// Combined cached function - headers passed as parameter
const getFullUserContextCached = unstable_cache(
  async (headersList: Headers) => {
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user?.id) {
      return null;
    }

    const membership = await db.query.organizationMember.findFirst({
      where: eq(organizationMember.userId, session.user.id),
      with: { organization: true },
    });

    return {
      user: session.user,
      organization: membership?.organization ?? null,
    };
  },
  ['full-user-context'],
  { 
    revalidate: 24 * 60 * 60, // 24 hours - cache until logout
    tags: ['session', 'membership']
  }
);

type AccessContext = {
  user: NonNullable<Awaited<ReturnType<typeof getSessionCached>>>["user"];
  organization: NonNullable<
    Awaited<ReturnType<typeof getMembershipCached>>
  >["organization"] | null;
};

type AccessCondition = {
  check: (ctx: AccessContext) => boolean;
  redirectTo: string | ((ctx: AccessContext) => string);
};

// Get headers outside cache and pass them in
async function getAccessContext(): Promise<AccessContext | null> {
  const headersList = await headers();
  return await getFullUserContextCached(headersList);
}

export async function requireAccess(conditions: AccessCondition[]) {
  const ctx = await getAccessContext();
  
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
  const ctx = await getAccessContext();
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
export function invalidateSession() {
  // This would need to be called after login/logout
  // revalidateTag('session');
}

export function invalidateMembership() {
  // Call this when you need to force refresh membership data
  // Usually not needed since cache is set to 24 hours and invalidates on logout
  revalidateTag('membership');
}

export { getAccessContext, getAccessContextWithRedirect };