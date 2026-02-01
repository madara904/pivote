import { cache } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { buildSignInUrl } from "@/lib/redirect-utils";
import { getCurrentPath } from "@/lib/redirect-utils-server";

// Types
type AccessContext = {
  user: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>["user"];
  orgType: "shipper" | "forwarder" | null;
};

// Main function to get access context from session only
// Cached to deduplicate session calls within the same request/render
const getAccessContext = cache(async (): Promise<AccessContext | null> => {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user?.id) {
    return null;
  }

  return {
    user: session.user,
    orgType: session.user.orgType === "NULL" || session.user.orgType === null || session.user.orgType === undefined 
      ? null 
      : session.user.orgType as "shipper" | "forwarder"
  };
});

async function getAccessContextWithRedirect(): Promise<AccessContext> {
  const ctx = await getAccessContext();
  if (!ctx) {
    const currentPath = await getCurrentPath();
    redirect(buildSignInUrl(currentPath));
  }
  return ctx;
}

export async function requireForwarderAccess() {
  const ctx = await getAccessContextWithRedirect();
  
  // Fixed: Check if user has no organization type
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
  
  // Fixed: Check if user has no organization type
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

