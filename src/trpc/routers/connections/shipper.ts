import { createTRPCRouter, protectedProcedure, TRPCContext } from "@/trpc/init";
import { organization, organizationConnection, organizationMember } from "@/db/schema";
import { and, eq, notInArray, sql, desc } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { sendEmail } from "@/lib/send-email";
import { env } from "@/lib/env/env";

async function requireShipperMembership(ctx: TRPCContext) {
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
      const emailBody = `
        <p>Sie wurden von <strong>${shipperOrganization.name}</strong> eingeladen, eine Verbindung aufzubauen.</p>
        <p>Bitte öffnen Sie den folgenden Link, um die Einladung anzunehmen:</p>
        <p><a href="${inviteUrl}">${inviteUrl}</a></p>
      `;

      await sendEmail({
        to: forwarder.email,
        subject: "Neue Verbindungsanfrage",
        text: emailBody,
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

      return { success: true };
    }),
});
