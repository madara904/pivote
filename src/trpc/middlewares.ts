import { TRPCError } from "@trpc/server";
import { t } from "@/trpc/init";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const requireOrgType = (requiredType: "forwarder" | "shipper") =>
  t.middleware(async ({ ctx, next }) => {
    // Get fresh session to ensure we have orgType
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.session.orgType) {
      throw new TRPCError({ code: "FORBIDDEN", message: "No organization found" });
    }
    
    if (session?.session.orgType !== requiredType) {
      throw new TRPCError({ 
        code: "FORBIDDEN", 
        message: `Must be ${requiredType}, but you are ${session?.session.orgType}` 
      });
    }
    
    return next({ 
      ctx: { 
        ...ctx, 
        org: { type: session?.session.orgType }
      } 
    });
  });