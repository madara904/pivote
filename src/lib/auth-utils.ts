import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// Types
type AccessContext = {
  user: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>["user"];
  orgType: "shipper" | "forwarder" | null;
};

type AccessCondition = {
  check: (ctx: AccessContext) => boolean;
  redirectTo: string | ((ctx: AccessContext) => string);
};

// Main function to get access context from session only
async function getAccessContext(): Promise<AccessContext | null> {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user?.id) {
    return null;
  }

  return {
    user: session.user,
    orgType: session.user.orgType as "shipper" | "forwarder" | null
  };
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
  
  if (!ctx.orgType) {
    redirect("/onboarding");
  }
  
  if (ctx.orgType !== "forwarder") {
    redirect(`/dashboard/${ctx.orgType}`);
  }
  
  return ctx;
}

export async function requireShipperAccess() {
  const ctx = await getAccessContextWithRedirect();
  
  if (!ctx.orgType) {
    redirect("/onboarding");
  }
  
  if (ctx.orgType !== "shipper") {
    redirect(`/dashboard/${ctx.orgType}`);
  }
  
  return ctx;
}

export async function requireNoOrganization() {
  const ctx = await getAccessContextWithRedirect();
  
  if (ctx.orgType) {
    redirect("/dashboard");
  }
  
  return ctx;
}

export async function requireAnyOrganizationAccess(): Promise<
  Omit<AccessContext, "orgType"> & { orgType: NonNullable<AccessContext["orgType"]> }
> {
  const ctx = await getAccessContextWithRedirect();
  
  if (!ctx.orgType) {
    redirect("/onboarding");
  }
  
  return ctx as Omit<AccessContext, "orgType"> & { 
    orgType: NonNullable<AccessContext["orgType"]> 
  };
}

// Helper function to get current user's organization type
export async function getCurrentUserOrgType(): Promise<"shipper" | "forwarder" | null> {
  const ctx = await getAccessContext();
  return ctx?.orgType || null;
}

// Helper function to check if user has specific organization type
export async function hasOrgType(type: "shipper" | "forwarder"): Promise<boolean> {
  const orgType = await getCurrentUserOrgType();
  return orgType === type;
}
