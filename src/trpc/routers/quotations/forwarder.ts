/* eslint-disable @typescript-eslint/no-unused-vars */
import { createTRPCRouter, protectedProcedure, forwarderQuotationLimitMiddleware } from "@/trpc/init";
import { eq, and } from "drizzle-orm";
import { quotation, inquiry, inquiryForwarder } from "@/db/schema";
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

const correctQuotationSchema = baseQuotationSchema.extend({
  inquiryId: z.string(),
  quotationId: z.string(),
}).refine((data) => {
  return data.preCarriage > 0 || data.mainCarriage > 0 || data.onCarriage > 0 || data.additionalCharges > 0;
}, {
  message: "Mindestens ein Kostenpunkt muss einen Wert größer als 0 haben",
  path: ["preCarriage"],
});

export const forwarderRouter = createTRPCRouter({
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
      // ENFORCE: Only one quotation per inquiry per forwarder
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
        const existingStatus = existingQuotation[0].status;
        
        // Only allow draft update if status is "draft" - otherwise throw error
        if (existingStatus === 'draft') {
          // Update existing draft quotation
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
            quotationNumber: existingQuotation[0].id,
            isUpdate: true
          };
        } else {
          // Already has a quotation (submitted, withdrawn, accepted, rejected, expired) - cannot create another draft
          throw new Error("Sie haben bereits ein Angebot für diese Anfrage abgegeben. Bitte verwenden Sie 'Angebot korrigieren' um Änderungen vorzunehmen.");
        }
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
    .use(forwarderQuotationLimitMiddleware)
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
      // ENFORCE: Only one quotation per inquiry per forwarder
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
        const existingStatus = existingQuotation[0].status;
        
        // Only allow update if status is "draft" - otherwise throw error
        if (existingStatus === 'draft') {
          // Update existing draft quotation and submit it
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
              status: 'submitted',
              submittedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(quotation.id, existingQuotation[0].id));

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
            quotationId: existingQuotation[0].id,
            quotationNumber: existingQuotation[0].id,
            isUpdate: true
          };
        } else {
          // Already has a quotation (submitted, withdrawn, accepted, rejected, expired) - cannot create another
          throw new Error("Sie haben bereits ein Angebot für diese Anfrage abgegeben. Bitte verwenden Sie 'Angebot korrigieren' um Änderungen vorzunehmen.");
        }
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

  // Delete quotation (only if not accepted/rejected/expired)
  deleteQuotation: protectedProcedure
    .input(quotationIdSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      
      const organizationId = await requireOrgId(ctx);

      // Verify the quotation exists and belongs to this forwarder
      const existingQuotation = await db
        .select({ 
          id: quotation.id, 
          status: quotation.status,
          inquiryId: quotation.inquiryId 
        })
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

      const quotationStatus = existingQuotation[0].status;

      // Business rules: Only allow deletion of submitted, withdrawn, or draft quotations
      if (quotationStatus === 'accepted') {
        throw new Error("Angebot kann nicht gelöscht werden, da es bereits angenommen wurde");
      }

      if (quotationStatus === 'rejected') {
        throw new Error("Angebot kann nicht gelöscht werden, da es bereits abgelehnt wurde");
      }

      if (quotationStatus === 'expired') {
        throw new Error("Abgelaufene Angebote können nicht gelöscht werden");
      }

      const inquiryId = existingQuotation[0].inquiryId;

      // Delete the quotation
      await db
        .delete(quotation)
        .where(eq(quotation.id, input.quotationId));

      // Check if there are any remaining quotations for this inquiry from this forwarder
      const remainingQuotations = await db
        .select({ id: quotation.id })
        .from(quotation)
        .where(
          and(
            eq(quotation.inquiryId, inquiryId),
            eq(quotation.forwarderOrganizationId, organizationId)
          )
        )
        .limit(1);

      // If no quotations remain, reset the responseStatus to "pending"
      if (remainingQuotations.length === 0) {
        await db
          .update(inquiryForwarder)
          .set({ responseStatus: "pending" })
          .where(
            and(
              eq(inquiryForwarder.inquiryId, inquiryId),
              eq(inquiryForwarder.forwarderOrganizationId, organizationId)
            )
          );
      }

      return { success: true };
    }),

  // Correct/Update quotation - update existing quotation
  correctQuotation: protectedProcedure
    .input(correctQuotationSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      
      const organizationId = await requireOrgId(ctx);

      // Get the original quotation to verify ownership and status
      const originalQuotation = await db
        .select({ 
          id: quotation.id, 
          status: quotation.status,
          inquiryId: quotation.inquiryId,
          quotationNumber: quotation.quotationNumber
        })
        .from(quotation)
        .where(
          and(
            eq(quotation.id, input.quotationId),
            eq(quotation.forwarderOrganizationId, organizationId)
          )
        )
        .limit(1);

      if (!originalQuotation.length) {
        throw new Error("Angebot nicht gefunden oder nicht zugänglich");
      }

      const originalStatus = originalQuotation[0].status;

      // Business rules: Only allow correction of submitted or withdrawn quotations
      if (originalStatus === 'accepted') {
        throw new Error("Angebot kann nicht korrigiert werden, da es bereits angenommen wurde");
      }

      if (originalStatus === 'rejected') {
        throw new Error("Angebot kann nicht korrigiert werden, da es bereits abgelehnt wurde");
      }

      if (originalStatus === 'expired') {
        throw new Error("Abgelaufene Angebote können nicht korrigiert werden");
      }

      // Verify the inquiry exists
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

      // Update the existing quotation with corrected data
      const updateData: {
        totalPrice: string;
        currency: string;
        airlineFlight: string | null;
        transitTime: number | null;
        validUntil: Date;
        notes: string | null;
        terms: string | null;
        preCarriage: string;
        mainCarriage: string;
        onCarriage: string;
        additionalCharges: string;
        status: 'submitted';
        withdrawnAt: null;
        updatedAt: Date;
        submittedAt?: Date;
      } = {
        totalPrice: input.totalPrice.toString(),
        currency: input.currency,
        airlineFlight: input.airlineFlight || null,
        transitTime: input.transitTime || null,
        validUntil: input.validUntil,
        notes: input.notes || null,
        terms: input.terms || null,
        preCarriage: input.preCarriage.toString(),
        mainCarriage: input.mainCarriage.toString(),
        onCarriage: input.onCarriage.toString(),
        additionalCharges: input.additionalCharges.toString(),
        status: 'submitted',
        withdrawnAt: null,
        updatedAt: new Date(),
        ...(originalStatus === 'withdrawn' ? { submittedAt: new Date() } : {}),
      };

      await db
        .update(quotation)
        .set(updateData)
        .where(eq(quotation.id, input.quotationId));

      // Ensure inquiry_forwarder response status is "quoted"
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
        quotationId: input.quotationId,
        quotationNumber: originalQuotation[0].quotationNumber
      };
    }),
});