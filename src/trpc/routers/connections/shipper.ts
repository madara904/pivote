import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { organization, organizationConnection, organizationMember, activityEvent } from "@/db/schema";
import { and, eq, notInArray, sql, desc } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { sendEmail } from "@/lib/send-email";
import { ConnectionInvite } from "@/emails/connection-invite";
import { createElement } from "react";
import { env } from "@/lib/env/env";
import { checkConnectionLimit } from "@/trpc/middleware/tier-limits";
import { db } from "@/db";

async function requireShipperMembership(ctx: { db: typeof db; session: { user: { id: string } } }) {
  const membership = await ctx.db.query.organizationMember.findFirst({
    where: and(
      eq(organizationMember.userId, ctx.session.user.id),
      eq(organizationMember.isActive, true)
    ),
    with: {
      organization: true,
    },
  });

  if (!membership?.organization) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Organisation nicht gefunden.",
    });
  }

  if (membership.organization.type !== "shipper") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Nur Versender können Verbindungen verwalten.",
    });
  }

  return {
    membership,
    organization: membership.organization,
    canManage: membership.role === "owner" || membership.role === "admin",
  };
}

export const shipperConnectionsRouter = createTRPCRouter({
  listConnectedForwarders: protectedProcedure.query(async ({ ctx }) => {
    const { organization, canManage } = await requireShipperMembership(ctx);

    const connections = await ctx.db.query.organizationConnection.findMany({
      where: and(
        eq(organizationConnection.shipperOrganizationId, organization.id),
        eq(organizationConnection.status, "connected")
      ),
      with: {
        forwarderOrganization: {
          columns: {
            id: true,
            name: true,
            email: true,
            city: true,
            country: true,
            postalCode: true,
            logo: true,
          },
        },
      },
      orderBy: [desc(organizationConnection.acceptedAt)],
    });

    return {
      canManage,
      items: connections.map((connection) => ({
        id: connection.id,
        status: connection.status,
        acceptedAt: connection.acceptedAt,
        forwarder: connection.forwarderOrganization,
      })),
    };
  }),

  listPendingInvites: protectedProcedure.query(async ({ ctx }) => {
    const { organization, canManage } = await requireShipperMembership(ctx);

    const connections = await ctx.db.query.organizationConnection.findMany({
      where: and(
        eq(organizationConnection.shipperOrganizationId, organization.id),
        eq(organizationConnection.status, "pending")
      ),
      with: {
        forwarderOrganization: {
          columns: {
            id: true,
            name: true,
            email: true,
            city: true,
            country: true,
            postalCode: true,
            logo: true,
          },
        },
      },
      orderBy: [desc(organizationConnection.createdAt)],
    });

    return {
      canManage,
      items: connections.map((connection) => ({
        id: connection.id,
        status: connection.status,
        invitedAt: connection.createdAt,
        forwarder: connection.forwarderOrganization,
      })),
    };
  }),

  listRecommendedForwarders: protectedProcedure.query(async ({ ctx }) => {
    const { organization: shipperOrganization, canManage } =
      await requireShipperMembership(ctx);

    const existingConnections = await ctx.db
      .select({
        forwarderOrganizationId: organizationConnection.forwarderOrganizationId,
      })
      .from(organizationConnection)
      .where(
        eq(organizationConnection.shipperOrganizationId, shipperOrganization.id)
      );

    const excludedIds = existingConnections.map(
      (connection) => connection.forwarderOrganizationId
    );

    const filters = [
      eq(organization.type, "forwarder"),
      eq(organization.isActive, true),
    ];

    const normalizedPostalCode = shipperOrganization.postalCode
      ? shipperOrganization.postalCode.replace(/\D/g, "")
      : "";
    const postalPrefix =
      normalizedPostalCode.length >= 2
        ? normalizedPostalCode.slice(0, 2)
        : "";

    if (postalPrefix) {
      filters.push(
        sql`regexp_replace(${organization.postalCode}, '[^0-9]', '', 'g') LIKE ${postalPrefix + "%"}`
      );
    } else {
      return { canManage, items: [] };
    }

    if (excludedIds.length) {
      filters.push(notInArray(organization.id, excludedIds));
    }

    const forwarders = await ctx.db
      .select({
        id: organization.id,
        name: organization.name,
        email: organization.email,
        city: organization.city,
        country: organization.country,
        postalCode: organization.postalCode,
        logo: organization.logo,
      })
      .from(organization)
      .where(and(...filters))
      .orderBy(sql`random()`)
      .limit(12);

    return {
      canManage,
      items: forwarders,
    };
  }),

  inviteForwarder: protectedProcedure
    .input(z.object({ forwarderOrganizationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { organization: shipperOrganization, canManage } =
        await requireShipperMembership(ctx);

      if (!canManage) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Nur Admins können Verbindungen verwalten.",
        });
      }

      const connectionLimit = await checkConnectionLimit(
        ctx,
        shipperOrganization.id,
        "shipper"
      );
      if (!connectionLimit.allowed) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: connectionLimit.reason ?? "Verbindungs-Limit erreicht.",
        });
      }

      if (shipperOrganization.id === input.forwarderOrganizationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Organisation kann nicht mit sich selbst verbunden werden.",
        });
      }

      const forwarder = await ctx.db.query.organization.findFirst({
        where: and(
          eq(organization.id, input.forwarderOrganizationId),
          eq(organization.type, "forwarder")
        ),
      });

      if (!forwarder) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Spediteur nicht gefunden.",
        });
      }

      const existing = await ctx.db.query.organizationConnection.findFirst({
        where: and(
          eq(organizationConnection.shipperOrganizationId, shipperOrganization.id),
          eq(
            organizationConnection.forwarderOrganizationId,
            input.forwarderOrganizationId
          )
        ),
      });

      if (existing) {
        if (existing.status === "pending") {
          return {
            alreadyInvited: true,
            status: existing.status,
            connectionId: existing.id,
          };
        }

        throw new TRPCError({
          code: "CONFLICT",
          message: "Diese Verbindung besteht bereits.",
        });
      }

      const [created] = await ctx.db
        .insert(organizationConnection)
        .values({
          shipperOrganizationId: shipperOrganization.id,
          forwarderOrganizationId: input.forwarderOrganizationId,
          status: "pending",
          invitedById: ctx.session.user.id,
        })
        .returning();

      const inviteUrl = `${env.NEXT_PUBLIC_APP_URL}/dashboard/forwarder/verbindungen`;

      const ownerMembers = await ctx.db.query.organizationMember.findMany({
        where: and(
          eq(organizationMember.organizationId, forwarder.id),
          eq(organizationMember.role, "owner"),
          eq(organizationMember.isActive, true)
        ),
        with: {
          user: true,
        },
      });

      const ownerEmails = ownerMembers
        .map((member) => member.user?.email)
        .filter((email): email is string => Boolean(email));

      let recipients = ownerEmails;
      if (!recipients.length) {
        const activeMembers = await ctx.db.query.organizationMember.findMany({
          where: and(
            eq(organizationMember.organizationId, forwarder.id),
            eq(organizationMember.isActive, true)
          ),
          with: {
            user: {
              columns: {
                email: true,
              },
            },
          },
        });
        recipients = activeMembers
          .map((member) => member.user?.email)
          .filter((email): email is string => Boolean(email));
      }

      recipients = Array.from(new Set(recipients));

      if (recipients.length) {
        await Promise.all(
          recipients.map((email) =>
            sendEmail({
              to: email,
              subject: "Neue Verbindungsanfrage",
              react: createElement(ConnectionInvite, {
                shipperName: shipperOrganization.name,
                inviteUrl,
              }),
            })
          )
        );
      }

      await ctx.db.insert(activityEvent).values({
        organizationId: input.forwarderOrganizationId,
        actorUserId: ctx.session.user.id,
        type: "connection.requested",
        entityType: "connection",
        entityId: created.id,
        payload: {
          shipperOrgId: shipperOrganization.id,
          shipperOrgName: shipperOrganization.name,
        },
      });

      return {
        alreadyInvited: false,
        status: created.status,
        connectionId: created.id,
      };
    }),

  removeConnection: protectedProcedure
    .input(z.object({ connectionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { organization: shipperOrganization, canManage } =
        await requireShipperMembership(ctx);

      if (!canManage) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Nur Admins können Verbindungen verwalten.",
        });
      }

      const connection = await ctx.db.query.organizationConnection.findFirst({
        where: and(
          eq(organizationConnection.id, input.connectionId),
          eq(
            organizationConnection.shipperOrganizationId,
            shipperOrganization.id
          )
        ),
      });

      if (!connection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Verbindung nicht gefunden.",
        });
      }

      await ctx.db
        .delete(organizationConnection)
        .where(eq(organizationConnection.id, connection.id));

      await ctx.db.insert(activityEvent).values({
        organizationId: connection.forwarderOrganizationId,
        actorUserId: ctx.session.user.id,
        type: "connection.removed",
        entityType: "connection",
        entityId: connection.id,
        payload: {
          shipperOrgId: shipperOrganization.id,
          shipperOrgName: shipperOrganization.name,
        },
      });

      return { success: true };
    }),
});
