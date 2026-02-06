import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { organization, organizationConnection, organizationMember } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { sendEmail } from "@/lib/send-email";
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
      const emailBody = `
        <p><strong>${forwarderOrganization.name}</strong> hat die Verbindung angenommen.</p>
        <p>Sie können nun Anfragen an diesen Spediteur senden.</p>
        <p><a href="${acceptedUrl}">${acceptedUrl}</a></p>
      `;

      await sendEmail({
        to: connection.shipperOrganization.email,
        subject: "Verbindung angenommen",
        text: emailBody,
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
