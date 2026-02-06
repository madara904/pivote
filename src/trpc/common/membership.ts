import { organizationMember, organization } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";

export async function requireOrgId(ctx: { db: typeof db; session: { user: { id: string } } }): Promise<string> {
  const { db, session } = ctx;
  const membershipResult = await db
    .select({ organizationId: organizationMember.organizationId })
    .from(organizationMember)
    .where(and(
      eq(organizationMember.userId, session.user.id),
      eq(organizationMember.isActive, true)
    ))
    .limit(1);

  if (!membershipResult.length) {
    throw new Error("Benutzer ist nicht Teil einer Organisation");
  }

  return membershipResult[0].organizationId;
}

export async function requireOrgAndType(ctx: { db: typeof db; session: { user: { id: string } } }): Promise<{ organizationId: string; organizationType: string; }> {
  const { db, session } = ctx;
  const membershipResult = await db
    .select({
      organizationId: organizationMember.organizationId,
      organizationType: organization.type,
    })
    .from(organizationMember)
    .innerJoin(organization, eq(organizationMember.organizationId, organization.id))
    .where(and(
      eq(organizationMember.userId, session.user.id),
      eq(organizationMember.isActive, true)
    ))
    .limit(1);

  if (!membershipResult.length) {
    throw new Error("Benutzer ist nicht Teil einer Organisation");
  }

  return membershipResult[0];
}


