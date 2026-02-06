import { organizationMember } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "@/db/schema";

export async function getUserMemberships(
  db: PostgresJsDatabase<typeof schema>,
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
