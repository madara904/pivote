import { createTRPCRouter, protectedProcedure, TRPCContext } from "@/trpc/init";
import { eq, and } from "drizzle-orm";
import { inquiryForwarder, organizationMember } from "@/db/schema";
import { z } from "zod";

export const forwarderRouter = createTRPCRouter({
  getMyInquiries: protectedProcedure.query(async ({ ctx }: { ctx: TRPCContext }) => {
    const { db, session } = ctx;
    
    const membership = await db.query.organizationMember.findFirst({
      where: eq(organizationMember.userId, session.user.id),
      with: { organization: true }
    });
    
    if (!membership?.organization) {
      return [];
    }

    if (membership.organization.type !== 'forwarder') {
      throw new Error("Organisation ist kein Spediteur");
    }
    

    const inquiriesForForwarder = await db.query.inquiryForwarder.findMany({
      where: eq(inquiryForwarder.forwarderOrganizationId, membership.organization.id),
      with: {
        inquiry: {
          with: {
            packages: true,
            shipperOrganization: true,
            createdBy: true
          }
        }
      }
    });
    

    const inquiriesWithDetails = inquiriesForForwarder
      .map(record => {
        const inquiry = record.inquiry;
        if (!inquiry) return null;
        
        const packages = inquiry.packages || [];
        

        const totalPieces = packages.reduce((sum, pkg) => sum + (pkg.pieces || 0), 0);
        const totalGrossWeight = packages.reduce((sum, pkg) => sum + parseFloat(pkg.grossWeight || '0'), 0);
        const totalChargeableWeight = packages.reduce((sum, pkg) => sum + parseFloat(pkg.chargeableWeight || '0'), 0);
        const totalVolume = packages.reduce((sum, pkg) => sum + parseFloat(pkg.volume || '0'), 0);
        

        const packageSummary = packages.length > 0 ? {
          count: packages.length,
          totalPieces,
          totalGrossWeight: totalGrossWeight.toFixed(2),
          totalChargeableWeight: totalChargeableWeight.toFixed(2),
          totalVolume: totalVolume.toFixed(3),
          hasDangerousGoods: packages.some(pkg => pkg.isDangerous),
          temperatureControlled: packages.some(pkg => pkg.temperature),
          specialHandling: packages.some(pkg => pkg.specialHandling)
        } : null;
        

        // Simple status date info without complex calculations
        const statusDateInfo = {
          formattedSentDate: record.sentAt ? new Date(record.sentAt).toLocaleDateString('de-DE') : '',
          formattedViewedDate: record.viewedAt ? new Date(record.viewedAt).toLocaleDateString('de-DE') : null,
          statusDetail: inquiry.status === "sent" && record.viewedAt 
            ? `Viewed ${new Date(record.viewedAt).toLocaleDateString('de-DE')}`
            : inquiry.status === "sent" 
            ? `Sent ${new Date(record.sentAt).toLocaleDateString('de-DE')}`
            : inquiry.status === "draft"
            ? "Not sent yet"
            : ""
        };

        return {
          id: record.id,
          inquiryId: record.inquiryId,
          forwarderOrganizationId: record.forwarderOrganizationId,
          sentAt: record.sentAt,
          viewedAt: record.viewedAt,
          createdAt: record.createdAt,
          inquiry: {
            ...inquiry,
            packages,
            totalPieces,
            totalGrossWeight: totalGrossWeight.toFixed(2),
            totalChargeableWeight: totalChargeableWeight > 0 ? totalChargeableWeight.toFixed(2) : null,
            totalVolume: totalVolume.toFixed(3),
            dimensionsSummary: packages.length > 0 
              ? packages.map(pkg => 
                  `${pkg.length || 0}×${pkg.width || 0}×${pkg.height || 0}cm`
                ).join(", ")
              : "Keine Abmessungen"
          },
          packageSummary,
          statusDateInfo
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null); // Filter on server
    
    return inquiriesWithDetails;
  }),

  getInquiryById: protectedProcedure
    .input(z.object({ inquiryId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      

      const membership = await db.query.organizationMember.findFirst({
        where: eq(organizationMember.userId, session.user.id),
        with: { organization: true }
      });
      
      if (!membership?.organization) {
        throw new Error("Benutzer ist nicht Teil einer Organisation");
      }

      if (membership.organization.type !== 'forwarder') {
        throw new Error("Organisation ist kein Spediteur");
      }
      
      const inquiryForwarderRecord = await db.query.inquiryForwarder.findFirst({
        where: and(
          eq(inquiryForwarder.inquiryId, input.inquiryId),
          eq(inquiryForwarder.forwarderOrganizationId, membership.organization.id)
        ),
        with: {
          inquiry: {
            with: {
              packages: true,
              shipperOrganization: true,
              createdBy: true
            }
          }
        }
      });
      
      if (!inquiryForwarderRecord || !inquiryForwarderRecord.inquiry) {
        throw new Error("Frachtanfrage nicht gefunden oder nicht zugänglich");
      }
      
      const inquiry = inquiryForwarderRecord.inquiry;
      const packages = inquiry.packages || [];
      

      const totalPieces = packages.reduce((sum, pkg) => sum + (pkg.pieces || 0), 0);
      const totalGrossWeight = packages.reduce((sum, pkg) => sum + parseFloat(pkg.grossWeight || '0'), 0);
      const totalChargeableWeight = packages.reduce((sum, pkg) => sum + parseFloat(pkg.chargeableWeight || '0'), 0);
      const totalVolume = packages.reduce((sum, pkg) => sum + parseFloat(pkg.volume || '0'), 0);
      

      // Simple status date info without complex calculations
      const statusDateInfo = {
        formattedSentDate: inquiryForwarderRecord.sentAt ? new Date(inquiryForwarderRecord.sentAt).toLocaleDateString('de-DE') : '',
        formattedViewedDate: inquiryForwarderRecord.viewedAt ? new Date(inquiryForwarderRecord.viewedAt).toLocaleDateString('de-DE') : null,
        statusDetail: inquiry.status === "sent" && inquiryForwarderRecord.viewedAt 
          ? `Viewed ${new Date(inquiryForwarderRecord.viewedAt).toLocaleDateString('de-DE')}`
          : inquiry.status === "sent" 
          ? `Sent ${new Date(inquiryForwarderRecord.sentAt).toLocaleDateString('de-DE')}`
          : inquiry.status === "draft"
          ? "Not sent yet"
          : ""
      };

      return {
        ...inquiryForwarderRecord,
        inquiry: {
          ...inquiry,
          packages,
          totalPieces,
          totalGrossWeight: totalGrossWeight.toFixed(2),
          totalChargeableWeight: totalChargeableWeight > 0 ? totalChargeableWeight.toFixed(2) : null,
          totalVolume: totalVolume.toFixed(3),
          dimensionsSummary: packages.length > 0 
            ? packages.map(pkg => 
                `${pkg.length || 0}×${pkg.width || 0}×${pkg.height || 0}cm`
              ).join(", ")
            : "Keine Abmessungen"
        },
        statusDateInfo
      };
    }),

  markInquiryAsViewed: protectedProcedure
    .input(z.object({ inquiryId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      

      const membership = await db.query.organizationMember.findFirst({
        where: eq(organizationMember.userId, session.user.id),
        with: { organization: true }
      });
      
      if (!membership?.organization) {
        throw new Error("Benutzer ist nicht Teil einer Organisation");
      }
      
      // Check if the inquiry exists and belongs to this forwarder
      const inquiryForwarderRecord = await db.query.inquiryForwarder.findFirst({
        where: and(
          eq(inquiryForwarder.inquiryId, input.inquiryId),
          eq(inquiryForwarder.forwarderOrganizationId, membership.organization.id)
        )
      });
      
      if (!inquiryForwarderRecord) {
        throw new Error("Frachtanfrage nicht gefunden oder nicht zugänglich");
      }
      
      // Update the viewedAt timestamp
      await db.update(inquiryForwarder)
        .set({ 
          viewedAt: new Date()
        })
        .where(eq(inquiryForwarder.id, inquiryForwarderRecord.id));
      
      return { success: true };
    }),

  // - listReceivedInquiries
  // - refuseInquiry
});