import { createTRPCRouter, protectedProcedure, TRPCContext } from "@/trpc/init";
import { eq, and, sql, desc, count } from "drizzle-orm";
import { inquiryForwarder, organizationMember, inquiry, organization, user, inquiryPackage } from "@/db/schema";
import { z } from "zod";

export const forwarderRouter = createTRPCRouter({
  getMyInquiries: protectedProcedure.query(async ({ ctx }: { ctx: TRPCContext }) => {
    const { db, session } = ctx;
    const startTime = Date.now();
    
    try {
      console.log('🚀 Starting getMyInquiries query...');

      // Get membership first (needed for validation)
      const membershipStart = Date.now();
      const membership = await db.query.organizationMember.findFirst({
        where: eq(organizationMember.userId, session.user.id),
        with: { organization: true }
      });
      console.log(`⏱️ Membership query: ${Date.now() - membershipStart}ms`);
      
      if (!membership?.organization) {
        console.log('No organization found for user:', session.user.id);
        return [];
      }

      if (membership.organization.type !== 'forwarder') {
        console.log('User organization is not a forwarder:', membership.organization.type);
        throw new Error("Organisation ist kein Spediteur");
      }
      
      // Single optimized query with all relations
      const inquiryStart = Date.now();
      const inquiriesForForwarder = await db.query.inquiryForwarder.findMany({
        where: eq(inquiryForwarder.forwarderOrganizationId, membership.organization.id),
        with: {
          inquiry: {
            with: {
              packages: true,
              shipperOrganization: {
                columns: {
                  id: true,
                  name: true,
                  email: true
                }
              },
              createdBy: {
                columns: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: (inquiryForwarder, { desc }) => [desc(inquiryForwarder.createdAt)],
        limit: 50
      });
      console.log(`⏱️ Main inquiry query: ${Date.now() - inquiryStart}ms`);
      console.log(`📊 Found ${inquiriesForForwarder.length} inquiries`);

      // Process data server-side to reduce client-side computation
      const processStart = Date.now();
      const result = inquiriesForForwarder
        .filter(record => record.inquiry !== null)
        .map(record => {
          const inquiry = record.inquiry!;
          const packages = inquiry.packages || [];
          
          // Calculate totals server-side
          const totalPieces = packages.reduce((sum, pkg) => sum + pkg.pieces, 0);
          const totalGrossWeight = packages.reduce((sum, pkg) => sum + parseFloat(pkg.grossWeight), 0);
          const totalChargeableWeight = packages.reduce((sum, pkg) => sum + parseFloat(pkg.chargeableWeight || '0'), 0);
          const totalVolume = packages.reduce((sum, pkg) => sum + parseFloat(pkg.volume || '0'), 0);
          
          const packageSummary = packages.length > 0 ? {
            count: packages.length,
            hasDangerousGoods: packages.some(pkg => !!pkg.isDangerous),
            temperatureControlled: packages.some(pkg => !!pkg.temperature),
            specialHandling: packages.some(pkg => !!pkg.specialHandling)
          } : null;
          
          const statusDateInfo = {
            formattedSentDate: record.sentAt ? record.sentAt.toLocaleDateString('de-DE') : '',
            formattedViewedDate: record.viewedAt ? record.viewedAt.toLocaleDateString('de-DE') : null,
            statusDetail: inquiry.status === "sent" && record.viewedAt 
              ? `Viewed ${record.viewedAt.toLocaleDateString('de-DE')}`
              : inquiry.status === "sent" 
              ? `Sent ${record.sentAt.toLocaleDateString('de-DE')}`
              : inquiry.status === "draft"
              ? "Not sent yet"
              : ""
          };

          return {
            id: record.id,
            inquiryId: record.inquiryId,
            forwarderOrganizationId: record.forwarderOrganizationId,
            sentAt: record.sentAt,
            viewedAt: record.viewedAt,
            createdAt: record.createdAt,
            inquiry: {
              ...inquiry,
              packages,
              totalPieces,
              totalGrossWeight: totalGrossWeight.toFixed(2),
              totalChargeableWeight: totalChargeableWeight > 0 ? totalChargeableWeight.toFixed(2) : null,
              totalVolume: totalVolume.toFixed(3),
              dimensionsSummary: packages.length > 0 
                ? packages.map(pkg => 
                    `${pkg.length || 0}×${pkg.width || 0}×${pkg.height || 0}cm`
                  ).join(", ")
                : "Keine Abmessungen"
            },
            packageSummary,
            statusDateInfo
          };
        });
      
      console.log(`⏱️ Data processing: ${Date.now() - processStart}ms`);
      console.log(`✅ Total getMyInquiries time: ${Date.now() - startTime}ms`);
      
      return result;
    } catch (error) {
      console.error('Error fetching forwarder inquiries:', error);
      console.log(`❌ Failed after: ${Date.now() - startTime}ms`);
      throw new Error('Failed to fetch inquiries');
    }
  }),

  getInquiryById: protectedProcedure
    .input(z.object({ inquiryId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      
      // Get membership with organization
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
      
      // Optimized query with specific columns
      const inquiryForwarderRecord = await db.query.inquiryForwarder.findFirst({
        where: and(
          eq(inquiryForwarder.inquiryId, input.inquiryId),
          eq(inquiryForwarder.forwarderOrganizationId, membership.organization.id)
        ),
        with: {
          inquiry: {
            with: {
              packages: true,
              shipperOrganization: {
                columns: {
                  id: true,
                  name: true,
                  email: true
                }
              },
              createdBy: {
                columns: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });
      
      if (!inquiryForwarderRecord || !inquiryForwarderRecord.inquiry) {
        throw new Error("Frachtanfrage nicht gefunden oder nicht zugänglich");
      }
      
      // Process data server-side
      const inquiry = inquiryForwarderRecord.inquiry;
      const packages = inquiry.packages || [];
      
      const totalPieces = packages.reduce((sum, pkg) => sum + pkg.pieces, 0);
      const totalGrossWeight = packages.reduce((sum, pkg) => sum + parseFloat(pkg.grossWeight), 0);
      const totalChargeableWeight = packages.reduce((sum, pkg) => sum + parseFloat(pkg.chargeableWeight || '0'), 0);
      const totalVolume = packages.reduce((sum, pkg) => sum + parseFloat(pkg.volume || '0'), 0);
      
      const packageSummary = packages.length > 0 ? {
        count: packages.length,
        hasDangerousGoods: packages.some(pkg => !!pkg.isDangerous),
        temperatureControlled: packages.some(pkg => !!pkg.temperature),
        specialHandling: packages.some(pkg => !!pkg.specialHandling)
      } : null;
      
      const statusDateInfo = {
        formattedSentDate: inquiryForwarderRecord.sentAt ? inquiryForwarderRecord.sentAt.toLocaleDateString('de-DE') : '',
        formattedViewedDate: inquiryForwarderRecord.viewedAt ? inquiryForwarderRecord.viewedAt.toLocaleDateString('de-DE') : null,
        statusDetail: inquiry.status === "sent" && inquiryForwarderRecord.viewedAt 
          ? `Viewed ${inquiryForwarderRecord.viewedAt.toLocaleDateString('de-DE')}`
          : inquiry.status === "sent" 
          ? `Sent ${inquiryForwarderRecord.sentAt.toLocaleDateString('de-DE')}`
          : inquiry.status === "draft"
          ? "Not sent yet"
          : ""
      };
      
      return {
        ...inquiryForwarderRecord,
        inquiry: {
          ...inquiry,
          packages,
          totalPieces,
          totalGrossWeight: totalGrossWeight.toFixed(2),
          totalChargeableWeight: totalChargeableWeight > 0 ? totalChargeableWeight.toFixed(2) : null,
          totalVolume: totalVolume.toFixed(3),
          dimensionsSummary: packages.length > 0 
            ? packages.map(pkg => 
                `${pkg.length || 0}×${pkg.width || 0}×${pkg.height || 0}cm`
              ).join(", ")
            : "Keine Abmessungen"
        },
        packageSummary,
        statusDateInfo
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
      

      const inquiryForwarderRecord = await db.query.inquiryForwarder.findFirst({
        where: and(
          eq(inquiryForwarder.inquiryId, input.inquiryId),
          eq(inquiryForwarder.forwarderOrganizationId, membership.organization.id)
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

  // Optimized version using Drizzle ORM with proper joins
  getMyInquiriesFast: protectedProcedure.query(async ({ ctx }: { ctx: TRPCContext }) => {
    const { db, session } = ctx;
    const startTime = Date.now();
    
    try {
      console.log('🚀 Starting getMyInquiriesFast query...');
      console.log('🔐 Session user ID:', session?.user?.id);

      // Validate session first
      if (!session?.user?.id) {
        console.log('❌ No session or user ID found');
        throw new Error('Not authenticated');
      }

      // Get membership first
      const membership = await db.query.organizationMember.findFirst({
        where: eq(organizationMember.userId, session.user.id),
        with: { organization: true }
      });
      
      if (!membership?.organization) {
        console.log('❌ No organization found for user:', session.user.id);
        return [];
      }

      if (membership.organization.type !== 'forwarder') {
        console.log('❌ User organization is not a forwarder:', membership.organization.type);
        throw new Error("Organisation ist kein Spediteur");
      }

      const drizzleStart = Date.now();
      
      // Use Drizzle ORM with proper joins and aggregations
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
          
          // organization fields (shipper)
          shipperName: organization.name,
          shipperEmail: organization.email,
          
          // user fields (created by)
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
        .from(inquiryForwarder)
        .innerJoin(inquiry, eq(inquiryForwarder.inquiryId, inquiry.id))
        .innerJoin(organization, eq(inquiry.shipperOrganizationId, organization.id))
        .innerJoin(user, eq(inquiry.createdById, user.id))
        .leftJoin(inquiryPackage, eq(inquiry.id, inquiryPackage.inquiryId))
        .where(eq(inquiryForwarder.forwarderOrganizationId, membership.organization.id))
        .groupBy(
          inquiryForwarder.id,
          inquiryForwarder.inquiryId,
          inquiryForwarder.forwarderOrganizationId,
          inquiryForwarder.sentAt,
          inquiryForwarder.viewedAt,
          inquiryForwarder.createdAt,
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
          organization.name,
          organization.email,
          user.name
        )
        .orderBy(desc(inquiryForwarder.createdAt))
        .limit(50);
      
      console.log(`⏱️ Drizzle ORM query: ${Date.now() - drizzleStart}ms`);
      console.log(`📊 Found ${result.length} inquiries`);
      console.log(`✅ Total getMyInquiriesFast time: ${Date.now() - startTime}ms`);

      // Transform the result to match expected format
      return result.map((row) => ({
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
          totalGrossWeight: row.totalGrossWeight.toFixed(2),
          totalChargeableWeight: row.totalChargeableWeight.toFixed(2),
          totalVolume: row.totalVolume.toFixed(3),
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
          hasDangerousGoods: row.hasDangerousGoods,
          temperatureControlled: row.temperatureControlled,
          specialHandling: row.specialHandling
        },
        statusDateInfo: {
          formattedSentDate: row.sentAt ? row.sentAt.toLocaleDateString('de-DE') : '',
          formattedViewedDate: row.viewedAt ? row.viewedAt.toLocaleDateString('de-DE') : null,
          statusDetail: row.status === "sent" && row.viewedAt 
            ? `Viewed ${row.viewedAt.toLocaleDateString('de-DE')}`
            : row.status === "sent" 
            ? `Sent ${row.sentAt.toLocaleDateString('de-DE')}`
            : row.status === "draft"
            ? "Not sent yet"
            : ""
        }
      }));
    } catch (error) {
      console.error('Error fetching forwarder inquiries (fast):', error);
      console.log(`❌ Failed after: ${Date.now() - startTime}ms`);
      throw new Error('Failed to fetch inquiries');
    }
  }),

  // - listReceivedInquiries
  // - refuseInquiry
});