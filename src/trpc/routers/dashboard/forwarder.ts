import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq, and, sql, desc, gte } from "drizzle-orm";
import { 
  activityEvent, 
  inquiryForwarder, 
  inquiry, 
  organization, 
  subscription, 
  user,
  quotation
} from "@/db/schema";
import { requireOrgAndType } from "@/trpc/common/membership";
import { z } from "zod";
import { getStartDate } from "@/trpc/lib/get-start-date";
import { formatCurrency } from "@/app/(dashboard)/dashboard/forwarder/components/activity/activity-formatters";



export const forwarderDashboardRouter = createTRPCRouter({

  getActivityFeed: protectedProcedure
    .input(z.object({ 
      limit: z.number().min(1).max(50).optional(),
      period: z.enum(["7d", "30d", "90d"]).optional()
    }).optional())
    .query(async ({ ctx, input }) => {

      const membership = await requireOrgAndType(ctx);
      const limit = input?.limit ?? 10;
      const startDate = input?.period ? getStartDate(input.period) : null;

      const whereConditions = [eq(activityEvent.organizationId, membership.organizationId)];
      if (startDate) {
        whereConditions.push(gte(activityEvent.createdAt, startDate));
      }

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
        .where(and(...whereConditions))
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

  getHomeData: protectedProcedure
    .input(
      z.object({
        period: z.enum(["7d", "30d", "90d"]).default("30d"),
        activityLimit: z.number().min(1).max(50).default(3),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const startDate = getStartDate(input.period);
      const generatedAt = new Date();

      const emptyTransportAnalysis = {
        air_freight: { count: 0, percentage: 0 },
        sea_freight: { count: 0, percentage: 0 },
        road_freight: { count: 0, percentage: 0 },
        rail_freight: { count: 0, percentage: 0 },
      };

      const fallbackOverview = {
        organization: { id: "unknown", name: "Unbekannt", logo: null },
        tier: "basic" as const,
        transportAnalysis: emptyTransportAnalysis,
        stats: {
          activeInquiries: 0,
          status: "Down" as const,
          revenue: formatCurrency(0, "EUR"),
          conversionRate: "0%",
        },
      };

      let membership: { organizationId: string; organizationType: string };
      try {
        membership = await requireOrgAndType(ctx);
      } catch {
        return {
          overview: fallbackOverview,
          activity: [],
          generatedAt,
        };
      }

      if (membership.organizationType !== "forwarder") {
        return {
          overview: fallbackOverview,
          activity: [],
          generatedAt,
        };
      }

      try {
        const [orgResult, subscriptionResult, transportAnalysisResult, revenueResult, activeInquiriesCount, activityRows] =
          await Promise.all([
            db.query.organization.findFirst({
              where: eq(organization.id, membership.organizationId),
              columns: { id: true, name: true, logo: true },
            }),
            db.query.subscription
              .findFirst({
                where: eq(subscription.organizationId, membership.organizationId),
                columns: { tier: true },
              })
              .catch(() => null),
            db
              .select({
                serviceType: inquiry.serviceType,
                count: sql<number>`count(${inquiry.id})::int`,
              })
              .from(inquiryForwarder)
              .innerJoin(inquiry, eq(inquiryForwarder.inquiryId, inquiry.id))
              .where(
                and(
                  eq(inquiryForwarder.forwarderOrganizationId, membership.organizationId),
                  sql`${inquiry.status} NOT IN ('cancelled', 'expired')`,
                  gte(inquiry.createdAt, startDate),
                ),
              )
              .groupBy(inquiry.serviceType),
            db
              .select({
                total: sql<number>`sum(${quotation.totalPrice})::int`,
              })
              .from(quotation)
              .where(
                and(
                  eq(quotation.forwarderOrganizationId, membership.organizationId),
                  eq(quotation.status, "accepted"),
                  gte(quotation.createdAt, startDate),
                ),
              ),
            db
              .select({ count: sql<number>`count(*)::int` })
              .from(inquiryForwarder)
              .innerJoin(inquiry, eq(inquiryForwarder.inquiryId, inquiry.id))
              .where(
                and(
                  eq(inquiryForwarder.forwarderOrganizationId, membership.organizationId),
                  eq(inquiry.status, "open"),
                  gte(inquiry.createdAt, startDate),
                ),
              ),
            db
              .select({
                id: activityEvent.id,
                type: activityEvent.type,
                createdAt: activityEvent.createdAt,
                payload: activityEvent.payload,
                actorName: user.name,
              })
              .from(activityEvent)
              .leftJoin(user, eq(activityEvent.actorUserId, user.id))
              .where(
                and(
                  eq(activityEvent.organizationId, membership.organizationId),
                  gte(activityEvent.createdAt, startDate),
                ),
              )
              .orderBy(desc(activityEvent.createdAt))
              .limit(input.activityLimit),
          ]);

        const overview = orgResult
          ? {
              organization: orgResult,
              tier: (subscriptionResult?.tier || "basic") as
                | "basic"
                | "medium"
                | "advanced",
              transportAnalysis: (() => {
                const totalInquiries = transportAnalysisResult.reduce(
                  (sum, item) => sum + item.count,
                  0,
                );
                const transportAnalysis = { ...emptyTransportAnalysis };
                transportAnalysisResult.forEach((item) => {
                  const type = item.serviceType as keyof typeof transportAnalysis;
                  if (type in transportAnalysis) {
                    transportAnalysis[type] = {
                      count: item.count,
                      percentage:
                        totalInquiries > 0
                          ? Math.round((item.count / totalInquiries) * 100)
                          : 0,
                    };
                  }
                });
                return transportAnalysis;
              })(),
              stats: {
                activeInquiries: activeInquiriesCount[0]?.count || 0,
                status: "Healthy" as const,
                revenue: formatCurrency(revenueResult[0]?.total || 0, "EUR"),
                conversionRate: "64.2%",
              },
            }
          : {
              ...fallbackOverview,
              organization: {
                id: membership.organizationId,
                name: "Unbekannt",
                logo: null,
              },
            };

        const activity = activityRows.map((row) => ({
          id: row.id,
          type: row.type,
          createdAt: row.createdAt,
          payload: row.payload ?? null,
          actorName: row.actorName ?? null,
        }));

        return {
          overview,
          activity,
          generatedAt,
        };
      } catch {
        return {
          overview: {
            ...fallbackOverview,
            organization: {
              id: membership.organizationId,
              name: "Unbekannt",
              logo: null,
            },
          },
          activity: [],
          generatedAt,
        };
      }
    }),


  getOverview: protectedProcedure
    .input(z.object({ 
      period: z.enum(["7d", "30d", "90d"]).default("30d") 
    }))
    .query(async ({ ctx, input }) => {

      const { db } = ctx;
      const startDate = getStartDate(input.period);

      const emptyTransportAnalysis = {
        air_freight: { count: 0, percentage: 0 },
        sea_freight: { count: 0, percentage: 0 },
        road_freight: { count: 0, percentage: 0 },
        rail_freight: { count: 0, percentage: 0 },
      };

      const fallbackOverview = {
        organization: { id: "unknown", name: "Unbekannt", logo: null },
        tier: "basic" as const,
        transportAnalysis: emptyTransportAnalysis,
        stats: {
          activeInquiries: 0,
          status: "Down" as const,
          revenue: formatCurrency(0, "EUR"),
          conversionRate: "0%",
        },
      };

      let membership: { organizationId: string; organizationType: string };
      try {
        membership = await requireOrgAndType(ctx);
      } catch {
        return fallbackOverview;
      }

      if (membership.organizationType !== "forwarder") {
        return fallbackOverview;
      }

      try {
        const [orgResult, subscriptionResult] = await Promise.all([
          db.query.organization.findFirst({
            where: eq(organization.id, membership.organizationId),
            columns: { id: true, name: true, logo: true },
          }),
          db.query.subscription.findFirst({
            where: eq(subscription.organizationId, membership.organizationId),
            columns: { tier: true },
          }).catch(() => null)
        ]);

        if (!orgResult) {
          return {
            ...fallbackOverview,
            organization: { id: membership.organizationId, name: "Unbekannt", logo: null },
          };
        }

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
              sql`${inquiry.status} NOT IN ('cancelled', 'expired')`,
              gte(inquiry.createdAt, startDate)
            )
          )
          .groupBy(inquiry.serviceType);

        const revenueResult = await db
          .select({
            total: sql<number>`sum(${quotation.totalPrice})::int`,
          })
          .from(quotation)
          .where(
            and(
              eq(quotation.forwarderOrganizationId, membership.organizationId),
              eq(quotation.status, 'accepted'), 
              gte(quotation.createdAt, startDate)
            )
          );

        const totalRevenue = revenueResult[0]?.total || 0;

        const activeInquiriesCount = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(inquiryForwarder)
          .innerJoin(inquiry, eq(inquiryForwarder.inquiryId, inquiry.id))
          .where(
            and(
              eq(inquiryForwarder.forwarderOrganizationId, membership.organizationId),
              eq(inquiry.status, 'open'),
              gte(inquiry.createdAt, startDate)
            )
          );

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

        return {
          organization: orgResult,
          tier: (subscriptionResult?.tier || "basic") as "basic" | "medium" | "advanced",
          transportAnalysis,
          stats: {
            activeInquiries: activeInquiriesCount[0]?.count || 0,
            status: "Healthy",
            revenue: formatCurrency(totalRevenue, "EUR"),
            conversionRate: "64.2%" // Hier könnte man analog eine Formel einbauen (Angenommen/Gesamt)
          },
        };
      } catch {
        return {
          ...fallbackOverview,
          organization: { id: membership.organizationId, name: "Unbekannt", logo: null },
        };
      }
    })
});