import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { getUserMemberships } from "./utils";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { organizationMember, user } from "@/db/schema";

export const membershipRouter = createTRPCRouter({
  getMyOrganizations: protectedProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;
    const memberships = await getUserMemberships(db, session.user.id);
    return memberships.map((m: typeof memberships[0]) => ({
      ...m.organization,
      membershipRole: m.role,
    }));
  }),
  listMembers: protectedProcedure
    .input(z.object({ organizationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const membership = await db.query.organizationMember.findFirst({
        where: and(
          eq(organizationMember.userId, session.user.id),
          eq(organizationMember.organizationId, input.organizationId),
          eq(organizationMember.isActive, true)
        ),
      });
      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Kein Zugriff auf diese Organisation.",
        });
      }

      const members = await db.query.organizationMember.findMany({
        where: and(
          eq(organizationMember.organizationId, input.organizationId),
          eq(organizationMember.isActive, true)
        ),
        with: {
          user: true,
        },
      });

      return members.map((member) => ({
        id: member.id,
        role: member.role,
        userId: member.userId,
        name: member.user?.name ?? "",
        email: member.user?.email ?? "",
      }));
    }),
  addMember: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().uuid(),
        email: z
          .string()
          .min(1, "Bitte geben Sie eine E-Mail-Adresse ein.")
          .email("Bitte geben Sie eine gültige E-Mail-Adresse ein."),
        role: z.enum(["admin", "member"]).default("member"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const owner = await db.query.organizationMember.findFirst({
        where: and(
          eq(organizationMember.userId, session.user.id),
          eq(organizationMember.organizationId, input.organizationId),
          eq(organizationMember.role, "owner"),
          eq(organizationMember.isActive, true)
        ),
      });
      if (!owner) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Nur der Besitzer kann Mitglieder hinzufügen.",
        });
      }

      const existingUser = await db.query.user.findFirst({
        where: eq(user.email, input.email),
      });

      if (!existingUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Benutzer nicht gefunden.",
        });
      }

      const existingMembership = await db.query.organizationMember.findFirst({
        where: eq(organizationMember.userId, existingUser.id),
      });
      if (existingMembership) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Dieser Benutzer ist bereits einer Organisation zugewiesen.",
        });
      }

      const [created] = await db
        .insert(organizationMember)
        .values({
          organizationId: input.organizationId,
          userId: existingUser.id,
          role: input.role,
          isActive: true,
        })
        .returning();

      return created;
    }),
  updateMemberRole: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().uuid(),
        memberId: z.string().uuid(),
        role: z.enum(["admin", "member"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const owner = await db.query.organizationMember.findFirst({
        where: and(
          eq(organizationMember.userId, session.user.id),
          eq(organizationMember.organizationId, input.organizationId),
          eq(organizationMember.role, "owner"),
          eq(organizationMember.isActive, true)
        ),
      });
      if (!owner) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Nur der Besitzer kann Rollen ändern.",
        });
      }

      const member = await db.query.organizationMember.findFirst({
        where: and(
          eq(organizationMember.id, input.memberId),
          eq(organizationMember.organizationId, input.organizationId),
          eq(organizationMember.isActive, true)
        ),
      });
      if (!member) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Mitglied nicht gefunden.",
        });
      }
      if (member.role === "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Die Besitzerrolle kann nicht geändert werden.",
        });
      }

      const [updated] = await db
        .update(organizationMember)
        .set({ role: input.role, updatedAt: new Date() })
        .where(eq(organizationMember.id, input.memberId))
        .returning();

      return updated;
    }),
  removeMember: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().uuid(),
        memberId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const owner = await db.query.organizationMember.findFirst({
        where: and(
          eq(organizationMember.userId, session.user.id),
          eq(organizationMember.organizationId, input.organizationId),
          eq(organizationMember.role, "owner"),
          eq(organizationMember.isActive, true)
        ),
      });
      if (!owner) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Nur der Besitzer kann Mitglieder entfernen.",
        });
      }

      const member = await db.query.organizationMember.findFirst({
        where: and(
          eq(organizationMember.id, input.memberId),
          eq(organizationMember.organizationId, input.organizationId),
          eq(organizationMember.isActive, true)
        ),
      });
      if (!member) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Mitglied nicht gefunden.",
        });
      }
      if (member.role === "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Der Besitzer kann nicht entfernt werden.",
        });
      }

      const [updated] = await db
        .update(organizationMember)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(organizationMember.id, input.memberId))
        .returning();

      return updated;
    }),
});