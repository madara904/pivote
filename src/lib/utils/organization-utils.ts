import { db } from "@/db";
import { eq } from "drizzle-orm";

export async function getUserActiveOrganization(userId: string) {
  try {
    const { member, organization } = await import("@/db/schema");
    
    const result = await db
      .select({
        organizationId: member.organizationId,
        organization: organization,
      })
      .from(member)
      .innerJoin(organization, eq(member.organizationId, organization.id))
      .where(eq(member.userId, userId))
      .limit(1);
    
    return result[0]?.organization || null;
  } catch (error) {
    console.error("Error getting user's active organization:", error);
    return null;
  }
} 