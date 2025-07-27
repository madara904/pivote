import { randomBytes } from "crypto";
import { TRPCError } from "@trpc/server";
import { and, eq, gt } from "drizzle-orm";
import { organizationInvitation } from "@/db/schema";
import { organizationMember } from "@/db/schema";

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function generateSecureToken(): string {
  return randomBytes(32).toString("base64url");
}

export type InvitationWithOrg = typeof organizationInvitation.$inferSelect & {
  organization: Pick<
    typeof import("@/db/schema").organization.$inferSelect,
    "id" | "name" | "isActive"
  >;
};

export async function validateInvitationToken(
  token: string,
  db: typeof import("@/db").db
): Promise<InvitationWithOrg> {
  const invitation = await db.query.organizationInvitation.findFirst({
    where: and(
      eq(organizationInvitation.token, token),
      eq(organizationInvitation.status, "pending"),
      gt(organizationInvitation.expiresAt, new Date())
    ),
    with: {
      organization: {
        columns: {
          id: true,
          name: true,
          isActive: true,
        },
      },
    },
  });

  if (!invitation) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Einladung nicht gefunden oder bereits abgelaufen",
    });
  }

  return invitation as InvitationWithOrg;
}

export async function getUserMemberships(db: typeof import('@/db').db, userId: string) {
  return db.query.organizationMember.findMany({
    where: eq(organizationMember.userId, userId),
    with: { organization: true },
  });
} 