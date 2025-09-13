import { createTRPCRouter, protectedProcedure, TRPCContext } from "@/trpc/init";
import { eq, desc, and } from "drizzle-orm";
import { organization, organizationMember, inquiry, inquiryForwarder, inquiryPackage } from "@/db/schema";
import { z } from "zod";
import { checkAndUpdateExpiredItems } from "@/lib/expiration-utils";

export const shipperRouter = createTRPCRouter({
  // Get all forwarders for selection
  getAllForwarders: protectedProcedure.query(async ({ ctx }: { ctx: TRPCContext }) => {
    const { db } = ctx;
    
    try {
      console.log('🚀 Getting all forwarders for shipper...');
      
      // Get all forwarder organizations
      const forwarders = await db.query.organization.findMany({
        where: eq(organization.type, 'forwarder'),
        columns: {
          id: true,
          name: true,
          email: true,
          city: true,
          country: true,
          isActive: true
        }
      });
      
      console.log(`📊 Found ${forwarders.length} forwarders`);
      return forwarders;
    } catch (error) {
      console.error('Error fetching forwarders:', error);
      throw new Error('Failed to fetch forwarders');
    }
  }),

  // Get shipper's inquiries
  getMyInquiries: protectedProcedure.query(async ({ ctx }: { ctx: TRPCContext }) => {
    const { db, session } = ctx;
    
    try {
      console.log('🚀 Getting shipper inquiries...');
      
      // Check and update expired items first
      await checkAndUpdateExpiredItems(db);
      
      // Get membership first
      const membership = await db.query.organizationMember.findFirst({
        where: eq(organizationMember.userId, session.user.id),
        with: { organization: true }
      });
      
      if (!membership?.organization) {
        console.log('No organization found for user:', session.user.id);
        return [];
      }

      if (membership.organization.type !== 'shipper') {
        console.log('User organization is not a shipper:', membership.organization.type);
        throw new Error("Organisation ist kein Versender");
      }
      
      // Get inquiries created by this shipper
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
            }
          },
          createdBy: {
            columns: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: [desc(inquiry.createdAt)],
        limit: 50
      });

      console.log(`📊 Found ${inquiries.length} inquiries`);
      return inquiries;
    } catch (error) {
      console.error('Error fetching shipper inquiries:', error);
      throw new Error('Failed to fetch inquiries');
    }
  }),

  // Create a new inquiry
  createInquiry: protectedProcedure
    .input(z.object({
      title: z.string().min(1, "Titel ist erforderlich"),
      description: z.string().optional(),
      serviceType: z.enum(["air_freight", "sea_freight", "road_freight", "rail_freight"]),
      originAirport: z.string().min(1, "Abgangsflughafen ist erforderlich"),
      originCity: z.string().min(1, "Abgangsstadt ist erforderlich"),
      originCountry: z.string().min(1, "Abgangsland ist erforderlich"),
      destinationAirport: z.string().min(1, "Zielflughafen ist erforderlich"),
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
        console.log('🚀 Creating new inquiry...');
        console.log('📝 Input data:', {
          title: input.title,
          serviceType: input.serviceType,
          packagesCount: input.packages.length,
          forwardersCount: input.selectedForwarderIds.length
        });
        
        // Get membership first
        const membership = await db.query.organizationMember.findFirst({
          where: eq(organizationMember.userId, session.user.id),
          with: { organization: true }
        });
        
        if (!membership?.organization || membership.organization.type !== 'shipper') {
          throw new Error("Organisation ist kein Versender");
        }

        console.log('🏢 Organization found:', membership.organization.name);

        // Generate reference number
        const referenceNumber = `INQ-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        console.log('🔢 Generated reference number:', referenceNumber);

        // Create inquiry
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
          incoterms: input.incoterms || 'EXW', // Default to EXW if not provided
          readyDate: new Date(input.readyDate),
          deliveryDate: input.deliveryDate ? new Date(input.deliveryDate) : null,
          validityDate: input.validityDate ? new Date(input.validityDate) : null,
          status: 'offen' as const, // Inquiry is sent to forwarders and open for quotations
          sentAt: new Date(), // Track when inquiry was sent
          shipperOrganizationId: membership.organization.id,
          createdById: session.user.id
        };

        console.log('💾 Creating inquiry with data:', inquiryData);
        const newInquiry = await db.insert(inquiry).values(inquiryData).returning();

        const inquiryId = newInquiry[0].id;
        console.log('✅ Inquiry created with ID:', inquiryId);

        // Create packages
        if (input.packages.length > 0) {
          const packageData = input.packages.map(pkg => ({
            inquiryId,
            packageNumber: pkg.packageNumber,
            description: pkg.description,
            pieces: pkg.pieces,
            grossWeight: pkg.grossWeight.toString(),
            chargeableWeight: pkg.chargeableWeight?.toString(),
            length: pkg.length?.toString(),
            width: pkg.width?.toString(),
            height: pkg.height?.toString(),
            temperature: pkg.temperature,
            specialHandling: pkg.specialHandling,
            isDangerous: pkg.isDangerous,
            dangerousGoodsClass: pkg.dangerousGoodsClass,
            unNumber: pkg.unNumber
          }));
          
          console.log('📦 Creating packages:', packageData.length);
          await db.insert(inquiryPackage).values(packageData);
        }

        // Send to selected forwarders
        if (input.selectedForwarderIds.length > 0) {
          const forwarderData = input.selectedForwarderIds.map(forwarderId => ({
            inquiryId,
            forwarderOrganizationId: forwarderId,
            sentAt: new Date()
          }));
          
          console.log('📤 Sending to forwarders:', input.selectedForwarderIds.length);
          await db.insert(inquiryForwarder).values(forwarderData);
        }

        console.log(`✅ Inquiry created successfully: ${referenceNumber}`);
        return {
          success: true,
          inquiryId,
          referenceNumber
        };
      } catch (error) {
        console.error('❌ Error creating inquiry:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        throw new Error(`Failed to create inquiry: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  // Create inquiry as draft (not sent to forwarders yet)
  createInquiryDraft: protectedProcedure
    .input(z.object({
      title: z.string().min(1, "Titel ist erforderlich"),
      description: z.string().optional(),
      serviceType: z.enum(["air_freight", "sea_freight", "road_freight", "rail_freight"]),
      originAirport: z.string().min(1, "Abgangsflughafen ist erforderlich"),
      originCity: z.string().min(1, "Abgangsstadt ist erforderlich"),
      originCountry: z.string().min(1, "Abgangsland ist erforderlich"),
      destinationAirport: z.string().min(1, "Zielflughafen ist erforderlich"),
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
        console.log('🚀 Creating inquiry draft...');
        
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
          const packageData = input.packages.map(pkg => ({
            inquiryId,
            packageNumber: pkg.packageNumber,
            description: pkg.description,
            pieces: pkg.pieces,
            grossWeight: pkg.grossWeight.toString(),
            chargeableWeight: pkg.chargeableWeight?.toString(),
            length: pkg.length?.toString(),
            width: pkg.width?.toString(),
            height: pkg.height?.toString(),
            temperature: pkg.temperature,
            specialHandling: pkg.specialHandling,
            isDangerous: pkg.isDangerous,
            dangerousGoodsClass: pkg.dangerousGoodsClass,
            unNumber: pkg.unNumber
          }));
          
          await db.insert(inquiryPackage).values(packageData);
        }

        return {
          success: true,
          inquiryId,
          referenceNumber
        };
      } catch (error) {
        console.error('❌ Error creating inquiry draft:', error);
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
        const membership = await db.query.organizationMember.findFirst({
          where: eq(organizationMember.userId, session.user.id),
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

        // Update inquiry status to offen and set sentAt
        await db
          .update(inquiry)
          .set({
            status: 'offen',
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
        console.error('❌ Error sending inquiry to forwarders:', error);
        throw new Error(`Failed to send inquiry: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  // Close inquiry (when all quotations are rejected)
  closeInquiry: protectedProcedure
    .input(z.object({ inquiryId: z.string() }))
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

        if (inquiryResult[0].status !== 'offen') {
          throw new Error("Frachtanfrage kann nur im offenen Status geschlossen werden");
        }

        // Update inquiry status to closed
        await db
          .update(inquiry)
          .set({
            status: 'closed',
            closedAt: new Date()
          })
          .where(eq(inquiry.id, input.inquiryId));

        return { success: true };
      } catch (error) {
        console.error('❌ Error closing inquiry:', error);
        throw new Error(`Failed to close inquiry: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  // Cancel inquiry
  cancelInquiry: protectedProcedure
    .input(z.object({ inquiryId: z.string() }))
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

        if (inquiryResult[0].status === 'awarded') {
          throw new Error("Frachtanfrage kann nicht storniert werden, da bereits ein Angebot angenommen wurde");
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
        console.error('❌ Error cancelling inquiry:', error);
        throw new Error(`Failed to cancel inquiry: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    })
}); 