
import { TRPCError } from "@trpc/server";
import { t } from "@/trpc/init";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const requireForwarderOrg = t.middleware(async ({ ctx, next }) => {
  // Get fresh session to ensure we have orgType
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user?.orgType) {
    throw new TRPCError({ code: "FORBIDDEN", message: "No organization found" });
  }
  
  if (session.user.orgType !== "forwarder") {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: `Must be forwarder, but you are ${session.user.orgType}` 
    });
  }
  
  // Pass org info to downstream procedures (NO DB QUERY!)
  return next({ 
    ctx: { 
      ...ctx, 
      orgType: session.user.orgType,
      // Remove the old membership DB query pattern entirely
    } 
  });
});

export const requireShipperOrg = t.middleware(async ({ ctx, next }) => {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user?.orgType) {
    throw new TRPCError({ code: "FORBIDDEN", message: "No organization found" });
  }
  
  if (session.user.orgType !== "shipper") {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: `Must be shipper, but you are ${session.user.orgType}` 
    });
  }
  
  return next({ 
    ctx: { 
      ...ctx, 
      orgType: session.user.orgType,
    } 
  });
});