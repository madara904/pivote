import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq, and } from "drizzle-orm";
import { quotation, organizationMember, organization, inquiry } from "@/db/schema";
import { z } from "zod";

const baseQuotationSchema = z.object({
  totalPrice: z.number().min(0, "Gesamtpreis muss positiv sein"),
  currency: z.string().default("EUR"),
  airlineFlight: z.string().optional(),
  transitTime: z.number().min(1, "Transitzeit muss mindestens 1 Tag betragen").optional(),
  validUntil: z.date(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  preCarriage: z.number().min(0, "Pre-carriage muss positiv sein").default(0),
  mainCarriage: z.number().min(0, "Main carriage muss positiv sein").default(0),
  onCarriage: z.number().min(0, "On-carriage muss positiv sein").default(0),
  additionalCharges: z.number().min(0, "Zusatzkosten müssen positiv sein").default(0),
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
    .input(z.object({ inquiryId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      
      // Get user's organization membership
      const membershipResult = await db
        .select({
          organizationId: organizationMember.organizationId,
        })
        .from(organizationMember)
        .where(eq(organizationMember.userId, session.user.id))
        .limit(1);
      
      if (!membershipResult.length) {
        throw new Error("Benutzer ist nicht Teil einer Organisation");
      }

      const membership = membershipResult[0];

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
          submittedAt: quotation.submittedAt
        })
        .from(quotation)
        .where(
          and(
            eq(quotation.inquiryId, input.inquiryId),
            eq(quotation.forwarderOrganizationId, membership.organizationId)
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
      
      // Get user's organization membership
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
            eq(quotation.forwarderOrganizationId, membership.organizationId)
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
            forwarderOrganizationId: membership.organizationId,
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
      
      // Get user's organization membership
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
            eq(quotation.forwarderOrganizationId, membership.organizationId)
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
            forwarderOrganizationId: membership.organizationId,
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
      
      // Get user's organization membership
      const membershipResult = await db
        .select({
          organizationId: organizationMember.organizationId,
        })
        .from(organizationMember)
        .where(eq(organizationMember.userId, session.user.id))
        .limit(1);
      
      if (!membershipResult.length) {
        throw new Error("Benutzer ist nicht Teil einer Organisation");
      }

      const membership = membershipResult[0];

      // Verify the quotation exists and belongs to this forwarder
      const existingQuotation = await db
        .select({ id: quotation.id })
        .from(quotation)
        .where(
          and(
            eq(quotation.id, input.quotationId),
            eq(quotation.forwarderOrganizationId, membership.organizationId)
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
    .input(z.object({ quotationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      
      // Get user's organization membership
      const membershipResult = await db
        .select({
          organizationId: organizationMember.organizationId,
        })
        .from(organizationMember)
        .where(eq(organizationMember.userId, session.user.id))
        .limit(1);
      
      if (!membershipResult.length) {
        throw new Error("Benutzer ist nicht Teil einer Organisation");
      }

      const membership = membershipResult[0];

      // Get quotation
      const quotationResult = await db
        .select()
        .from(quotation)
        .where(
          and(
            eq(quotation.id, input.quotationId),
            eq(quotation.forwarderOrganizationId, membership.organizationId)
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
      
      // Get user's organization membership
      const membershipResult = await db
        .select({
          organizationId: organizationMember.organizationId,
        })
        .from(organizationMember)
        .where(eq(organizationMember.userId, session.user.id))
        .limit(1);
      
      if (!membershipResult.length) {
        throw new Error("Benutzer ist nicht Teil einer Organisation");
      }

      const membership = membershipResult[0];

      // Get quotations
      const quotations = await db
        .select()
        .from(quotation)
        .where(eq(quotation.forwarderOrganizationId, membership.organizationId))
        .orderBy(quotation.createdAt);

      return quotations.map(quotation => ({
        ...quotation,
        totalPrice: Number(quotation.totalPrice),
      }));
    }),

  // Submit quotation (change from draft to submitted)
  submitQuotation: protectedProcedure
    .input(z.object({ quotationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      
      // Get user's organization membership
      const membershipResult = await db
        .select({
          organizationId: organizationMember.organizationId,
        })
        .from(organizationMember)
        .where(eq(organizationMember.userId, session.user.id))
        .limit(1);
      
      if (!membershipResult.length) {
        throw new Error("Benutzer ist nicht Teil einer Organisation");
      }

      const membership = membershipResult[0];

      // Verify the quotation exists and belongs to this forwarder
      const existingQuotation = await db
        .select({ id: quotation.id, status: quotation.status })
        .from(quotation)
        .where(
          and(
            eq(quotation.id, input.quotationId),
            eq(quotation.forwarderOrganizationId, membership.organizationId)
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
    .input(z.object({ quotationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      
      // Get user's organization membership
      const membershipResult = await db
        .select({
          organizationId: organizationMember.organizationId,
        })
        .from(organizationMember)
        .where(eq(organizationMember.userId, session.user.id))
        .limit(1);
      
      if (!membershipResult.length) {
        throw new Error("Benutzer ist nicht Teil einer Organisation");
      }

      const membership = membershipResult[0];

      // Verify the quotation exists and belongs to this forwarder
      const existingQuotation = await db
        .select({ id: quotation.id, status: quotation.status })
        .from(quotation)
        .where(
          and(
            eq(quotation.id, input.quotationId),
            eq(quotation.forwarderOrganizationId, membership.organizationId)
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
    .input(z.object({ inquiryId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      
      // Get user's organization membership
      const membershipResult = await db
        .select({
          organizationId: organizationMember.organizationId,
        })
        .from(organizationMember)
        .where(eq(organizationMember.userId, session.user.id))
        .limit(1);
      
      if (!membershipResult.length) {
        throw new Error("Benutzer ist nicht Teil einer Organisation");
      }

      const membership = membershipResult[0];

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
            eq(quotation.forwarderOrganizationId, membership.organizationId)
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
    .input(z.object({ inquiryId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      
      // Get user's organization membership
      const membershipResult = await db
        .select({
          organizationId: organizationMember.organizationId,
        })
        .from(organizationMember)
        .where(eq(organizationMember.userId, session.user.id))
        .limit(1);
      
      if (!membershipResult.length) {
        throw new Error("Benutzer ist nicht Teil einer Organisation");
      }

      const membership = membershipResult[0];

      // Find the draft quotation for this inquiry
      const existingQuotation = await db
        .select({ id: quotation.id, status: quotation.status })
        .from(quotation)
        .where(
          and(
            eq(quotation.inquiryId, input.inquiryId),
            eq(quotation.forwarderOrganizationId, membership.organizationId),
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