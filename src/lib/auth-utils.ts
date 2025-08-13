import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { organizationMember } from "@/db/schema";
import { eq } from "drizzle-orm";

async function getSessionSafe() {
  return auth.api.getSession({ headers: await headers() });
}

async function getMembership(userId: string) {
  return db.query.organizationMember.findFirst({
    where: eq(organizationMember.userId, userId),
    with: { organization: true },
  });
}

type AccessContext = {
  user: NonNullable<Awaited<ReturnType<typeof getSessionSafe>>>["user"];
  organization: NonNullable<
    Awaited<ReturnType<typeof getMembership>>
  >["organization"] | null;
};

type AccessCondition = {
  check: (ctx: AccessContext) => boolean;
  redirectTo: string | ((ctx: AccessContext) => string);
};

export async function requireAccess(conditions: AccessCondition[]) {
  const session = await getSessionSafe();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const membership = await getMembership(session.user.id);
  const ctx: AccessContext = {
    user: session.user, // hier weiß TS: session ist nicht null
    organization: membership?.organization ?? null,
  };

  for (const { check, redirectTo } of conditions) {
    if (!check(ctx)) {
      const target =
        typeof redirectTo === "function" ? redirectTo(ctx) : redirectTo;
      redirect(target);
    }
  }

  return ctx;
}

// Beispiele

export async function requireForwarderAccess() {
  return requireAccess([
    {
      check: (ctx) => !!ctx.organization,
      redirectTo: "/onboarding",
    },
    {
      check: (ctx) => ctx.organization?.type === "forwarder",
      redirectTo: (ctx) => `/dashboard/${ctx.organization?.type}`,
    },
  ]);
}

export async function requireShipperAccess() {
  return requireAccess([
    {
      check: (ctx) => !!ctx.organization,
      redirectTo: "/onboarding",
    },
    {
      check: (ctx) => ctx.organization?.type === "shipper",
      redirectTo: (ctx) => `/dashboard/${ctx.organization?.type}`,
    },
  ]);
}
export async function requireNoOrganization() {
  return requireAccess([
    {
      check: (ctx) => !ctx.organization, // true wenn keine Org
      redirectTo: "/dashboard",
    },
  ]);
}
export async function requireAnyOrganizationAccess(): Promise<
  Omit<AccessContext, "organization"> & { organization: NonNullable<AccessContext["organization"]> }
> {
  return requireAccess([
    {
      check: (ctx) => !!ctx.organization,
      redirectTo: "/onboarding",
    },
  ]) as Promise<
    Omit<AccessContext, "organization"> & { organization: NonNullable<AccessContext["organization"]> }
  >;
}