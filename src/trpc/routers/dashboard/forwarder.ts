import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq, and, sql, desc } from "drizzle-orm";
import { activityEvent, inquiryForwarder, organizationMember, inquiry, organization, subscription, user } from "@/db/schema";
import { requireOrgAndType } from "@/trpc/common/membership";
import { z } from "zod";

export const forwarderDashboardRouter = createTRPCRouter({
  getActivityFeed: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).optional() }).optional())
    .query(async ({ ctx, input }) => {
      const membership = await requireOrgAndType(ctx);
      if (membership.organizationType !== "forwarder") {
        throw new Error("Nur Spediteure können Aktivitäten abrufen");
      }

      const limit = input?.limit ?? 10;

      const rows = await ctx.db
        .select({
          id: activityEvent.id,
          type: activityEvent.type,
          createdAt: activityEvent.createdAt,
          payload: activityEvent.payload,
          actorName: user.name,
        })
        .from(activityEvent)
        .leftJoin(user, eq(activityEvent.actorUserId, user.id))
        .where(eq(activityEvent.organizationId, membership.organizationId))
        .orderBy(desc(activityEvent.createdAt))
        .limit(limit);

      return rows.map((row) => ({
        id: row.id,
        type: row.type,
        createdAt: row.createdAt,
        payload: row.payload ?? null,
        actorName: row.actorName ?? null,
      }));
    }),
  getOverview: protectedProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;
    
    const membership = await requireOrgAndType(ctx);
    if (membership.organizationType !== "forwarder") {
      throw new Error("Nur Spediteure können Dashboard-Daten abrufen");
    }

    // Get organization
    const orgResult = await db.query.organization.findFirst({
      where: eq(organization.id, membership.organizationId),
      columns: {
        id: true,
        name: true,
        logo: true,
      },
    });

    if (!orgResult) {
      throw new Error("Organisation nicht gefunden");
    }

    // Get subscription separately
    const subscriptionResult = await db.query.subscription.findFirst({
      where: eq(subscription.organizationId, membership.organizationId),
      columns: {
        tier: true,
      },
    });

    // Get transport analysis - group inquiries by service type
    // Include all inquiries that were sent to this forwarder (not just "open")
    // Exclude only cancelled/expired inquiries
    const transportAnalysisResult = await db
      .select({
        serviceType: inquiry.serviceType,
        count: sql<number>`count(${inquiry.id})::int`,
      })
      .from(inquiryForwarder)
      .innerJoin(inquiry, eq(inquiryForwarder.inquiryId, inquiry.id))
      .where(
        and(
          eq(inquiryForwarder.forwarderOrganizationId, membership.organizationId),
          sql`${inquiry.status} NOT IN ('cancelled', 'expired')`
        )
      )
      .groupBy(inquiry.serviceType);

    const totalInquiries = transportAnalysisResult.reduce((sum, item) => sum + item.count, 0);

    // Build transport analysis object with percentages
    const transportAnalysis = {
      air_freight: { count: 0, percentage: 0 },
      sea_freight: { count: 0, percentage: 0 },
      road_freight: { count: 0, percentage: 0 },
      rail_freight: { count: 0, percentage: 0 },
    };

    transportAnalysisResult.forEach((item) => {
      const serviceType = item.serviceType as keyof typeof transportAnalysis;
      if (serviceType in transportAnalysis) {
        transportAnalysis[serviceType] = {
          count: item.count,
          percentage: totalInquiries > 0 ? Math.round((item.count / totalInquiries) * 100) : 0,
        };
      }
    });

    const activeInquiriesCount = await db
  .select({ count: sql<number>`count(*)::int` })
  .from(inquiryForwarder)
  .innerJoin(inquiry, eq(inquiryForwarder.inquiryId, inquiry.id))
  .where(
    and(
      eq(inquiryForwarder.forwarderOrganizationId, membership.organizationId),
      eq(inquiry.status, 'open')
    )
  );

  let systemStatus: "Healthy" | "Degraded" | "Down" = "Healthy";
  let dbResponseTime = 0;
  
  try {
    const dbStart = Date.now();
    await db.execute(sql`SELECT 1`);
    dbResponseTime = Date.now() - dbStart;
    
    if (dbResponseTime > 1000) {
      systemStatus = "Degraded";
    }
  } catch (error) {
    systemStatus = "Down";
  }

  return {
    organization: {
      id: orgResult.id,
      name: orgResult.name,
      logo: orgResult.logo,
    },
    tier: (subscriptionResult?.tier || "basic") as "basic" | "medium" | "advanced",
    transportAnalysis,
    stats: {
      activeInquiries: activeInquiriesCount[0]?.count || 0,
      status: systemStatus,
      revenue: "42.850 €",
      conversionRate: "64.2%"
    },
  };
})
});