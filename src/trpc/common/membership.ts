import { TRPCContext } from "@/trpc/init";
import { organizationMember, organization } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function requireOrgId(ctx: TRPCContext): Promise<string> {
  const { db, session } = ctx;
  const membershipResult = await db
    .select({ organizationId: organizationMember.organizationId })
    .from(organizationMember)
    .where(eq(organizationMember.userId, session.user.id))
    .limit(1);

  if (!membershipResult.length) {
    throw new Error("Benutzer ist nicht Teil einer Organisation");
  }

  return membershipResult[0].organizationId;
}

export async function requireOrgAndType(ctx: TRPCContext): Promise<{ organizationId: string; organizationType: string; }> {
  const { db, session } = ctx;
  const membershipResult = await db
    .select({
      organizationId: organizationMember.organizationId,
      organizationType: organization.type,
    })
    .from(organizationMember)
    .innerJoin(organization, eq(organizationMember.organizationId, organization.id))
    .where(eq(organizationMember.userId, session.user.id))
    .limit(1);

  if (!membershipResult.length) {
    throw new Error("Benutzer ist nicht Teil einer Organisation");
  }

  return membershipResult[0];
}


