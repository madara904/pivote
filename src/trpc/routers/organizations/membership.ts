import { protectedProcedure, createTRPCRouter, TRPCContext } from "@/trpc/init";
import { getUserMemberships } from "./utils";

export const membershipRouter = createTRPCRouter({
  getMyOrganizations: protectedProcedure.query(async ({ ctx }: { ctx: TRPCContext }) => {
    const { db, session } = ctx;
    const memberships = await getUserMemberships(db, session.user.id);
    return memberships.map((m) => m.organization);
  }),
}); 