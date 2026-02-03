import { createTRPCRouter, protectedProcedure, TRPCContext } from "@/trpc/init";
import { eq, and, sql, desc, count } from "drizzle-orm";
import { inquiryDocument, inquiryForwarder, organizationMember, inquiry, organization, user, inquiryPackage, quotation, inquiryNote } from "@/db/schema";
import { alias } from "drizzle-orm/pg-core";
import { checkAndUpdateExpiredItems } from "@/lib/expiration-utils";
import { createStatusDateInfo } from "@/lib/date-utils";
import { inquiryIdSchema } from "@/trpc/common/schemas";
import { requireOrgAndType } from "@/trpc/common/membership";
import { calculateVolume } from "@/lib/freight-calculations";

export const forwarderRouter = createTRPCRouter({


  markInquiryAsViewed: protectedProcedure
    .input(inquiryIdSchema)
    .mutation(async ({ ctx, input }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { db, session } = ctx;
      
      const membership = await requireOrgAndType(ctx);
      
      if (membership.organizationType !== "forwarder") {
        throw new Error("Nur Spediteure können Anfragen öffnen");
      }
      

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


    getMyInquiriesFast: protectedProcedure.query(async ({ ctx }) => {
      const { db, session } = ctx;
      
      try {
        const membership = await requireOrgAndType(ctx);
        if (membership.organizationType !== "forwarder") {
          throw new Error("Nur Spediteure können Anfragen abrufen");
        }
    
        await checkAndUpdateExpiredItems(db);
        const shipperOrg = alias(organization, 'shipper_org');
    
        const result = await db
          .select({
            id: inquiryForwarder.id,
            inquiryId: inquiryForwarder.inquiryId,
            forwarderOrganizationId: inquiryForwarder.forwarderOrganizationId,
            sentAt: inquiryForwarder.sentAt,
            viewedAt: inquiryForwarder.viewedAt,
            rejectedAt: inquiryForwarder.rejectedAt,
            responseStatus: inquiryForwarder.responseStatus,
            createdAt: inquiryForwarder.createdAt,
            referenceNumber: inquiry.referenceNumber,
            title: inquiry.title,
            serviceType: inquiry.serviceType,
            serviceDirection: inquiry.serviceDirection,
            originCity: inquiry.originCity,
            originCountry: inquiry.originCountry,
            destinationCity: inquiry.destinationCity,
            destinationCountry: inquiry.destinationCountry,
            // --- DIESE BEIDEN FELDER HIER HINZUFÜGEN ---
            cargoType: inquiry.cargoType,
            cargoDescription: inquiry.cargoDescription,
            // ------------------------------------------
            status: inquiry.status,
            validityDate: inquiry.validityDate,
            shipperName: shipperOrg.name,
            shipperEmail: shipperOrg.email,
            createdByName: user.name,
            quotationId: quotation.id,
            quotationStatus: quotation.status,
            quotationPrice: quotation.totalPrice,
            quotationCurrency: quotation.currency,
            totalPieces: sql<number>`COALESCE(SUM(${inquiryPackage.pieces}), 0)::int`,
            totalGrossWeight: sql<string>`COALESCE(SUM(${inquiryPackage.grossWeight}), 0)`,
            totalChargeableWeight: sql<string>`COALESCE(SUM(${inquiryPackage.chargeableWeight}), 0)`,
            totalVolume: sql<string>`COALESCE(SUM(${inquiryPackage.volume}), 0)`,
            packageCount: sql<number>`count(${inquiryPackage.id})::int`,
            hasDangerousGoods: sql<boolean>`COALESCE(BOOL_OR(${inquiryPackage.isDangerous}), false)`,
            documentCount: sql<number>`(SELECT count(*)::int FROM ${inquiryDocument} WHERE ${inquiryDocument.inquiryId} = ${inquiry.id})`,
            noteCount: sql<number>`(SELECT count(*)::int FROM inquiry_note WHERE inquiry_id = ${inquiry.id})`
          })
          .from(organizationMember)
          .innerJoin(organization, and(
            eq(organizationMember.organizationId, organization.id),
            eq(organization.type, 'forwarder')
          ))
          .innerJoin(inquiryForwarder, eq(organization.id, inquiryForwarder.forwarderOrganizationId))
          .innerJoin(inquiry, eq(inquiryForwarder.inquiryId, inquiry.id))
          .innerJoin(shipperOrg, eq(inquiry.shipperOrganizationId, shipperOrg.id))
          .innerJoin(user, eq(inquiry.createdById, user.id))
          .leftJoin(inquiryPackage, eq(inquiry.id, inquiryPackage.inquiryId))
          .leftJoin(quotation, and(
            eq(quotation.inquiryId, inquiry.id),
            eq(quotation.forwarderOrganizationId, organization.id)
          ))
          .where(and(
            eq(organizationMember.userId, session.user.id),
            eq(organizationMember.isActive, true)
          ))
          .groupBy(
            inquiryForwarder.id, inquiry.id, shipperOrg.id, user.id, quotation.id
          )
          .orderBy(desc(inquiryForwarder.createdAt))
          .limit(50);
    
        return result.map((row) => ({
          ...row,
          documents: row.documentCount > 0 ? Array(row.documentCount).fill({}) : [],
          notes: row.noteCount > 0 ? Array(row.noteCount).fill({}) : [],
          
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
            // --- HIER IM MAPPING EBENFALLS HINZUFÜGEN ---
            cargoType: row.cargoType,
            cargoDescription: row.cargoDescription,
            // --------------------------------------------
            status: row.status,
            validityDate: row.validityDate,
            totalPieces: row.totalPieces,
            totalGrossWeight: row.totalGrossWeight,
            totalChargeableWeight: row.totalChargeableWeight,
            totalVolume: row.totalVolume,
            shipperOrganization: { name: row.shipperName, email: row.shipperEmail },
            createdBy: { name: row.createdByName }
          },
          packageSummary: {
            count: row.packageCount,
            hasDangerousGoods: row.hasDangerousGoods,
          },
          statusDateInfo: createStatusDateInfo(row.sentAt, row.viewedAt, row.status),
        }));
      } catch (error) {
        console.error('Error in getMyInquiriesFast:', error);
        throw new Error('Fehler beim Laden');
      }
    }),

  getInquiryDetail: protectedProcedure
    .input(inquiryIdSchema)
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      
      const membership = await requireOrgAndType(ctx);

      if (membership.organizationType !== "forwarder") {
        throw new Error("Nur Spediteure können Anfragen abrufen");
      }

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
          
          // quotation status and price
          quotationId: quotation.id,
          quotationStatus: quotation.status,
          quotationPrice: quotation.totalPrice,
          quotationCurrency: quotation.currency,
          
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
        .leftJoin(quotation, and(
          eq(quotation.inquiryId, inquiry.id),
          eq(quotation.forwarderOrganizationId, organization.id)
        ))
        .where(
          and(
            eq(organizationMember.userId, session.user.id),
            eq(organizationMember.isActive, true),
            eq(inquiry.id, input.inquiryId)
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
          user.name,
          quotation.id,
          quotation.status,
          quotation.totalPrice,
          quotation.currency
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

      const normalizedPackages = packages.map(pkg => {
        const length = pkg.length ? Number(pkg.length) : null;
        const width = pkg.width ? Number(pkg.width) : null;
        const height = pkg.height ? Number(pkg.height) : null;
        const pieces = pkg.pieces ?? 0;
        const volumePerPiece =
          length && width && height
            ? calculateVolume({ length, width, height })
            : null;
        const fallbackVolume = volumePerPiece && pieces
          ? volumePerPiece * pieces
          : null;
        const volumeValue = pkg.volume ? Number(pkg.volume) : fallbackVolume;

        return {
          id: pkg.id,
          packageNumber: pkg.packageNumber,
          description: pkg.description,
          pieces: pkg.pieces,
          grossWeight: Number(pkg.grossWeight || 0).toFixed(2),
          chargeableWeight: pkg.chargeableWeight ? Number(pkg.chargeableWeight).toFixed(2) : null,
          length: length ? length.toFixed(2) : null,
          width: width ? width.toFixed(2) : null,
          height: height ? height.toFixed(2) : null,
          volume: volumeValue ? volumeValue.toFixed(3) : null,
          temperature: pkg.temperature,
          specialHandling: pkg.specialHandling,
          isDangerous: Boolean(pkg.isDangerous),
          dangerousGoodsClass: pkg.dangerousGoodsClass,
          unNumber: pkg.unNumber,
        };
      });

      const totalVolumeFromPackages = normalizedPackages.reduce((sum, pkg) => {
        const volume = pkg.volume ? Number(pkg.volume) : 0;
        return sum + (Number.isFinite(volume) ? volume : 0);
      }, 0);
      const totalVolumeValue = Number(row.totalVolume || 0);
      const totalVolumeFinal = totalVolumeValue > 0 ? totalVolumeValue : totalVolumeFromPackages;

      return {
        id: row.id,
        inquiryId: row.inquiryId,
        forwarderOrganizationId: row.forwarderOrganizationId,
        sentAt: row.sentAt,
        viewedAt: row.viewedAt,
        rejectedAt: row.rejectedAt,
        responseStatus: row.responseStatus,
        createdAt: row.createdAt,
        quotationId: row.quotationId,
        quotationStatus: row.quotationStatus,
        quotationPrice: row.quotationPrice,
        quotationCurrency: row.quotationCurrency,
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
          totalVolume: totalVolumeFinal.toFixed(3),
          shipperOrganization: {
            name: row.shipperName,
            email: row.shipperEmail
          },
          createdBy: {
            name: row.createdByName
          }
        },
        packages: normalizedPackages,
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
        
        if (membership.organizationType !== "forwarder") {
          throw new Error("Nur Spediteure können Anfragen ablehnen");
        }
        
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

  getInquiryDocuments: protectedProcedure
    .input(inquiryIdSchema)
    .query(async ({ ctx, input }) => {
      const { db } = ctx;

      const membership = await requireOrgAndType(ctx);

      if (membership.organizationType !== "forwarder") {
        throw new Error("Nur Spediteure können Dokumente abrufen");
      }

      const acceptedQuotation = await db
        .select({ id: quotation.id })
        .from(quotation)
        .where(
          and(
            eq(quotation.inquiryId, input.inquiryId),
            eq(quotation.forwarderOrganizationId, membership.organizationId),
            eq(quotation.status, "accepted")
          )
        )
        .limit(1);

      if (!acceptedQuotation.length) {
        throw new Error("Dokumente sind nur für gewonnene Anfragen verfügbar");
      }

      const documents = await db
        .select({
          id: inquiryDocument.id,
          inquiryId: inquiryDocument.inquiryId,
          documentType: inquiryDocument.documentType,
          fileName: inquiryDocument.fileName,
          fileType: inquiryDocument.fileType,
          fileSize: inquiryDocument.fileSize,
          fileKey: inquiryDocument.fileKey,
          fileUrl: inquiryDocument.fileUrl,
          createdAt: inquiryDocument.createdAt,
          uploadedByOrganization: {
            id: organization.id,
            name: organization.name,
          },
        })
        .from(inquiryDocument)
        .innerJoin(organization, eq(inquiryDocument.uploadedByOrganizationId, organization.id))
        .where(eq(inquiryDocument.inquiryId, input.inquiryId))
        .orderBy(desc(inquiryDocument.createdAt));

      return documents;
    }),

  getInquiryNotes: protectedProcedure
    .input(inquiryIdSchema)
    .query(async ({ ctx, input }) => {
      const { db } = ctx;

      const membership = await requireOrgAndType(ctx);

      if (membership.organizationType !== "forwarder") {
        throw new Error("Nur Spediteure können Notizen abrufen");
      }

      const acceptedQuotation = await db
        .select({ id: quotation.id })
        .from(quotation)
        .where(
          and(
            eq(quotation.inquiryId, input.inquiryId),
            eq(quotation.forwarderOrganizationId, membership.organizationId),
            eq(quotation.status, "accepted")
          )
        )
        .limit(1);

      if (!acceptedQuotation.length) {
        throw new Error("Notizen sind nur für gewonnene Anfragen verfügbar");
      }

      const notes = await db
        .select({
          id: inquiryNote.id,
          inquiryId: inquiryNote.inquiryId,
          content: inquiryNote.content,
          createdAt: inquiryNote.createdAt,
          createdBy: {
            id: user.id,
            name: user.name,
          },
          organization: {
            id: organization.id,
            name: organization.name,
          },
        })
        .from(inquiryNote)
        .innerJoin(user, eq(inquiryNote.userId, user.id))
        .innerJoin(organization, eq(inquiryNote.organizationId, organization.id))
        .where(eq(inquiryNote.inquiryId, input.inquiryId))
        .orderBy(desc(inquiryNote.createdAt));

      return notes;
    }),

});