import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, eq, or, gt, lt } from "drizzle-orm";
import { randomBytes } from "crypto";
import { organizationInvitation, organizationMember, organization, user } from "@/db/schema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init";
import { env } from '@/lib/env';

// Sichere Token-Generierung
function generateSecureToken(): string {
  return randomBytes(32).toString("base64url");
}

// Token-Validierung
type InvitationWithOrg = typeof organizationInvitation.$inferSelect & {
  organization: Pick<
    typeof import("@/db/schema").organization.$inferSelect,
    "id" | "name" | "isActive"
  >;
};

async function validateInvitationToken(token: string, db: typeof import('@/db').db): Promise<InvitationWithOrg> {
  const invitation = await db.query.organizationInvitation.findFirst({
    where: and(
      eq(organizationInvitation.token, token),
      eq(organizationInvitation.status, "pending"),
      gt(organizationInvitation.expiresAt, new Date()) // Nicht abgelaufen!
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

export const organizationRouter = createTRPCRouter({
  // Mitglied einladen (nur für Admins/Owners)
  inviteMember: protectedProcedure
    .input(
      z.object({
        email: z.string().email("Ungültige E-Mail-Adresse"),
        role: z.enum(["admin", "member"]),
        organizationId: z.string().uuid(),
        jobTitle: z.string().optional(),
        department: z.string().optional(),
        inviteMessage: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 1. Berechtigung prüfen
      const membership = await ctx.db.query.organizationMember.findFirst({
        where: and(
          eq(organizationMember.userId, ctx.session.user.id),
          eq(organizationMember.organizationId, input.organizationId),
          eq(organizationMember.isActive, true),
          or(
            eq(organizationMember.role, "owner"),
            eq(organizationMember.role, "admin")
          )
        ),
      });

      if (!membership) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Keine Berechtigung zum Einladen von Mitgliedern",
        });
      }

      // 2. Prüfe ob bereits eine aktive Einladung existiert
      const existingInvitation =
        await ctx.db.query.organizationInvitation.findFirst({
          where: and(
            eq(organizationInvitation.email, input.email),
            eq(organizationInvitation.organizationId, input.organizationId),
            eq(organizationInvitation.status, "pending"),
            gt(organizationInvitation.expiresAt, new Date())
          ),
        });

      if (existingInvitation) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "Es existiert bereits eine aktive Einladung für diese E-Mail",
        });
      }

      // 3. Prüfe ob User bereits registriert und bereits in einer Org ist
      const existingUser = await ctx.db.query.user.findFirst({
        where: eq(user.email, input.email),
      });

      if (existingUser) {
        const existingMembership =
          await ctx.db.query.organizationMember.findFirst({
            where: and(
              eq(organizationMember.userId, existingUser.id),
              eq(organizationMember.isActive, true)
            ),
          });

        if (existingMembership) {
          throw new TRPCError({
            code: "CONFLICT",
            message:
              "Diese Person ist bereits Mitglied einer anderen Organisation",
          });
        }
      }

      // 4. Rate Limiting: Max 10 Einladungen pro Organisation pro Tag
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentInvitations =
        await ctx.db.query.organizationInvitation.findMany({
          where: and(
            eq(organizationInvitation.organizationId, input.organizationId),
            gt(organizationInvitation.createdAt, yesterday)
          ),
        });

      if (recentInvitations.length >= 10) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Maximale Anzahl Einladungen pro Tag erreicht (10)",
        });
      }

      // 5. Token generieren und Einladung erstellen
      const token = generateSecureToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 Tage

      const [invitation] = await ctx.db
        .insert(organizationInvitation)
        .values({
          organizationId: input.organizationId,
          email: input.email,
          invitedUserId: existingUser?.id,
          role: input.role,
          jobTitle: input.jobTitle,
          department: input.department,
          token,
          expiresAt,
          inviteMessage: input.inviteMessage,
          invitedById: ctx.session.user.id,
        })
        .returning();

      // 6. E-Mail senden würde hier passieren
      // await sendInvitationEmail({ ... });

      return {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        invitationUrl: `${env.NEXT_PUBLIC_APP_URL}/invite/${token}`,
      };
    }),

  // Einladung abrufen (öffentlich mit Token)
  getInvitation: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const invitation = await validateInvitationToken(input.token, ctx.db);

      return {
        id: invitation.id,
        organizationName: invitation.organization?.name ?? null,
        role: invitation.role,
        jobTitle: invitation.jobTitle,
        department: invitation.department,
        inviteMessage: invitation.inviteMessage,
        expiresAt: invitation.expiresAt,
        email: invitation.email,
      };
    }),

  // Einladung akzeptieren (One-Time Use mit allen Validierungen!)
  acceptInvitation: protectedProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 1. Token validieren
      const invitation = await validateInvitationToken(input.token, ctx.db);

      // 2. KRITISCHE VALIDIERUNG: E-Mail muss übereinstimmen
      if (ctx.session.user.email !== invitation.email) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Die Einladung gehört nicht zu deiner E-Mail-Adresse",
        });
      }

      // 3. Prüfe ob User bereits Mitglied einer Organisation ist
      const existingMembership = await ctx.db.query.organizationMember.findFirst({
        where: and(
          eq(organizationMember.userId, ctx.session.user.id),
          eq(organizationMember.isActive, true)
        ),
        with: {
          organization: {
            columns: { name: true },
          },
        },
      }) as (typeof organizationMember.$inferSelect & { organization: { name: string } }) | null;

      if (existingMembership) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Du bist bereits Mitglied von "${existingMembership.organization.name}"`,
        });
      }

      // 4. ONE-TIME USE: Token atomisch als "accepted" markieren
      const [updatedInvitation] = await ctx.db
        .update(organizationInvitation)
        .set({
          status: "accepted",
          acceptedAt: new Date(),
          invitedUserId: ctx.session.user.id,
        })
        .where(
          and(
            eq(organizationInvitation.id, invitation.id),
            eq(organizationInvitation.status, "pending") // Nur wenn noch pending!
          )
        )
        .returning();

      if (!updatedInvitation) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Einladung wurde bereits verwendet oder ist ungültig",
        });
      }

      // 5. Erst jetzt Mitgliedschaft erstellen
      const [membership] = await ctx.db
        .insert(organizationMember)
        .values({
          organizationId: invitation.organizationId,
          userId: ctx.session.user.id,
          role: invitation.role,
          jobTitle: invitation.jobTitle,
          department: invitation.department,
        })
        .returning();

      return {
        organizationId: membership.organizationId,
        role: membership.role,
        organizationName: invitation.organization?.name ?? null,
      };
    }),

  // Einladung ablehnen
  rejectInvitation: protectedProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const invitation = await validateInvitationToken(input.token, ctx.db);

      if (ctx.session.user.email !== invitation.email) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Die Einladung gehört nicht zu deiner E-Mail-Adresse",
        });
      }

      await ctx.db
        .update(organizationInvitation)
        .set({
          status: "rejected",
          rejectedAt: new Date(),
        })
        .where(eq(organizationInvitation.id, invitation.id));

      return { success: true };
    }),

  // Abgelaufene Einladungen cleanup (für Cron Job)
  cleanupExpiredInvitations: protectedProcedure
    .input(
      z.object({
        cronSecret: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validiere Cron Secret
      if (input.cronSecret !== env.CRON_SECRET) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const result = await ctx.db
        .update(organizationInvitation)
        .set({ status: "expired" })
        .where(
          and(
            eq(organizationInvitation.status, "pending"),
            lt(organizationInvitation.expiresAt, new Date())
          )
        )
        .returning({ id: organizationInvitation.id });

      return {
        cleaned: result.length,
        message: `${result.length} abgelaufene Einladungen bereinigt`,
      };
    }),

  // Create a new organization and attach the current user as owner
  createOrganization: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2),
        slug: z.string().min(2),
        email: z.string().email(),
        type: z.enum(["shipper", "forwarder"]).optional().default("shipper"),
        description: z.string().optional(),
        phone: z.string().optional(),
        website: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().optional(),
        vatNumber: z.string().optional(),
        registrationNumber: z.string().optional(),
        logo: z.string().optional(),
        primaryColor: z.string().optional(),
        settings: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Prevent user from owning more than one organization
      const existingOwner = await ctx.db.query.organizationMember.findFirst({
        where: and(
          eq(organizationMember.userId, ctx.session.user.id),
          eq(organizationMember.role, "owner"),
          eq(organizationMember.isActive, true)
        ),
      });
      if (existingOwner) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Du kannst nur eine Organisation besitzen.",
        });
      }
      try {
        // 1. Create the organization
        const [org] = await ctx.db.insert(organization).values({
          name: input.name,
          slug: input.slug,
          email: input.email,
          type: input.type,
          description: input.description,
          phone: input.phone,
          website: input.website,
          address: input.address,
          city: input.city,
          postalCode: input.postalCode,
          country: input.country,
          vatNumber: input.vatNumber,
          registrationNumber: input.registrationNumber,
          logo: input.logo,
          primaryColor: input.primaryColor,
          settings: input.settings,
          isActive: input.isActive,
        }).returning();

        // 2. Check if the user exists
        const dbUser = await ctx.db.query.user.findFirst({
          where: eq(user.id, ctx.session.user.id),
        });
        if (!dbUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `User with id ${ctx.session.user.id} does not exist in the database. Bitte erneut einloggen oder Support kontaktieren.`,
          });
        }

        // 3. Attach the current user as owner
        const [membership] = await ctx.db.insert(organizationMember).values({
          organizationId: org.id,
          userId: ctx.session.user.id,
          role: "owner",
          isActive: true,
        }).returning();

        return {
          organization: org,
          membership,
        };
      } catch (err: unknown) {
        console.error("DB error in createOrganization:", err);
        if (typeof err === "object" && err !== null && "code" in err) {
          const code = (err as { code?: string }).code;
          if (code === "23505") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Diese Organisation oder Mitglied existiert bereits.",
            });
          }
          if (code === "23503") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Benutzer oder Organisation nicht gefunden.",
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Ein unerwarteter Fehler ist aufgetreten.",
        });
      }
    }),

  // Edit (update) organization - only owner can edit
  editOrganization: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().uuid(),
        name: z.string().min(2).optional(),
        slug: z.string().min(2).optional(),
        email: z.string().email().optional(),
        type: z.enum(["shipper", "forwarder"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user is owner of the organization
        const membership = await ctx.db.query.organizationMember.findFirst({
          where: and(
            eq(organizationMember.userId, ctx.session.user.id),
            eq(organizationMember.organizationId, input.organizationId),
            eq(organizationMember.role, "owner"),
            eq(organizationMember.isActive, true)
          ),
        });
        if (!membership) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Nur der Besitzer kann die Organisation bearbeiten.",
          });
        }
        // Update organization
        const [updated] = await ctx.db
          .update(organization)
          .set({
            ...(input.name && { name: input.name }),
            ...(input.slug && { slug: input.slug }),
            ...(input.email && { email: input.email }),
            ...(input.type && { type: input.type }),
            updatedAt: new Date(),
          })
          .where(eq(organization.id, input.organizationId))
          .returning();
        if (!updated) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Organisation nicht gefunden.",
          });
        }
        return updated;
      } catch (err: unknown) {
        console.error("DB error in editOrganization:", err);
        if (typeof err === "object" && err !== null && "code" in err) {
          const code = (err as { code?: string }).code;
          if (code === "23505") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Slug oder Email ist bereits vergeben.",
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Ein unerwarteter Fehler ist aufgetreten.",
        });
      }
    }),

  // Delete organization - only owner can delete, removes all members (cascade)
  deleteOrganization: protectedProcedure
    .input(z.object({ organizationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user is owner of the organization
        const membership = await ctx.db.query.organizationMember.findFirst({
          where: and(
            eq(organizationMember.userId, ctx.session.user.id),
            eq(organizationMember.organizationId, input.organizationId),
            eq(organizationMember.role, "owner"),
            eq(organizationMember.isActive, true)
          ),
        });
        if (!membership) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Nur der Besitzer kann die Organisation löschen.",
          });
        }
        // Delete organization (cascades to members)
        const [deleted] = await ctx.db
          .delete(organization)
          .where(eq(organization.id, input.organizationId))
          .returning();
        if (!deleted) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Organisation nicht gefunden.",
          });
        }
        return { success: true };
      } catch (err: unknown) {
        console.error("DB error in deleteOrganization:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Ein unerwarteter Fehler ist aufgetreten.",
        });
      }
    }),

  getMyOrganizations: protectedProcedure
    .query(async ({ ctx }) => {
      const memberships = await ctx.db.query.organizationMember.findMany({
        where: eq(organizationMember.userId, ctx.session.user.id),
        with: {
          organization: true,
        },
      });
      return memberships.map(m => m.organization);
    }),
});
