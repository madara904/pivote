import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq, and, desc, ne } from "drizzle-orm";
import { quotation, organizationMember, organization, inquiry } from "@/db/schema";
import { z } from "zod";
import { inquiryIdSchema, quotationIdSchema } from "@/trpc/common/schemas";
import { requireOrgId } from "@/trpc/common/membership";

export const shipperRouter = createTRPCRouter({
  // Get all quotations for a specific inquiry
  getQuotationsForInquiry: protectedProcedure
    .input(inquiryIdSchema)
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      
      const organizationId = await requireOrgId(ctx);
      
      // Verify the inquiry belongs to this shipper
      const inquiryResult = await db
        .select({ id: inquiry.id })
        .from(inquiry)
        .where(
          and(
            eq(inquiry.id, input.inquiryId),
            eq(inquiry.shipperOrganizationId, organizationId)
          )
        )
        .limit(1);
      
      if (!inquiryResult.length) {
        throw new Error("Frachtanfrage nicht gefunden oder nicht zugänglich");
      }

      // Get all quotations for this inquiry
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
          createdAt: quotation.createdAt,
          forwarderOrganization: {
            id: organization.id,
            name: organization.name,
            email: organization.email,
            city: organization.city,
            country: organization.country,
          }
        })
        .from(quotation)
        .innerJoin(organization, eq(quotation.forwarderOrganizationId, organization.id))
        .where(
          and(
            eq(quotation.inquiryId, input.inquiryId),
            ne(quotation.status, "draft") // Exclude drafts - shippers should only see submitted quotations
          )
        )
        .orderBy(desc(quotation.createdAt));

      // Return quotations with charge data
      return quotations.map(quotation => ({
        ...quotation,
        totalPrice: Number(quotation.totalPrice),
        preCarriage: Number(quotation.preCarriage),
        mainCarriage: Number(quotation.mainCarriage),
        onCarriage: Number(quotation.onCarriage),
        additionalCharges: Number(quotation.additionalCharges),
      }));
    }),

  // Get a specific quotation with details
  getQuotation: protectedProcedure
    .input(quotationIdSchema)
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      
      const organizationId = await requireOrgId(ctx);

      // Get quotation with forwarder details
      const quotationResult = await db
        .select({
          id: quotation.id,
          quotationNumber: quotation.quotationNumber,
          inquiryId: quotation.inquiryId,
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
          createdAt: quotation.createdAt,
          forwarderOrganization: {
            id: organization.id,
            name: organization.name,
            email: organization.email,
            city: organization.city,
            country: organization.country,
          }
        })
        .from(quotation)
        .innerJoin(organization, eq(quotation.forwarderOrganizationId, organization.id))
        .where(eq(quotation.id, input.quotationId))
        .limit(1);

      if (!quotationResult.length) {
        throw new Error("Angebot nicht gefunden");
      }

      const quotationData = quotationResult[0];

      // Verify the inquiry belongs to this shipper
      const inquiryResult = await db
        .select({ id: inquiry.id })
        .from(inquiry)
        .where(
          and(
            eq(inquiry.id, quotationData.inquiryId),
            eq(inquiry.shipperOrganizationId, organizationId)
          )
        )
        .limit(1);
      
      if (!inquiryResult.length) {
        throw new Error("Angebot nicht zugänglich");
      }

      return {
        ...quotationData,
        totalPrice: Number(quotationData.totalPrice),
        preCarriage: Number(quotationData.preCarriage),
        mainCarriage: Number(quotationData.mainCarriage),
        onCarriage: Number(quotationData.onCarriage),
        additionalCharges: Number(quotationData.additionalCharges),
      };
    }),

  // Accept a quotation
  acceptQuotation: protectedProcedure
    .input(quotationIdSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      
      const organizationId = await requireOrgId(ctx);

      // Verify the quotation exists and belongs to this shipper
      const quotationResult = await db
        .select({
          id: quotation.id,
          inquiryId: quotation.inquiryId,
          status: quotation.status,
          inquiryStatus: inquiry.status,
        })
        .from(quotation)
        .innerJoin(inquiry, eq(quotation.inquiryId, inquiry.id))
        .where(
          and(
            eq(quotation.id, input.quotationId),
            eq(inquiry.shipperOrganizationId, organizationId)
          )
        )
        .limit(1);

      if (!quotationResult.length) {
        throw new Error("Angebot nicht gefunden oder nicht zugänglich");
      }

      if (quotationResult[0].status !== 'submitted') {
        throw new Error("Nur eingereichte Angebote können angenommen werden");
      }

      if (quotationResult[0].inquiryStatus === 'closed' || quotationResult[0].inquiryStatus === 'awarded' || quotationResult[0].inquiryStatus === 'cancelled') {
        throw new Error("Frachtanfrage ist bereits geschlossen oder vergeben");
      }

      // Update the accepted quotation
      await db
        .update(quotation)
        .set({
          status: "accepted",
          respondedAt: new Date(),
        })
        .where(eq(quotation.id, input.quotationId));

      // Reject all other quotations for this inquiry
      await db
        .update(quotation)
        .set({
          status: "rejected",
          respondedAt: new Date(),
        })
        .where(
          and(
            eq(quotation.inquiryId, quotationResult[0].inquiryId),
            eq(quotation.status, "submitted")
          )
        );

      // Update inquiry status to awarded
      await db
        .update(inquiry)
        .set({
          status: "awarded",
          closedAt: new Date(),
        })
        .where(eq(inquiry.id, quotationResult[0].inquiryId));

      return { success: true };
    }),

  // Reject a quotation
  rejectQuotation: protectedProcedure
    .input(quotationIdSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      
      const organizationId = await requireOrgId(ctx);

      // Verify the quotation exists and belongs to this shipper
      const quotationResult = await db
        .select({
          id: quotation.id,
          inquiryId: quotation.inquiryId,
          inquiryStatus: inquiry.status,
          quotationStatus: quotation.status,
        })
        .from(quotation)
        .innerJoin(inquiry, eq(quotation.inquiryId, inquiry.id))
        .where(
          and(
            eq(quotation.id, input.quotationId),
            eq(inquiry.shipperOrganizationId, organizationId)
          )
        )
        .limit(1);

      if (!quotationResult.length) {
        throw new Error("Angebot nicht gefunden oder nicht zugänglich");
      }

      if (quotationResult[0].inquiryStatus === 'closed' || quotationResult[0].inquiryStatus === 'awarded' || quotationResult[0].inquiryStatus === 'cancelled') {
        throw new Error("Frachtanfrage ist bereits geschlossen oder vergeben");
      }

      if (quotationResult[0].quotationStatus === 'accepted' || quotationResult[0].quotationStatus === 'withdrawn') {
        throw new Error("Angebot kann nicht abgelehnt werden, da es bereits angenommen oder zurückgezogen wurde");
      }

      // Update quotation status to rejected
      await db
        .update(quotation)
        .set({
          status: "rejected",
          respondedAt: new Date(),
        })
        .where(eq(quotation.id, input.quotationId));

      // Check if all quotations for this inquiry are now rejected
      const remainingQuotations = await db
        .select({ id: quotation.id })
        .from(quotation)
        .where(
          and(
            eq(quotation.inquiryId, quotationResult[0].inquiryId),
            ne(quotation.status, "rejected")
          )
        );

      // If all quotations are rejected, close the inquiry
      if (remainingQuotations.length === 0) {
        await db
          .update(inquiry)
          .set({
            status: "closed",
            closedAt: new Date(),
          })
          .where(eq(inquiry.id, quotationResult[0].inquiryId));
      }

      return { success: true };
    }),

  // Get all quotations for shipper (across all inquiries)
  getAllQuotations: protectedProcedure
    .query(async ({ ctx }) => {
      const { db, session } = ctx;
      
      const organizationId = await requireOrgId(ctx);

      // Get all quotations for inquiries created by this shipper
      const quotations = await db
        .select({
          id: quotation.id,
          quotationNumber: quotation.quotationNumber,
          inquiryId: quotation.inquiryId,
          totalPrice: quotation.totalPrice,
          currency: quotation.currency,
          airlineFlight: quotation.airlineFlight,
          transitTime: quotation.transitTime,
          validUntil: quotation.validUntil,
          status: quotation.status,
          submittedAt: quotation.submittedAt,
          respondedAt: quotation.respondedAt,
          createdAt: quotation.createdAt,
          forwarderOrganization: {
            id: organization.id,
            name: organization.name,
            email: organization.email,
            city: organization.city,
            country: organization.country,
          },
          inquiry: {
            id: inquiry.id,
            referenceNumber: inquiry.referenceNumber,
            title: inquiry.title,
            originCity: inquiry.originCity,
            originCountry: inquiry.originCountry,
            destinationCity: inquiry.destinationCity,
            destinationCountry: inquiry.destinationCountry,
          }
        })
        .from(quotation)
        .innerJoin(organization, eq(quotation.forwarderOrganizationId, organization.id))
        .innerJoin(inquiry, eq(quotation.inquiryId, inquiry.id))
        .where(eq(inquiry.shipperOrganizationId, organizationId))
        .orderBy(desc(quotation.createdAt));

      return quotations.map(quotation => ({
        ...quotation,
        totalPrice: Number(quotation.totalPrice),
      }));
    }),
}); 