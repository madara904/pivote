import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq, and, sql, desc, gte } from "drizzle-orm";
import { 
  activityEvent, 
  inquiryForwarder, 
  inquiry, 
  organization, 
  subscription, 
  user,
  quotation,
  organizationConnection,
} from "@/db/schema";
import { requireOrgAndType } from "@/trpc/common/membership";
import { z } from "zod";
import { getStartDate } from "@/trpc/lib/get-start-date";
import { formatCurrency } from "@/app/(dashboard)/dashboard/forwarder/components/activity/activity-formatters";
import { TRPCError } from "@trpc/server";

export const forwarderDashboardRouter = createTRPCRouter({
  getHomeData: protectedProcedure
    .input(
      z.object({
        period: z.enum(["7d", "30d", "90d"]).default("30d"),
        activityLimit: z.number().min(1).max(50).default(3),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const membership = await requireOrgAndType(ctx);

      if (membership.organizationType !== "forwarder") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Nur Spediteure haben Zugriff." });
      }

      const orgId = membership.organizationId;
      const startDate = getStartDate(input.period);
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

      const emptyTransportAnalysis = {
        air_freight: { count: 0, percentage: 0 },
        sea_freight: { count: 0, percentage: 0 },
        road_freight: { count: 0, percentage: 0 },
        rail_freight: { count: 0, percentage: 0 },
      };

      try {
        // Parallelisierung der Abfragen zur Performance-Steigerung
        const [
          orgResult, 
          subscriptionResult, 
          transportAnalysisResult, 
          revenueResult, 
          activeInquiriesCount, 
          activityRows,
          offersThisMonthResult,
          connectionCountResult,
        ] = await Promise.all([
          db.query.organization.findFirst({
            where: eq(organization.id, orgId),
            columns: { id: true, name: true, logo: true },
          }),
          db.query.subscription.findFirst({
            where: eq(subscription.organizationId, orgId),
            columns: { tier: true, maxQuotationsPerMonth: true },
          }).catch(() => null),
          db.select({
            serviceType: inquiry.serviceType,
            count: sql<number>`count(${inquiry.id})::int`,
          })
          .from(inquiryForwarder)
          .innerJoin(inquiry, eq(inquiryForwarder.inquiryId, inquiry.id))
          .where(and(
            eq(inquiryForwarder.forwarderOrganizationId, orgId),
            sql`${inquiry.status} NOT IN ('cancelled', 'expired')`,
            gte(inquiry.createdAt, startDate),
          ))
          .groupBy(inquiry.serviceType),
          db.select({ total: sql<number>`sum(${quotation.totalPrice})::int` })
          .from(quotation)
          .where(and(
            eq(quotation.forwarderOrganizationId, orgId),
            eq(quotation.status, "accepted"),
            gte(quotation.createdAt, startDate),
          )),
          db.select({ count: sql<number>`count(*)::int` })
          .from(inquiryForwarder)
          .innerJoin(inquiry, eq(inquiryForwarder.inquiryId, inquiry.id))
          .where(and(
            eq(inquiryForwarder.forwarderOrganizationId, orgId),
            eq(inquiry.status, "open"),
            gte(inquiry.createdAt, startDate),
          )),
          db.select({
            id: activityEvent.id,
            type: activityEvent.type,
            createdAt: activityEvent.createdAt,
            payload: activityEvent.payload,
            actorName: user.name,
          })
          .from(activityEvent)
          .leftJoin(user, eq(activityEvent.actorUserId, user.id))
          .where(and(
            eq(activityEvent.organizationId, orgId),
            gte(activityEvent.createdAt, startDate),
          ))
          .orderBy(desc(activityEvent.createdAt))
          .limit(input.activityLimit),
          db.select({ count: sql<number>`count(*)::int` })
          .from(quotation)
          .where(and(
            eq(quotation.forwarderOrganizationId, orgId),
            gte(quotation.createdAt, firstDayOfMonth),
          )),
          db.select({ count: sql<number>`count(*)::int` })
          .from(organizationConnection)
          .where(and(
            eq(organizationConnection.forwarderOrganizationId, orgId),
            sql`${organizationConnection.status} IN ('pending', 'connected')`,
          )),
        ]);

        // Transport Analyse Mapping
        const totalInquiries = transportAnalysisResult.reduce((sum, item) => sum + item.count, 0);
        const transportAnalysis = { ...emptyTransportAnalysis };
        transportAnalysisResult.forEach((item) => {
          const type = item.serviceType as keyof typeof transportAnalysis;
          if (type in transportAnalysis) {
            transportAnalysis[type] = {
              count: item.count,
              percentage: totalInquiries > 0 ? Math.round((item.count / totalInquiries) * 100) : 0,
            };
          }
        });

        const tier = (subscriptionResult?.tier || "basic") as "basic" | "medium" | "advanced";
        const offersLimit =
          tier === "basic"
            ? (subscriptionResult?.maxQuotationsPerMonth ?? 5)
            : null;
        const connectionLimit = tier === "basic" ? 1 : null;

        return {
          overview: {
            organization: orgResult ?? { id: orgId, name: "Unbekannt", logo: null },
            tier,
            transportAnalysis,
            stats: {
              activeInquiries: activeInquiriesCount[0]?.count || 0,
              revenue: formatCurrency(revenueResult[0]?.total || 0, "EUR"),
              conversionRate: "64.2%",
            },
            usage: {
              offersThisMonth: offersThisMonthResult[0]?.count || 0,
              activeConnections: connectionCountResult[0]?.count || 0,
            },
            limits: {
              offersPerMonth: offersLimit,
              connections: connectionLimit,
            },
          },
          activity: activityRows.map(row => ({
            ...row,
            payload: row.payload ?? null,
            actorName: row.actorName ?? null,
          })),
        };
      } catch (error) {
        console.error("Dashboard Error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});