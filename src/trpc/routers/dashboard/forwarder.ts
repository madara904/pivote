import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq, and, sql } from "drizzle-orm";
import { inquiryForwarder, organizationMember, inquiry, organization, subscription } from "@/db/schema";
import { requireOrgAndType } from "@/trpc/common/membership";

export const forwarderDashboardRouter = createTRPCRouter({
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
        status: "", // Könnte man später dynamisch über API-Health prüfen
        revenue: "42.850 €", // Hier müsste eine Join-Logik auf Angebote/Rechnungen folgen
        conversionRate: "64.2%" // Hier: Angenommen / Gesamt
      },
    };
  }),
});
