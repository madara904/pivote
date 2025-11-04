import { createTRPCRouter, protectedProcedure, TRPCContext } from "@/trpc/init";
import { eq, and, sql, desc, count, ne } from "drizzle-orm";
import { inquiryForwarder, organizationMember, inquiry, organization, user, inquiryPackage, quotation } from "@/db/schema";
import { alias } from "drizzle-orm/pg-core";
import { checkAndUpdateExpiredItems } from "@/lib/expiration-utils";
import { createStatusDateInfo } from "@/lib/date-utils";
import { inquiryIdSchema } from "@/trpc/common/schemas";
import { requireOrgAndType } from "@/trpc/common/membership";

export const forwarderRouter = createTRPCRouter({


  markInquiryAsViewed: protectedProcedure
    .input(inquiryIdSchema)
    .mutation(async ({ ctx, input }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { db, session } = ctx;
      
      const membership = await requireOrgAndType(ctx);
      

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
        console.log('🚀 Starting fixed getMyInquiriesFast query...');
        
        // Check and update expired items first
        await checkAndUpdateExpiredItems(db);
        
        // Create proper table alias - THIS IS THE KEY FIX
        const shipperOrg = alias(organization, 'shipper_org');
        
        const queryStart = Date.now();
        
        const result = await db
          .select({
            // inquiry_forwarder fields
            id: inquiryForwarder.id,
            inquiryId: inquiryForwarder.inquiryId,
            forwarderOrganizationId: inquiryForwarder.forwarderOrganizationId,
            sentAt: inquiryForwarder.sentAt,
            viewedAt: inquiryForwarder.viewedAt,
            rejectedAt: inquiryForwarder.rejectedAt,
            responseStatus: inquiryForwarder.responseStatus,
            createdAt: inquiryForwarder.createdAt,
            
            // inquiry fields
            referenceNumber: inquiry.referenceNumber,
            title: inquiry.title,
            serviceType: inquiry.serviceType,
            serviceDirection: inquiry.serviceDirection,
            originCity: inquiry.originCity,
            originCountry: inquiry.originCountry,
            destinationCity: inquiry.destinationCity,
            destinationCountry: inquiry.destinationCountry,
            cargoType: inquiry.cargoType,
            cargoDescription: inquiry.cargoDescription,
            status: inquiry.status,
            validityDate: inquiry.validityDate,
            
            // FIXED: Use proper alias fields instead of raw SQL
            shipperName: shipperOrg.name,
            shipperEmail: shipperOrg.email,
            
            // created by user fields
            createdByName: user.name,
            
            // quotation status and price
            quotationId: quotation.id,
            quotationStatus: quotation.status,
            quotationPrice: quotation.totalPrice,
            quotationCurrency: quotation.currency,
            
            // Optimized aggregations
            totalPieces: sql<number>`COALESCE(SUM(${inquiryPackage.pieces}), 0)`,
            totalGrossWeight: sql<number>`COALESCE(SUM(${inquiryPackage.grossWeight}), 0)`,
            totalChargeableWeight: sql<number>`COALESCE(SUM(${inquiryPackage.chargeableWeight}), 0)`,
            totalVolume: sql<number>`COALESCE(SUM(${inquiryPackage.volume}), 0)`,
            packageCount: count(inquiryPackage.id),
            hasDangerousGoods: sql<boolean>`COALESCE(BOOL_OR(${inquiryPackage.isDangerous}), false)`,
            temperatureControlled: sql<boolean>`COALESCE(BOOL_OR(${inquiryPackage.temperature} IS NOT NULL AND ${inquiryPackage.temperature} != ''), false)`,
            specialHandling: sql<boolean>`COALESCE(BOOL_OR(${inquiryPackage.specialHandling} IS NOT NULL AND ${inquiryPackage.specialHandling} != ''), false)`
          })
          .from(organizationMember)
          .innerJoin(organization, 
            and(
              eq(organizationMember.organizationId, organization.id),
              eq(organization.type, 'forwarder')
            )
          )
          .innerJoin(inquiryForwarder, eq(organization.id, inquiryForwarder.forwarderOrganizationId))
          .innerJoin(inquiry, eq(inquiryForwarder.inquiryId, inquiry.id))
          // FIXED: Use proper alias join instead of raw SQL
          .innerJoin(shipperOrg, eq(inquiry.shipperOrganizationId, shipperOrg.id))
          .innerJoin(user, eq(inquiry.createdById, user.id))
          .leftJoin(inquiryPackage, eq(inquiry.id, inquiryPackage.inquiryId))
          .leftJoin(quotation, and(
            eq(quotation.inquiryId, inquiry.id),
            eq(quotation.forwarderOrganizationId, organization.id)
          ))
          .where(
            and(
              eq(organizationMember.userId, session.user.id),
              eq(organizationMember.isActive, true),
              ne(inquiry.status, "closed"),
              // Show all inquiries - drafts should be visible so users can edit/delete them
              // The UI will handle showing appropriate actions based on quotation status
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
            inquiry.serviceDirection,
            inquiry.originCity,
            inquiry.originCountry,
            inquiry.destinationCity,
            inquiry.destinationCountry,
            inquiry.cargoType,
            inquiry.cargoDescription,
            inquiry.status,
            inquiry.validityDate,
            // FIXED: Use alias fields in GROUP BY
            shipperOrg.name,
            shipperOrg.email,
            user.name,
            quotation.id,
            quotation.status,
            quotation.totalPrice,
            quotation.currency
          )
          .orderBy(desc(inquiryForwarder.createdAt))
          .limit(50);
        
        console.log(`⏱️ Fixed query time: ${Date.now() - queryStart}ms`);
        console.log(`📊 Found ${result.length} inquiries`);
  
        // Same transformation logic...
        const processStart = Date.now();
        const transformedResult = result.map((row) => ({
          id: row.id,
          inquiryId: row.inquiryId,
          forwarderOrganizationId: row.forwarderOrganizationId,
          sentAt: row.sentAt,
          viewedAt: row.viewedAt,
          rejectedAt: row.rejectedAt,
          responseStatus: row.responseStatus,
          createdAt: row.createdAt,
          inquiry: {
            id: row.inquiryId,
            referenceNumber: row.referenceNumber,
            title: row.title,
            serviceType: row.serviceType,
            serviceDirection: row.serviceDirection,
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
          statusDateInfo: createStatusDateInfo(row.sentAt, row.viewedAt, row.status),
          quotationId: row.quotationId,
          quotationStatus: row.quotationStatus,
          quotationPrice: row.quotationPrice,
          quotationCurrency: row.quotationCurrency
        }));
  
        console.log(`⏱️ Processing time: ${Date.now() - processStart}ms`);
        console.log(`✅ Total time: ${Date.now() - startTime}ms`);
        
        return transformedResult;
      } catch (error) {
        console.error('Error fetching forwarder inquiries:', error);
        throw new Error('Failed to fetch inquiries');
      }
    }),

  getInquiryDetail: protectedProcedure
    .input(inquiryIdSchema)
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      
      await requireOrgAndType(ctx);

      // Create proper table alias
      const shipperOrg = alias(organization, 'shipper_org');
      
      const result = await db
        .select({
          // inquiry_forwarder fields
          id: inquiryForwarder.id,
          inquiryId: inquiryForwarder.inquiryId,
          forwarderOrganizationId: inquiryForwarder.forwarderOrganizationId,
          sentAt: inquiryForwarder.sentAt,
          viewedAt: inquiryForwarder.viewedAt,
          rejectedAt: inquiryForwarder.rejectedAt,
          responseStatus: inquiryForwarder.responseStatus,
          createdAt: inquiryForwarder.createdAt,
          
          // inquiry fields
          referenceNumber: inquiry.referenceNumber,
          shipperReference: inquiry.shipperReference,
          title: inquiry.title,
          serviceType: inquiry.serviceType,
          serviceDirection: inquiry.serviceDirection,
          originCity: inquiry.originCity,
          originCountry: inquiry.originCountry,
          destinationCity: inquiry.destinationCity,
          destinationCountry: inquiry.destinationCountry,
          cargoType: inquiry.cargoType,
          cargoDescription: inquiry.cargoDescription,
          status: inquiry.status,
          validityDate: inquiry.validityDate,
          
          // shipper organization fields
          shipperName: shipperOrg.name,
          shipperEmail: shipperOrg.email,
          
          // created by user fields
          createdByName: user.name,
          
          // package aggregations
          totalPieces: sql<number>`COALESCE(SUM(${inquiryPackage.pieces}), 0)`,
          totalGrossWeight: sql<number>`COALESCE(SUM(${inquiryPackage.grossWeight}), 0)`,
          totalChargeableWeight: sql<number>`COALESCE(SUM(${inquiryPackage.chargeableWeight}), 0)`,
          totalVolume: sql<number>`COALESCE(SUM(${inquiryPackage.volume}), 0)`,
          packageCount: count(inquiryPackage.id),
          hasDangerousGoods: sql<boolean>`COALESCE(BOOL_OR(${inquiryPackage.isDangerous}), false)`,
          temperatureControlled: sql<boolean>`COALESCE(BOOL_OR(${inquiryPackage.temperature} IS NOT NULL AND ${inquiryPackage.temperature} != ''), false)`,
          specialHandling: sql<boolean>`COALESCE(BOOL_OR(${inquiryPackage.specialHandling} IS NOT NULL AND ${inquiryPackage.specialHandling} != ''), false)`
        })
        .from(organizationMember)
        .innerJoin(organization, 
          and(
            eq(organizationMember.organizationId, organization.id),
            eq(organization.type, 'forwarder')
          )
        )
        .innerJoin(inquiryForwarder, eq(organization.id, inquiryForwarder.forwarderOrganizationId))
        .innerJoin(inquiry, eq(inquiryForwarder.inquiryId, inquiry.id))
        .innerJoin(shipperOrg, eq(inquiry.shipperOrganizationId, shipperOrg.id))
        .innerJoin(user, eq(inquiry.createdById, user.id))
        .leftJoin(inquiryPackage, eq(inquiry.id, inquiryPackage.inquiryId))
        .where(
          and(
            eq(organizationMember.userId, session.user.id),
            eq(organizationMember.isActive, true),
            eq(inquiry.id, input.inquiryId),
            ne(inquiry.status, "closed") // Exclude closed inquiries
          )
        )
        .groupBy(
          inquiryForwarder.id,
          inquiryForwarder.inquiryId,
          inquiryForwarder.forwarderOrganizationId,
          inquiryForwarder.sentAt,
          inquiryForwarder.viewedAt,
          inquiryForwarder.rejectedAt,
          inquiryForwarder.responseStatus,
          inquiryForwarder.createdAt,
          inquiry.id,
          inquiry.referenceNumber,
          inquiry.shipperReference,
          inquiry.title,
          inquiry.serviceType,
          inquiry.serviceDirection,
          inquiry.originCity,
          inquiry.originCountry,
          inquiry.destinationCity,
          inquiry.destinationCountry,
          inquiry.cargoType,
          inquiry.cargoDescription,
          inquiry.status,
          inquiry.validityDate,
          shipperOrg.name,
          shipperOrg.email,
          user.name
        )
        .limit(1);

      if (!result.length) {
        throw new Error("Frachtanfrage nicht gefunden oder nicht zugänglich");
      }

      const row = result[0];

      // Mark as viewed if not already viewed
      if (!row.viewedAt) {
        await db.update(inquiryForwarder)
          .set({ viewedAt: new Date() })
          .where(eq(inquiryForwarder.id, row.id));
      }

      // Fetch individual packages for this inquiry
      const packages = await db
        .select({
          id: inquiryPackage.id,
          packageNumber: inquiryPackage.packageNumber,
          description: inquiryPackage.description,
          pieces: inquiryPackage.pieces,
          grossWeight: inquiryPackage.grossWeight,
          chargeableWeight: inquiryPackage.chargeableWeight,
          length: inquiryPackage.length,
          width: inquiryPackage.width,
          height: inquiryPackage.height,
          volume: inquiryPackage.volume,
          temperature: inquiryPackage.temperature,
          specialHandling: inquiryPackage.specialHandling,
          isDangerous: inquiryPackage.isDangerous,
          dangerousGoodsClass: inquiryPackage.dangerousGoodsClass,
          unNumber: inquiryPackage.unNumber,
        })
        .from(inquiryPackage)
        .where(eq(inquiryPackage.inquiryId, input.inquiryId))
        .orderBy(inquiryPackage.packageNumber);

      return {
        id: row.id,
        inquiryId: row.inquiryId,
        forwarderOrganizationId: row.forwarderOrganizationId,
        sentAt: row.sentAt,
        viewedAt: row.viewedAt,
        rejectedAt: row.rejectedAt,
        responseStatus: row.responseStatus,
        createdAt: row.createdAt,
        inquiry: {
          id: row.inquiryId,
          referenceNumber: row.referenceNumber,
          shipperReference: row.shipperReference,
          title: row.title,
          serviceType: row.serviceType,
          serviceDirection: row.serviceDirection,
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
        packages: packages.map(pkg => ({
          id: pkg.id,
          packageNumber: pkg.packageNumber,
          description: pkg.description,
          pieces: pkg.pieces,
          grossWeight: Number(pkg.grossWeight || 0).toFixed(2),
          chargeableWeight: pkg.chargeableWeight ? Number(pkg.chargeableWeight).toFixed(2) : null,
          length: pkg.length ? Number(pkg.length).toFixed(2) : null,
          width: pkg.width ? Number(pkg.width).toFixed(2) : null,
          height: pkg.height ? Number(pkg.height).toFixed(2) : null,
          volume: pkg.volume ? Number(pkg.volume).toFixed(3) : null,
          temperature: pkg.temperature,
          specialHandling: pkg.specialHandling,
          isDangerous: Boolean(pkg.isDangerous),
          dangerousGoodsClass: pkg.dangerousGoodsClass,
          unNumber: pkg.unNumber,
        })),
        packageSummary: {
          count: row.packageCount,
          hasDangerousGoods: Boolean(row.hasDangerousGoods),
          temperatureControlled: Boolean(row.temperatureControlled),
          specialHandling: Boolean(row.specialHandling)
        },
        statusDateInfo: createStatusDateInfo(row.sentAt, row.viewedAt, row.status)
      };
    }),

  // Reject inquiry (forwarder declines to quote)
  rejectInquiry: protectedProcedure
    .input(inquiryIdSchema)
    .mutation(async ({ ctx, input }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { db, session } = ctx;
      
      try {
        const membership = await requireOrgAndType(ctx);
        
        // Verify the inquiry exists and was sent to this forwarder
        const inquiryForwarderRecord = await db.query.inquiryForwarder.findFirst({
          where: and(
            eq(inquiryForwarder.inquiryId, input.inquiryId),
            eq(inquiryForwarder.forwarderOrganizationId, membership.organizationId)
          )
        });
        
        if (!inquiryForwarderRecord) {
          throw new Error("Frachtanfrage nicht gefunden oder nicht zugänglich");
        }

        // Mark the inquiry as rejected for this forwarder
        await db
          .update(inquiryForwarder)
          .set({ 
            rejectedAt: new Date(),
            responseStatus: "rejected"
          })
          .where(eq(inquiryForwarder.id, inquiryForwarderRecord.id));
        
        return { success: true };
      } catch (error) {
        console.error('❌ Error rejecting inquiry:', error);
        throw new Error(`Failed to reject inquiry: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

});