import type { TRPCContext } from "@/trpc/init";
import { organizationMember } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function getUserMemberships(
  db: TRPCContext["db"],
  userId: string
) {
  return db.query.organizationMember.findMany({
    where: and(
      eq(organizationMember.userId, userId),
      eq(organizationMember.isActive, true)
    ),
    with: {
      organization: true,
    },
  });
}
