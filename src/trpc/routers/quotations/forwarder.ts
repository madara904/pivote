import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq, and } from "drizzle-orm";
import { quotation, organizationMember, organization, inquiry, inquiryForwarder } from "@/db/schema";
import { z } from "zod";
import { inquiryIdSchema, quotationIdSchema } from "@/trpc/common/schemas";
import { requireOrgId } from "@/trpc/common/membership";

const baseQuotationSchema = z.object({
  totalPrice: z.number().min(0, "Gesamtpreis muss positiv sein").max(1000000, "Gesamtpreis darf nicht mehr als 1.000.000 € betragen"),
  currency: z.string().default("EUR"),
  airlineFlight: z.string().optional(),
  transitTime: z.number().min(1, "Transitzeit muss mindestens 1 Tag betragen").optional(),
  validUntil: z.date(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  preCarriage: z.number().min(0, "Pre-carriage muss positiv sein").max(1000000, "Pre-carriage darf nicht mehr als 1.000.000 € betragen").default(0),
  mainCarriage: z.number().min(0, "Main carriage muss positiv sein").max(1000000, "Main carriage darf nicht mehr als 1.000.000 € betragen").default(0),
  onCarriage: z.number().min(0, "On-carriage muss positiv sein").max(1000000, "On-carriage darf nicht mehr als 1.000.000 € betragen").default(0),
  additionalCharges: z.number().min(0, "Zusatzkosten müssen positiv sein").max(1000000, "Zusatzkosten dürfen nicht mehr als 1.000.000 € betragen").default(0),
});

const createQuotationSchema = baseQuotationSchema.extend({
  inquiryId: z.string(),
}).refine((data) => {
  return data.preCarriage > 0 || data.mainCarriage > 0 || data.onCarriage > 0 || data.additionalCharges > 0;
}, {
  message: "Mindestens ein Kostenpunkt muss einen Wert größer als 0 haben",
  path: ["preCarriage"],
});

const updateQuotationSchema = baseQuotationSchema.extend({
  quotationId: z.string(),
}).refine((data) => {
  return data.preCarriage > 0 || data.mainCarriage > 0 || data.onCarriage > 0 || data.additionalCharges > 0;
}, {
  message: "Mindestens ein Kostenpunkt muss einen Wert größer als 0 haben",
  path: ["preCarriage"],
});

export const forwarderRouter = createTRPCRouter({
  // Check if inquiry has already been quoted by this forwarder
  checkQuotationExists: protectedProcedure
    .input(inquiryIdSchema)
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      
      const organizationId = await requireOrgId(ctx);

      // First check if inquiry exists and is not closed
      const inquiryResult = await db
        .select({ id: inquiry.id, status: inquiry.status })
        .from(inquiry)
        .where(eq(inquiry.id, input.inquiryId))
        .limit(1);
      
      if (!inquiryResult.length) {
        throw new Error("Frachtanfrage nicht gefunden");
      }

      if (inquiryResult[0].status === 'closed') {
        throw new Error("Diese Frachtanfrage ist bereits geschlossen");
      }

      // Check if this forwarder has already quoted this inquiry
      const existingQuotation = await db
        .select({ 
          id: quotation.id,
          quotationNumber: quotation.quotationNumber,
          totalPrice: quotation.totalPrice,
          currency: quotation.currency,
          airlineFlight: quotation.airlineFlight,
          transitTime: quotation.transitTime,
          validUntil: quotation.validUntil,
          notes: quotation.notes,
          terms: quotation.terms,
          preCarriage: quotation.preCarriage,
          mainCarriage: quotation.mainCarriage,
          onCarriage: quotation.onCarriage,
          additionalCharges: quotation.additionalCharges,
          status: quotation.status,
          createdAt: quotation.createdAt,
          submittedAt: quotation.submittedAt
        })
        .from(quotation)
        .where(
          and(
            eq(quotation.inquiryId, input.inquiryId),
            eq(quotation.forwarderOrganizationId, organizationId)
          )
        )
        .limit(1);

      return {
        exists: existingQuotation.length > 0,
        quotation: existingQuotation[0] || null
      };
    }),

  // Save quotation as draft (create new or update existing)
  saveDraftQuotation: protectedProcedure
    .input(createQuotationSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      
      const organizationId = await requireOrgId(ctx);
      
      // Verify the inquiry exists and user has access
      const inquiryResult = await db
        .select({ id: inquiry.id, status: inquiry.status })
        .from(inquiry)
        .where(eq(inquiry.id, input.inquiryId))
        .limit(1);
      
      if (!inquiryResult.length) {
        throw new Error("Frachtanfrage nicht gefunden");
      }

      if (inquiryResult[0].status === 'closed') {
        throw new Error("Diese Frachtanfrage ist bereits geschlossen");
      }

      // Check if this forwarder has already quoted this inquiry
      const existingQuotation = await db
        .select({ id: quotation.id, status: quotation.status })
        .from(quotation)
        .where(
          and(
            eq(quotation.inquiryId, input.inquiryId),
            eq(quotation.forwarderOrganizationId, organizationId)
          )
        )
        .limit(1);

      if (existingQuotation.length > 0) {
        // Check if quotation has been rejected
        if (existingQuotation[0].status === 'rejected') {
          throw new Error("Dieses Angebot wurde bereits abgelehnt und kann nicht bearbeitet werden");
        }

        // Update existing quotation as draft
        await db
          .update(quotation)
          .set({
            totalPrice: input.totalPrice.toString(),
            currency: input.currency,
            airlineFlight: input.airlineFlight,
            transitTime: input.transitTime,
            validUntil: input.validUntil,
            notes: input.notes,
            terms: input.terms,
            preCarriage: input.preCarriage.toString(),
            mainCarriage: input.mainCarriage.toString(),
            onCarriage: input.onCarriage.toString(),
            additionalCharges: input.additionalCharges.toString(),
            status: 'draft', // Ensure it stays as draft
            updatedAt: new Date(),
          })
          .where(eq(quotation.id, existingQuotation[0].id));

        return { 
          success: true, 
          quotationId: existingQuotation[0].id,
          quotationNumber: existingQuotation[0].id, // Will be updated with proper number
          isUpdate: true
        };
      } else {
        // Create new quotation as draft
        const quotationNumber = `QUO-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

        const quotationResult = await db
          .insert(quotation)
          .values({
            quotationNumber,
            inquiryId: input.inquiryId,
            forwarderOrganizationId: organizationId,
            totalPrice: input.totalPrice.toString(),
            currency: input.currency,
            airlineFlight: input.airlineFlight,
            transitTime: input.transitTime,
            validUntil: input.validUntil,
            notes: input.notes,
            terms: input.terms,
            preCarriage: input.preCarriage.toString(),
            mainCarriage: input.mainCarriage.toString(),
            onCarriage: input.onCarriage.toString(),
            additionalCharges: input.additionalCharges.toString(),
            status: 'draft', // Start as draft
            createdById: session.user.id,
          })
          .returning({ id: quotation.id });

        const quotationId = quotationResult[0].id;

        return { 
          success: true, 
          quotationId,
          quotationNumber,
          isUpdate: false
        };
      }
    }),

  createQuotation: protectedProcedure
    .input(createQuotationSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      
      const organizationId = await requireOrgId(ctx);
      
      // Verify the inquiry exists and user has access
      const inquiryResult = await db
        .select({ id: inquiry.id, status: inquiry.status })
        .from(inquiry)
        .where(eq(inquiry.id, input.inquiryId))
        .limit(1);
      
      if (!inquiryResult.length) {
        throw new Error("Frachtanfrage nicht gefunden");
      }

      if (inquiryResult[0].status === 'closed') {
        throw new Error("Diese Frachtanfrage ist bereits geschlossen");
      }

      // Check if this forwarder has already quoted this inquiry
      const existingQuotation = await db
        .select({ id: quotation.id, status: quotation.status })
        .from(quotation)
        .where(
          and(
            eq(quotation.inquiryId, input.inquiryId),
            eq(quotation.forwarderOrganizationId, organizationId)
          )
        )
        .limit(1);

      if (existingQuotation.length > 0) {
        // Check if quotation has been rejected
        if (existingQuotation[0].status === 'rejected') {
          throw new Error("Dieses Angebot wurde bereits abgelehnt und kann nicht bearbeitet werden");
        }

        // Update existing quotation and submit it
        await db
          .update(quotation)
          .set({
            totalPrice: input.totalPrice.toString(),
            currency: input.currency,
            airlineFlight: input.airlineFlight,
            transitTime: input.transitTime,
            validUntil: input.validUntil,
            notes: input.notes,
            terms: input.terms,
            preCarriage: input.preCarriage.toString(),
            mainCarriage: input.mainCarriage.toString(),
            onCarriage: input.onCarriage.toString(),
            additionalCharges: input.additionalCharges.toString(),
            status: 'submitted', // Submit the quotation
            submittedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(quotation.id, existingQuotation[0].id));

        return { 
          success: true, 
          quotationId: existingQuotation[0].id,
          quotationNumber: existingQuotation[0].id, // Will be updated with proper number
          isUpdate: true
        };
      } else {
        // Create new quotation and submit it immediately
        const quotationNumber = `QUO-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

        const quotationResult = await db
          .insert(quotation)
          .values({
            quotationNumber,
            inquiryId: input.inquiryId,
            forwarderOrganizationId: organizationId,
            totalPrice: input.totalPrice.toString(),
            currency: input.currency,
            airlineFlight: input.airlineFlight,
            transitTime: input.transitTime,
            validUntil: input.validUntil,
            notes: input.notes,
            terms: input.terms,
            preCarriage: input.preCarriage.toString(),
            mainCarriage: input.mainCarriage.toString(),
            onCarriage: input.onCarriage.toString(),
            additionalCharges: input.additionalCharges.toString(),
            status: 'submitted', // Submit immediately
            submittedAt: new Date(),
            createdById: session.user.id,
          })
          .returning({ id: quotation.id });

        const quotationId = quotationResult[0].id;

        // Update inquiry_forwarder response status to "quoted"
        await db
          .update(inquiryForwarder)
          .set({ responseStatus: "quoted" })
          .where(
            and(
              eq(inquiryForwarder.inquiryId, input.inquiryId),
              eq(inquiryForwarder.forwarderOrganizationId, organizationId)
            )
          );

        return { 
          success: true, 
          quotationId,
          quotationNumber,
          isUpdate: false
        };
      }
    }),

  updateQuotation: protectedProcedure
    .input(updateQuotationSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      
      const organizationId = await requireOrgId(ctx);

      // Verify the quotation exists and belongs to this forwarder
      const existingQuotation = await db
        .select({ id: quotation.id })
        .from(quotation)
        .where(
          and(
            eq(quotation.id, input.quotationId),
            eq(quotation.forwarderOrganizationId, organizationId)
          )
        )
        .limit(1);

      if (!existingQuotation.length) {
        throw new Error("Angebot nicht gefunden oder nicht zugänglich");
      }

      // Update quotation
      await db
        .update(quotation)
        .set({
          totalPrice: input.totalPrice.toString(),
          currency: input.currency,
          airlineFlight: input.airlineFlight,
          transitTime: input.transitTime,
          validUntil: input.validUntil,
          notes: input.notes,
          terms: input.terms,
          preCarriage: input.preCarriage.toString(),
          mainCarriage: input.mainCarriage.toString(),
          onCarriage: input.onCarriage.toString(),
          additionalCharges: input.additionalCharges.toString(),
          updatedAt: new Date(),
        })
        .where(eq(quotation.id, input.quotationId));

      return { 
        success: true, 
        quotationId: input.quotationId
      };
    }),

  getQuotation: protectedProcedure
    .input(quotationIdSchema)
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      
      const organizationId = await requireOrgId(ctx);

      // Get quotation
      const quotationResult = await db
        .select()
        .from(quotation)
        .where(
          and(
            eq(quotation.id, input.quotationId),
            eq(quotation.forwarderOrganizationId, organizationId)
          )
        )
        .limit(1);

      if (!quotationResult.length) {
        throw new Error("Angebot nicht gefunden");
      }

      const quotationData = quotationResult[0];

      return {
        ...quotationData,
        totalPrice: Number(quotationData.totalPrice),
        preCarriage: Number(quotationData.preCarriage),
        mainCarriage: Number(quotationData.mainCarriage),
        onCarriage: Number(quotationData.onCarriage),
        additionalCharges: Number(quotationData.additionalCharges),
      };
    }),

  listQuotations: protectedProcedure
    .query(async ({ ctx }) => {
      const { db, session } = ctx;
      
      const organizationId = await requireOrgId(ctx);

      // Get quotations
      const quotations = await db
        .select()
        .from(quotation)
        .where(eq(quotation.forwarderOrganizationId, organizationId))
        .orderBy(quotation.createdAt);

      return quotations.map(quotation => ({
        ...quotation,
        totalPrice: Number(quotation.totalPrice),
      }));
    }),

  // Submit quotation (change from draft to submitted)
  submitQuotation: protectedProcedure
    .input(quotationIdSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      
      const organizationId = await requireOrgId(ctx);

      // Verify the quotation exists and belongs to this forwarder
      const existingQuotation = await db
        .select({ id: quotation.id, status: quotation.status })
        .from(quotation)
        .where(
          and(
            eq(quotation.id, input.quotationId),
            eq(quotation.forwarderOrganizationId, organizationId)
          )
        )
        .limit(1);

      if (!existingQuotation.length) {
        throw new Error("Angebot nicht gefunden oder nicht zugänglich");
      }

      if (existingQuotation[0].status !== 'draft') {
        throw new Error("Angebot kann nur im Entwurfsstatus eingereicht werden");
      }

      // Update quotation status to submitted
      await db
        .update(quotation)
        .set({
          status: 'submitted',
          submittedAt: new Date(),
        })
        .where(eq(quotation.id, input.quotationId));

      return { success: true };
    }),

  // Withdraw quotation
  withdrawQuotation: protectedProcedure
    .input(quotationIdSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      
      const organizationId = await requireOrgId(ctx);

      // Verify the quotation exists and belongs to this forwarder
      const existingQuotation = await db
        .select({ id: quotation.id, status: quotation.status })
        .from(quotation)
        .where(
          and(
            eq(quotation.id, input.quotationId),
            eq(quotation.forwarderOrganizationId, organizationId)
          )
        )
        .limit(1);

      if (!existingQuotation.length) {
        throw new Error("Angebot nicht gefunden oder nicht zugänglich");
      }

      if (existingQuotation[0].status === 'accepted') {
        throw new Error("Angebot kann nicht zurückgezogen werden, da es bereits angenommen wurde");
      }

      if (existingQuotation[0].status === 'rejected') {
        throw new Error("Angebot kann nicht zurückgezogen werden, da es bereits abgelehnt wurde");
      }

      // Update quotation status to withdrawn
      await db
        .update(quotation)
        .set({
          status: 'withdrawn',
          withdrawnAt: new Date(),
        })
        .where(eq(quotation.id, input.quotationId));

      return { success: true };
    }),

  // Get quotations for a specific inquiry (read-only view)
  getInquiryQuotations: protectedProcedure
    .input(inquiryIdSchema)
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      
      const organizationId = await requireOrgId(ctx);

      // Get all quotations for this inquiry from this forwarder
      const quotations = await db
        .select({
          id: quotation.id,
          quotationNumber: quotation.quotationNumber,
          totalPrice: quotation.totalPrice,
          currency: quotation.currency,
          airlineFlight: quotation.airlineFlight,
          transitTime: quotation.transitTime,
          validUntil: quotation.validUntil,
          notes: quotation.notes,
          terms: quotation.terms,
          preCarriage: quotation.preCarriage,
          mainCarriage: quotation.mainCarriage,
          onCarriage: quotation.onCarriage,
          additionalCharges: quotation.additionalCharges,
          status: quotation.status,
          submittedAt: quotation.submittedAt,
          respondedAt: quotation.respondedAt,
          withdrawnAt: quotation.withdrawnAt,
          createdAt: quotation.createdAt,
          updatedAt: quotation.updatedAt,
        })
        .from(quotation)
        .where(
          and(
            eq(quotation.inquiryId, input.inquiryId),
            eq(quotation.forwarderOrganizationId, organizationId)
          )
        )
        .orderBy(quotation.createdAt);

      return quotations.map(quotation => ({
        ...quotation,
        totalPrice: Number(quotation.totalPrice),
        preCarriage: Number(quotation.preCarriage),
        mainCarriage: Number(quotation.mainCarriage),
        onCarriage: Number(quotation.onCarriage),
        additionalCharges: Number(quotation.additionalCharges),
      }));
    }),

  // Delete draft quotation
  deleteDraftQuotation: protectedProcedure
    .input(inquiryIdSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      
      const organizationId = await requireOrgId(ctx);

      // Find the draft quotation for this inquiry
      const existingQuotation = await db
        .select({ id: quotation.id, status: quotation.status })
        .from(quotation)
        .where(
          and(
            eq(quotation.inquiryId, input.inquiryId),
            eq(quotation.forwarderOrganizationId, organizationId),
            eq(quotation.status, 'draft')
          )
        )
        .limit(1);

      if (!existingQuotation.length) {
        throw new Error("Kein Entwurf gefunden");
      }

      // Delete the draft quotation
      await db
        .delete(quotation)
        .where(eq(quotation.id, existingQuotation[0].id));

      return { success: true };
    }),
});