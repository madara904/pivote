import { TRPCError } from "@trpc/server";
import { t } from "@/trpc/init";
import { getUserMemberships } from "./routers/organizations/utils";

export const requireOrgType = (requiredType: "forwarder" | "shipper") =>
  t.middleware(async ({ ctx, next }) => {
    const memberships = await getUserMemberships(ctx.db, ctx.session.user.id);
    const membership = memberships.find(m => m.organization?.type === requiredType);
    if (!membership) {
      throw new TRPCError({ code: "FORBIDDEN", message: `Must be ${requiredType}` });
    }
    // Optionally, pass org to downstream procedures
    return next({ ctx: { ...ctx, org: membership.organization } });
  }); 