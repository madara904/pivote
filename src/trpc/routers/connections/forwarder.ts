import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { organization, organizationConnection, organizationMember, activityEvent, user } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { sendEmail } from "@/lib/send-email";
import { ConnectionAccepted } from "@/emails/connection-accepted";
import { createElement } from "react";
import { env } from "@/lib/env/env";
import { checkConnectionLimit } from "@/trpc/middleware/tier-limits";
import { db } from "@/db";

async function requireForwarderMembership(ctx: { db: typeof db; session: { user: { id: string } } }) {
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

  if (membership.organization.type !== "forwarder") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Nur Spediteure können Verbindungen verwalten.",
    });
  }

  return {
    membership,
    organization: membership.organization,
    canManage: membership.role === "owner" || membership.role === "admin",
  };
}

export const forwarderConnectionsRouter = createTRPCRouter({
  listPendingInvites: protectedProcedure.query(async ({ ctx }) => {
    const { organization: forwarderOrganization, canManage } =
      await requireForwarderMembership(ctx);

    const connections = await ctx.db.query.organizationConnection.findMany({
      where: and(
        eq(
          organizationConnection.forwarderOrganizationId,
          forwarderOrganization.id
        ),
        eq(organizationConnection.status, "pending")
      ),
      with: {
        shipperOrganization: {
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
        shipper: connection.shipperOrganization,
      })),
    };
  }),

  listConnectedShippers: protectedProcedure.query(async ({ ctx }) => {
    const { organization: forwarderOrganization, canManage } =
      await requireForwarderMembership(ctx);

    const connections = await ctx.db.query.organizationConnection.findMany({
      where: and(
        eq(
          organizationConnection.forwarderOrganizationId,
          forwarderOrganization.id
        ),
        eq(organizationConnection.status, "connected")
      ),
      with: {
        shipperOrganization: {
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
        shipper: connection.shipperOrganization,
      })),
    };
  }),

  acceptInvitation: protectedProcedure
    .input(z.object({ connectionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { organization: forwarderOrganization, canManage } =
        await requireForwarderMembership(ctx);

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
            organizationConnection.forwarderOrganizationId,
            forwarderOrganization.id
          ),
          eq(organizationConnection.status, "pending")
        ),
        with: {
          shipperOrganization: true,
          invitedBy: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!connection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Einladung nicht gefunden.",
        });
      }

      const connectionLimit = await checkConnectionLimit(
        ctx,
        forwarderOrganization.id,
        "forwarder",
        connection.id
      );
      if (!connectionLimit.allowed) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: connectionLimit.reason ?? "Verbindungs-Limit erreicht.",
        });
      }

      const [updated] = await ctx.db
        .update(organizationConnection)
        .set({
          status: "connected",
          acceptedAt: new Date(),
          acceptedById: ctx.session.user.id,
          updatedAt: new Date(),
        })
        .where(eq(organizationConnection.id, connection.id))
        .returning();

      const acceptedUrl = `${env.NEXT_PUBLIC_APP_URL}/dashboard/shipper`;
      let recipients: string[] = [];
      if (connection.invitedBy?.email) {
        recipients = [connection.invitedBy.email];
      } else {
        const ownerMembers = await ctx.db.query.organizationMember.findMany({
          where: and(
            eq(organizationMember.organizationId, connection.shipperOrganization.id),
            eq(organizationMember.role, "owner"),
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
        recipients = ownerMembers
          .map((member) => member.user?.email)
          .filter((email): email is string => Boolean(email));
      }

      recipients = Array.from(new Set(recipients));

      if (recipients.length) {
        await Promise.all(
          recipients.map((email) =>
            sendEmail({
              to: email,
              subject: "Verbindung angenommen",
              react: createElement(ConnectionAccepted, {
                forwarderName: forwarderOrganization.name,
                dashboardUrl: acceptedUrl,
              }),
            })
          )
        );
      }

      await ctx.db.insert(activityEvent).values({
        organizationId: forwarderOrganization.id,
        actorUserId: ctx.session.user.id,
        type: "connection.accepted",
        entityType: "connection",
        entityId: connection.id,
        payload: {
          shipperOrgId: connection.shipperOrganization.id,
          shipperOrgName: connection.shipperOrganization.name,
        },
      });

      return updated;
    }),

  removeConnection: protectedProcedure
    .input(z.object({ connectionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { organization: forwarderOrganization, canManage } =
        await requireForwarderMembership(ctx);

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
            organizationConnection.forwarderOrganizationId,
            forwarderOrganization.id
          )
        ),
        with: {
          shipperOrganization: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
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
        organizationId: forwarderOrganization.id,
        actorUserId: ctx.session.user.id,
        type: "connection.removed",
        entityType: "connection",
        entityId: connection.id,
        payload: {
          shipperOrgId: connection.shipperOrganization?.id,
          shipperOrgName: connection.shipperOrganization?.name,
        },
      });

      return { success: true };
    }),
});
