import { createTRPCRouter, protectedProcedure, TRPCContext } from "@/trpc/init";
import { eq, and } from "drizzle-orm";
import { inquiryForwarder, organizationMember } from "@/db/schema";
import { z } from "zod";

export const forwarderRouter = createTRPCRouter({
  getMyInquiries: protectedProcedure.query(async ({ ctx }: { ctx: TRPCContext }) => {
    const { db, session } = ctx;
    
    try {
      const membership = await db.query.organizationMember.findFirst({
        where: eq(organizationMember.userId, session.user.id),
        with: { organization: true }
      });
      
      if (!membership?.organization) {
        console.log('No organization found for user:', session.user.id);
        return [];
      }

      if (membership.organization.type !== 'forwarder') {
        console.log('User organization is not a forwarder:', membership.organization.type);
        throw new Error("Organisation ist kein Spediteur");
      }
      
      // Add ordering and limit for better performance
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
        },
        orderBy: (inquiryForwarder, { desc }) => [desc(inquiryForwarder.createdAt)],
        limit: 50
      });
    

      // Return raw data - let the client handle formatting
      return inquiriesForForwarder
        .filter(record => record.inquiry !== null)
        .map(record => ({
          id: record.id,
          inquiryId: record.inquiryId,
          forwarderOrganizationId: record.forwarderOrganizationId,
          sentAt: record.sentAt,
          viewedAt: record.viewedAt,
          createdAt: record.createdAt,
          inquiry: record.inquiry!
        }));
    } catch (error) {
      console.error('Error fetching forwarder inquiries:', error);
      throw new Error('Failed to fetch inquiries');
    }
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
      
      // Return raw data - let the client handle formatting
      return {
        ...inquiryForwarderRecord,
        inquiry: inquiryForwarderRecord.inquiry
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