/* eslint-disable @typescript-eslint/no-unused-vars */
import { createTRPCRouter, protectedProcedure, TRPCContext } from "@/trpc/init";
import { eq, desc, and, ne, inArray } from "drizzle-orm";
import { organization, organizationMember, organizationConnection, inquiry, inquiryForwarder, inquiryPackage, quotation } from "@/db/schema";
import { z } from "zod";
import { checkAndUpdateExpiredItems } from "@/lib/expiration-utils";
import { inquiryIdSchema } from "@/trpc/common/schemas";
import { requireOrgId } from "@/trpc/common/membership";
import { calculateVolume } from "@/lib/freight-calculations";

export const shipperRouter = createTRPCRouter({
  // Get connected forwarders for selection
  getConnectedForwarders: protectedProcedure.query(async ({ ctx }: { ctx: TRPCContext }) => {
    const { db } = ctx;
    
    try {
      const orgId = await requireOrgId(ctx);
      const membership = await db.query.organizationMember.findFirst({
        where: eq(organizationMember.organizationId, orgId),
        with: { organization: true }
      });

      if (!membership?.organization || membership.organization.type !== 'shipper') {
        throw new Error("Organisation ist kein Versender");
      }

      const connectedForwarders = await db
        .select({ forwarderOrganizationId: organizationConnection.forwarderOrganizationId })
        .from(organizationConnection)
        .where(and(
          eq(organizationConnection.shipperOrganizationId, membership.organization.id),
          eq(organizationConnection.status, "connected")
        ));

      if (!connectedForwarders.length) {
        return [];
      }

      const forwarderIds = connectedForwarders.map((conn) => conn.forwarderOrganizationId);

      const forwarders = await db.query.organization.findMany({
        where: and(
          eq(organization.type, 'forwarder'),
          inArray(organization.id, forwarderIds)
        ),
        columns: {
          id: true,
          name: true,
          email: true,
          city: true,
          country: true,
          isActive: true
        }
      });
      
      return forwarders;
    } catch {
      throw new Error('Failed to fetch forwarders');
    }
  }),

  // Get shipper's inquiries
  getMyInquiries: protectedProcedure.query(async ({ ctx }: { ctx: TRPCContext }) => {
    const { db, session } = ctx;
    
    try {
      // Check and update expired items first
      await checkAndUpdateExpiredItems(db);
      
      // Get membership first
      const orgId = await requireOrgId(ctx);
      const membership = await db.query.organizationMember.findFirst({
        where: eq(organizationMember.organizationId, orgId),
        with: { organization: true }
      });
      
      if (!membership?.organization) {
        return [];
      }

      if (membership.organization.type !== 'shipper') {
        throw new Error("Organisation ist kein Versender");
      }
      
      // Get inquiries created by this shipper with quotation data
      const inquiries = await db.query.inquiry.findMany({
        where: eq(inquiry.shipperOrganizationId, membership.organization.id),
        with: {
          packages: true,
          sentToForwarders: {
            with: {
              forwarderOrganization: {
                columns: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            },
            columns: {
              id: true,
              forwarderOrganizationId: true,
              sentAt: true,
              viewedAt: true,
              rejectedAt: true,
              responseStatus: true,
              createdAt: true
            }
          },
          createdBy: {
            columns: {
              id: true,
              name: true,
              email: true
            }
          },
          quotations: {
            where: ne(quotation.status, "draft"), // Only submitted quotations
            columns: {
              id: true,
              totalPrice: true,
              currency: true,
              status: true
            },
            orderBy: [quotation.totalPrice] // Order by price to get the best price first
          }
        },
        orderBy: [desc(inquiry.createdAt)],
        limit: 50
      });

      // Calculate forwarder response summary for each inquiry
      const inquiriesWithResponseSummary = inquiries.map(inquiry => {
        const totalForwarders = inquiry.sentToForwarders.length;
        const pendingResponses = inquiry.sentToForwarders.filter(f => f.responseStatus === "pending").length;
        const rejectedResponses = inquiry.sentToForwarders.filter(f => f.responseStatus === "rejected").length;
        const quotedResponses = inquiry.sentToForwarders.filter(f => f.responseStatus === "quoted").length;
        
        return {
          ...inquiry,
          forwarderResponseSummary: {
            total: totalForwarders,
            pending: pendingResponses,
            rejected: rejectedResponses,
            quoted: quotedResponses
          }
        };
      });
      
      return inquiriesWithResponseSummary;
    } catch {
      throw new Error('Failed to fetch inquiries');
    }
  }),

  // Create a new inquiry
  createInquiry: protectedProcedure
    .input(z.object({
      title: z.string().min(1, "Titel ist erforderlich"),
      description: z.string().optional(),
      shipperReference: z.string().optional(), // Optional reference from shipper
      serviceType: z.enum(["air_freight", "sea_freight", "road_freight", "rail_freight"]),
      serviceDirection: z.enum(["import", "export"]),
      originAirport: z.string().optional().default(""),
      originCity: z.string().min(1, "Abgangsstadt ist erforderlich"),
      originCountry: z.string().min(1, "Abgangsland ist erforderlich"),
      destinationAirport: z.string().optional().default(""),
      destinationCity: z.string().min(1, "Zielstadt ist erforderlich"),
      destinationCountry: z.string().min(1, "Zielland ist erforderlich"),
      cargoType: z.enum(["general", "dangerous", "perishable", "fragile", "oversized"]),
      cargoDescription: z.string().optional(),
      incoterms: z.string().min(1, "Incoterms ist erforderlich"),
      readyDate: z.string().min(1, "Bereitschaftsdatum ist erforderlich"),
      deliveryDate: z.string().optional(),
      validityDate: z.string().optional(),
      selectedForwarderIds: z.array(z.string()).min(1, "Mindestens ein Spediteur muss ausgewählt werden"),
      packages: z.array(z.object({
        packageNumber: z.string().min(1, "Paketnummer ist erforderlich"),
        description: z.string().optional(),
        pieces: z.number().min(1, "Anzahl der Stücke muss mindestens 1 sein"),
        grossWeight: z.number().min(0.1, "Bruttogewicht muss größer als 0 sein"),
        chargeableWeight: z.number().optional(),
        length: z.number().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        temperature: z.string().optional(),
        specialHandling: z.string().optional(),
        isDangerous: z.boolean().default(false),
        dangerousGoodsClass: z.string().optional(),
        unNumber: z.string().optional()
      })).min(1, "Mindestens ein Paket ist erforderlich")
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      
      try {
        // Get membership first
      const orgId = await requireOrgId(ctx);
      const membership = await db.query.organizationMember.findFirst({
        where: eq(organizationMember.organizationId, orgId),
        with: { organization: true }
      });
        
        if (!membership?.organization || membership.organization.type !== 'shipper') {
          throw new Error("Organisation ist kein Versender");
        }

        const connectedForwarders = await db
          .select({ forwarderOrganizationId: organizationConnection.forwarderOrganizationId })
          .from(organizationConnection)
          .where(and(
            eq(organizationConnection.shipperOrganizationId, membership.organization.id),
            eq(organizationConnection.status, "connected"),
            inArray(organizationConnection.forwarderOrganizationId, input.selectedForwarderIds)
          ));

        if (connectedForwarders.length !== input.selectedForwarderIds.length) {
          throw new Error("Bitte wähle nur verbundene Spediteure aus");
        }

        // Generate reference number
        const referenceNumber = `INQ-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

        // Create inquiry
        const inquiryData = {
          referenceNumber,
          shipperReference: input.shipperReference || null,
          title: input.title,
          description: input.description,
          serviceType: input.serviceType,
          serviceDirection: input.serviceDirection,
          originAirport: input.originAirport || "",
          originCity: input.originCity,
          originCountry: input.originCountry,
          destinationAirport: input.destinationAirport || "",
          destinationCity: input.destinationCity,
          destinationCountry: input.destinationCountry,
          cargoType: input.cargoType,
          cargoDescription: input.cargoDescription,
          incoterms: input.incoterms || 'EXW', // Default to EXW if not provided
          readyDate: new Date(input.readyDate),
          deliveryDate: input.deliveryDate ? new Date(input.deliveryDate) : null,
          validityDate: input.validityDate ? new Date(input.validityDate) : null,
          status: 'open' as const, // Inquiry is sent to forwarders and open for quotations
          sentAt: new Date(), // Track when inquiry was sent
          shipperOrganizationId: membership.organization.id,
          createdById: session.user.id
        };

        const newInquiry = await db.insert(inquiry).values(inquiryData).returning();

        const inquiryId = newInquiry[0].id;

        // Create packages
        if (input.packages.length > 0) {
          const packageData = input.packages.map(pkg => {
            const volumePerPiece = pkg.length && pkg.width && pkg.height
              ? calculateVolume({ length: pkg.length, width: pkg.width, height: pkg.height })
              : null;
            const totalVolume = volumePerPiece && pkg.pieces
              ? volumePerPiece * pkg.pieces
              : null;

            return {
              inquiryId,
              packageNumber: pkg.packageNumber,
              description: pkg.description,
              pieces: pkg.pieces,
              grossWeight: pkg.grossWeight.toString(),
              chargeableWeight: pkg.chargeableWeight?.toString(),
              length: pkg.length?.toString(),
              width: pkg.width?.toString(),
              height: pkg.height?.toString(),
              volume: totalVolume ? totalVolume.toString() : null,
              temperature: pkg.temperature,
              specialHandling: pkg.specialHandling,
              isDangerous: pkg.isDangerous,
              dangerousGoodsClass: pkg.dangerousGoodsClass,
              unNumber: pkg.unNumber
            };
          });
          
          await db.insert(inquiryPackage).values(packageData);
        }

        // Send to selected forwarders
        if (input.selectedForwarderIds.length > 0) {
          const forwarderData = input.selectedForwarderIds.map(forwarderId => ({
            inquiryId,
            forwarderOrganizationId: forwarderId,
            sentAt: new Date()
          }));
          
          await db.insert(inquiryForwarder).values(forwarderData);
        }

        return {
          success: true,
          inquiryId,
          referenceNumber
        };
      } catch (error) {
        throw new Error(`Failed to create inquiry: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  // Create inquiry as draft (not sent to forwarders yet)
  createInquiryDraft: protectedProcedure
    .input(z.object({
      title: z.string().min(1, "Titel ist erforderlich"),
      description: z.string().optional(),
      shipperReference: z.string().optional(), // Optional reference from shipper
      serviceType: z.enum(["air_freight", "sea_freight", "road_freight", "rail_freight"]),
      serviceDirection: z.enum(["import", "export"]),
      originAirport: z.string().optional().default(""),
      originCity: z.string().min(1, "Abgangsstadt ist erforderlich"),
      originCountry: z.string().min(1, "Abgangsland ist erforderlich"),
      destinationAirport: z.string().optional().default(""),
      destinationCity: z.string().min(1, "Zielstadt ist erforderlich"),
      destinationCountry: z.string().min(1, "Zielland ist erforderlich"),
      cargoType: z.enum(["general", "dangerous", "perishable", "fragile", "oversized"]),
      cargoDescription: z.string().optional(),
      incoterms: z.string().min(1, "Incoterms ist erforderlich"),
      readyDate: z.string().min(1, "Bereitschaftsdatum ist erforderlich"),
      deliveryDate: z.string().optional(),
      validityDate: z.string().optional(),
      packages: z.array(z.object({
        packageNumber: z.string().min(1, "Paketnummer ist erforderlich"),
        description: z.string().optional(),
        pieces: z.number().min(1, "Anzahl der Stücke muss mindestens 1 sein"),
        grossWeight: z.number().min(0.1, "Bruttogewicht muss größer als 0 sein"),
        chargeableWeight: z.number().optional(),
        length: z.number().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        temperature: z.string().optional(),
        specialHandling: z.string().optional(),
        isDangerous: z.boolean().default(false),
        dangerousGoodsClass: z.string().optional(),
        unNumber: z.string().optional()
      })).min(1, "Mindestens ein Paket ist erforderlich")
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      
      try {
        // Get membership first
        const membership = await db.query.organizationMember.findFirst({
          where: eq(organizationMember.userId, session.user.id),
          with: { organization: true }
        });
        
        if (!membership?.organization || membership.organization.type !== 'shipper') {
          throw new Error("Organisation ist kein Versender");
        }

        // Generate reference number
        const referenceNumber = `INQ-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

        // Create inquiry as draft
        const inquiryData = {
          referenceNumber,
          title: input.title,
          description: input.description,
          serviceType: input.serviceType,
          originAirport: input.originAirport,
          originCity: input.originCity,
          originCountry: input.originCountry,
          destinationAirport: input.destinationAirport,
          destinationCity: input.destinationCity,
          destinationCountry: input.destinationCountry,
          cargoType: input.cargoType,
          cargoDescription: input.cargoDescription,
          incoterms: input.incoterms || 'EXW',
          readyDate: new Date(input.readyDate),
          deliveryDate: input.deliveryDate ? new Date(input.deliveryDate) : null,
          validityDate: input.validityDate ? new Date(input.validityDate) : null,
          status: 'draft' as const, // Keep as draft
          shipperOrganizationId: membership.organization.id,
          createdById: session.user.id
        };

        const newInquiry = await db.insert(inquiry).values(inquiryData).returning();
        const inquiryId = newInquiry[0].id;

        // Create packages
        if (input.packages.length > 0) {
          const packageData = input.packages.map(pkg => {
            const volumePerPiece = pkg.length && pkg.width && pkg.height
              ? calculateVolume({ length: pkg.length, width: pkg.width, height: pkg.height })
              : null;
            const totalVolume = volumePerPiece && pkg.pieces
              ? volumePerPiece * pkg.pieces
              : null;

            return {
              inquiryId,
              packageNumber: pkg.packageNumber,
              description: pkg.description,
              pieces: pkg.pieces,
              grossWeight: pkg.grossWeight.toString(),
              chargeableWeight: pkg.chargeableWeight?.toString(),
              length: pkg.length?.toString(),
              width: pkg.width?.toString(),
              height: pkg.height?.toString(),
              volume: totalVolume ? totalVolume.toString() : null,
              temperature: pkg.temperature,
              specialHandling: pkg.specialHandling,
              isDangerous: pkg.isDangerous,
              dangerousGoodsClass: pkg.dangerousGoodsClass,
              unNumber: pkg.unNumber
            };
          });
          
          await db.insert(inquiryPackage).values(packageData);
        }

        return {
          success: true,
          inquiryId,
          referenceNumber
        };
      } catch (error) {
        throw new Error(`Failed to create inquiry draft: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  // Send draft inquiry to forwarders
  sendInquiryToForwarders: protectedProcedure
    .input(z.object({
      inquiryId: z.string(),
      selectedForwarderIds: z.array(z.string()).min(1, "Mindestens ein Spediteur muss ausgewählt werden")
    }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      
      try {
        // Get membership first
        const orgId = await requireOrgId(ctx);
        const membership = await db.query.organizationMember.findFirst({
          where: eq(organizationMember.organizationId, orgId),
          with: { organization: true }
        });
        
        if (!membership?.organization || membership.organization.type !== 'shipper') {
          throw new Error("Organisation ist kein Versender");
        }

        // Verify inquiry exists and belongs to this shipper
        const inquiryResult = await db
          .select({ id: inquiry.id, status: inquiry.status })
          .from(inquiry)
          .where(
            and(
              eq(inquiry.id, input.inquiryId),
              eq(inquiry.shipperOrganizationId, membership.organization.id)
            )
          )
          .limit(1);

        if (!inquiryResult.length) {
          throw new Error("Frachtanfrage nicht gefunden oder nicht zugänglich");
        }

        if (inquiryResult[0].status !== 'draft') {
          throw new Error("Frachtanfrage kann nur im Entwurfsstatus gesendet werden");
        }

        const connectedForwarders = await db
          .select({ forwarderOrganizationId: organizationConnection.forwarderOrganizationId })
          .from(organizationConnection)
          .where(and(
            eq(organizationConnection.shipperOrganizationId, membership.organization.id),
            eq(organizationConnection.status, "connected"),
            inArray(organizationConnection.forwarderOrganizationId, input.selectedForwarderIds)
          ));

        if (connectedForwarders.length !== input.selectedForwarderIds.length) {
          throw new Error("Bitte wähle nur verbundene Spediteure aus");
        }

        // Update inquiry status to open and set sentAt
        await db
          .update(inquiry)
          .set({
            status: 'open',
            sentAt: new Date()
          })
          .where(eq(inquiry.id, input.inquiryId));

        // Send to selected forwarders
        const forwarderData = input.selectedForwarderIds.map(forwarderId => ({
          inquiryId: input.inquiryId,
          forwarderOrganizationId: forwarderId,
          sentAt: new Date()
        }));
        
        await db.insert(inquiryForwarder).values(forwarderData);

        return { success: true };
      } catch (error) {
        throw new Error(`Failed to send inquiry: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  // Cancel inquiry
  cancelInquiry: protectedProcedure
    .input(inquiryIdSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      
      try {
        // Get membership first
        const orgId = await requireOrgId(ctx);
        const membership = await db.query.organizationMember.findFirst({
          where: eq(organizationMember.organizationId, orgId),
          with: { organization: true }
        });
        
        if (!membership?.organization || membership.organization.type !== 'shipper') {
          throw new Error("Organisation ist kein Versender");
        }

        // Verify inquiry exists and belongs to this shipper
        const inquiryResult = await db
          .select({ id: inquiry.id, status: inquiry.status })
          .from(inquiry)
          .where(
            and(
              eq(inquiry.id, input.inquiryId),
              eq(inquiry.shipperOrganizationId, membership.organization.id)
            )
          )
          .limit(1);

        if (!inquiryResult.length) {
          throw new Error("Frachtanfrage nicht gefunden oder nicht zugänglich");
        }

        // Check if any quotations exist for this inquiry
        const hasQuotations = await db
          .select({ id: quotation.id })
          .from(quotation)
          .where(eq(quotation.inquiryId, input.inquiryId))
          .limit(1);

        if (hasQuotations.length > 0) {
          throw new Error("Frachtanfrage kann nicht storniert werden, da bereits Angebote eingegangen sind");
        }

        // Update inquiry status to cancelled
        await db
          .update(inquiry)
          .set({
            status: 'cancelled',
            closedAt: new Date()
          })
          .where(eq(inquiry.id, input.inquiryId));

        return { success: true };
      } catch (error) {
        throw new Error(`Failed to cancel inquiry: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    })
}); 