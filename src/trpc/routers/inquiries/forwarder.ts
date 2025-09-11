import { createTRPCRouter, protectedProcedure, TRPCContext } from "@/trpc/init";
import { eq, and, sql, desc, count } from "drizzle-orm";
import { inquiryForwarder, organizationMember, inquiry, organization, user, inquiryPackage } from "@/db/schema";
import { z } from "zod";

export const forwarderRouter = createTRPCRouter({


  markInquiryAsViewed: protectedProcedure
    .input(z.object({ inquiryId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      

      // Use join for better performance instead of separate queries
      const membershipResult = await db
        .select({
          organizationId: organizationMember.organizationId,
          organizationType: organization.type,
        })
        .from(organizationMember)
        .innerJoin(organization, eq(organizationMember.organizationId, organization.id))
        .where(eq(organizationMember.userId, session.user.id))
        .limit(1);
      
      if (!membershipResult.length) {
        throw new Error("Benutzer ist nicht Teil einer Organisation");
      }

      const membership = membershipResult[0];
      

      const inquiryForwarderRecord = await db.query.inquiryForwarder.findFirst({
        where: and(
          eq(inquiryForwarder.inquiryId, input.inquiryId),
          eq(inquiryForwarder.forwarderOrganizationId, membership.organizationId)
        )
      });
      
      if (!inquiryForwarderRecord) {
        throw new Error("Frachtanfrage nicht gefunden oder nicht zugänglich");
      }
      

      await db.update(inquiryForwarder)
        .set({ 
          viewedAt: new Date()
        })
        .where(eq(inquiryForwarder.id, inquiryForwarderRecord.id));
      
      return { success: true };
    }),


    getMyInquiriesFast: protectedProcedure.query(async ({ ctx }: { ctx: TRPCContext }) => {
      const { db, session } = ctx;
      const startTime = Date.now();
      
      try {
        console.log('🚀 Starting getMyInquiriesFast query...');
        
        if (!session?.user?.id) {
          throw new Error('Not authenticated');
        }
    
        const queryStart = Date.now();
        
        // SINGLE optimized query - start from user's membership, join everything in one go
        const result = await db
          .select({
            // inquiry_forwarder fields
            id: inquiryForwarder.id,
            inquiryId: inquiryForwarder.inquiryId,
            forwarderOrganizationId: inquiryForwarder.forwarderOrganizationId,
            sentAt: inquiryForwarder.sentAt,
            viewedAt: inquiryForwarder.viewedAt,
            createdAt: inquiryForwarder.createdAt,
            
            // inquiry fields
            referenceNumber: inquiry.referenceNumber,
            title: inquiry.title,
            serviceType: inquiry.serviceType,
            originCity: inquiry.originCity,
            originCountry: inquiry.originCountry,
            destinationCity: inquiry.destinationCity,
            destinationCountry: inquiry.destinationCountry,
            cargoType: inquiry.cargoType,
            cargoDescription: inquiry.cargoDescription,
            status: inquiry.status,
            validityDate: inquiry.validityDate,
            
            // shipper organization fields (using alias to avoid conflict)
            shipperName: sql<string>`shipper_org.name`,
            shipperEmail: sql<string>`shipper_org.email`,
            
            // created by user fields
            createdByName: user.name,
            
            // aggregated package fields
            totalPieces: sql<number>`COALESCE(SUM(${inquiryPackage.pieces}), 0)`,
            totalGrossWeight: sql<number>`COALESCE(SUM(${inquiryPackage.grossWeight}), 0)`,
            totalChargeableWeight: sql<number>`COALESCE(SUM(${inquiryPackage.chargeableWeight}), 0)`,
            totalVolume: sql<number>`COALESCE(SUM(${inquiryPackage.volume}), 0)`,
            packageCount: count(inquiryPackage.id),
            hasDangerousGoods: sql<boolean>`BOOL_OR(${inquiryPackage.isDangerous})`,
            temperatureControlled: sql<boolean>`BOOL_OR(${inquiryPackage.temperature} IS NOT NULL)`,
            specialHandling: sql<boolean>`BOOL_OR(${inquiryPackage.specialHandling} IS NOT NULL)`
          })
          .from(organizationMember)
          // Get user's forwarder organization
          .innerJoin(organization, 
            and(
              eq(organizationMember.organizationId, organization.id),
              eq(organization.type, 'forwarder')
            )
          )
          // Get inquiries sent to this forwarder
          .innerJoin(inquiryForwarder, eq(organization.id, inquiryForwarder.forwarderOrganizationId))
          // Get the actual inquiry
          .innerJoin(inquiry, eq(inquiryForwarder.inquiryId, inquiry.id))
          // Get shipper organization (using alias to avoid table name conflict)
          .innerJoin(
            sql`${organization} AS shipper_org`,
            eq(inquiry.shipperOrganizationId, sql`shipper_org.id`)
          )
          // Get user who created the inquiry
          .innerJoin(user, eq(inquiry.createdById, user.id))
          // Left join packages for aggregation
          .leftJoin(inquiryPackage, eq(inquiry.id, inquiryPackage.inquiryId))
          .where(
            and(
              eq(organizationMember.userId, session.user.id),
              eq(organizationMember.isActive, true)
            )
          )
          .groupBy(
            inquiryForwarder.id,
            inquiryForwarder.inquiryId,
            inquiryForwarder.forwarderOrganizationId,
            inquiryForwarder.sentAt,
            inquiryForwarder.viewedAt,
            inquiryForwarder.createdAt,
            inquiry.id,
            inquiry.referenceNumber,
            inquiry.title,
            inquiry.serviceType,
            inquiry.originCity,
            inquiry.originCountry,
            inquiry.destinationCity,
            inquiry.destinationCountry,
            inquiry.cargoType,
            inquiry.cargoDescription,
            inquiry.status,
            inquiry.validityDate,
            sql`shipper_org.name`,
            sql`shipper_org.email`,
            user.name
          )
          .orderBy(desc(inquiryForwarder.createdAt))
          .limit(50);
        
        console.log(`⏱️ Single query time: ${Date.now() - queryStart}ms`);
        console.log(`📊 Found ${result.length} inquiries`);
    
        // Transform the result to match expected format
        const processStart = Date.now();
        const transformedResult = result.map((row) => ({
          id: row.id,
          inquiryId: row.inquiryId,
          forwarderOrganizationId: row.forwarderOrganizationId,
          sentAt: row.sentAt,
          viewedAt: row.viewedAt,
          createdAt: row.createdAt,
          inquiry: {
            id: row.inquiryId,
            referenceNumber: row.referenceNumber,
            title: row.title,
            serviceType: row.serviceType,
            originCity: row.originCity,
            originCountry: row.originCountry,
            destinationCity: row.destinationCity,
            destinationCountry: row.destinationCountry,
            cargoType: row.cargoType,
            cargoDescription: row.cargoDescription,
            status: row.status,
            validityDate: row.validityDate,
            totalPieces: row.totalPieces,
            totalGrossWeight: Number(row.totalGrossWeight || 0).toFixed(2),
            totalChargeableWeight: Number(row.totalChargeableWeight || 0).toFixed(2),
            totalVolume: Number(row.totalVolume || 0).toFixed(3),
            shipperOrganization: {
              name: row.shipperName,
              email: row.shipperEmail
            },
            createdBy: {
              name: row.createdByName
            }
          },
          packageSummary: {
            count: row.packageCount,
            hasDangerousGoods: Boolean(row.hasDangerousGoods),
            temperatureControlled: Boolean(row.temperatureControlled),
            specialHandling: Boolean(row.specialHandling)
          },
          statusDateInfo: {
            formattedSentDate: row.sentAt ? row.sentAt.toLocaleDateString('de-DE') : '',
            formattedViewedDate: row.viewedAt ? row.viewedAt.toLocaleDateString('de-DE') : null,
            statusDetail: row.status === "sent" && row.viewedAt 
              ? `Viewed ${row.viewedAt.toLocaleDateString('de-DE')}`
              : row.status === "sent" && row.sentAt
              ? `Sent ${row.sentAt.toLocaleDateString('de-DE')}`
              : row.status === "draft"
              ? "Not sent yet"
              : ""
          }
        }));
    
        console.log(`⏱️ Processing time: ${Date.now() - processStart}ms`);
        console.log(`✅ Total getMyInquiriesFast time: ${Date.now() - startTime}ms`);
        
        return transformedResult;
      } catch (error) {
        console.error('Error fetching forwarder inquiries:', error);
        console.log(`❌ Failed after: ${Date.now() - startTime}ms`);
        throw new Error('Failed to fetch inquiries');
      }
    })

  // - listReceivedInquiries
  // - refuseInquiry
});