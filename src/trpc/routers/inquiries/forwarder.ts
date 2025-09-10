import { createTRPCRouter, protectedProcedure, TRPCContext } from "@/trpc/init";
import { eq, and, desc, sql } from "drizzle-orm";
import { inquiryForwarder, organizationMember } from "@/db/schema";
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


  getMyInquiriesPaginated: protectedProcedure
    .input(z.object({ 
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20)
    }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const { page, limit } = input;
      const offset = (page - 1) * limit;
      
      try {
        const membership = await db.query.organizationMember.findFirst({
          where: eq(organizationMember.userId, session.user.id),
          with: { organization: true }
        });
        
        if (!membership?.organization || membership.organization.type !== 'forwarder') {
          return {
            data: [],
            pagination: {
              page,
              limit,
              total: 0,
              totalPages: 0
            }
          };
        }
        
        // Parallel queries for better performance
        const [totalCountResult, inquiriesForForwarder] = await Promise.all([
          // Get total count for pagination
          db
            .select({ count: sql<number>`count(*)` })
            .from(inquiryForwarder)
            .where(eq(inquiryForwarder.forwarderOrganizationId, membership.organization.id)),
          
          // Get paginated data
          db.query.inquiryForwarder.findMany({
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
          orderBy: [desc(inquiryForwarder.createdAt)],
          limit,
          offset
        })
        ]);
        
        const total = totalCountResult[0]?.count || 0;

        // Process data server-side (same logic as getMyInquiries)
        const processedData = inquiriesForForwarder
          .filter(record => record.inquiry !== null)
          .map(record => {
            const inquiry = record.inquiry!;
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

        return {
          data: processedData,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        };
      } catch (error) {
        console.error('Error fetching paginated forwarder inquiries:', error);
        throw new Error('Failed to fetch inquiries');
      }
    }),

  // Ultra-fast version using raw SQL for maximum performance
  getMyInquiriesFast: protectedProcedure.query(async ({ ctx }: { ctx: TRPCContext }) => {
    const { db, session } = ctx;
    const startTime = Date.now();
    
    try {
      console.log('🚀 Starting getMyInquiriesFast query...');

      // Get membership first
      const membership = await db.query.organizationMember.findFirst({
        where: eq(organizationMember.userId, session.user.id),
        with: { organization: true }
      });
      
      if (!membership?.organization || membership.organization.type !== 'forwarder') {
        return [];
      }

      // Use raw SQL for maximum performance
      const sqlStart = Date.now();
      const result = await db.execute(sql`
        SELECT 
          if.id,
          if.inquiry_id,
          if.forwarder_organization_id,
          if.sent_at,
          if.viewed_at,
          if.created_at,
          i.reference_number,
          i.title,
          i.service_type,
          i.origin_city,
          i.origin_country,
          i.destination_city,
          i.destination_country,
          i.cargo_type,
          i.cargo_description,
          i.status,
          i.validity_date,
          o.name as shipper_name,
          o.email as shipper_email,
          u.name as created_by_name,
          COALESCE(SUM(ip.pieces), 0) as total_pieces,
          COALESCE(SUM(ip.gross_weight), 0) as total_gross_weight,
          COALESCE(SUM(ip.chargeable_weight), 0) as total_chargeable_weight,
          COALESCE(SUM(ip.volume), 0) as total_volume,
          COUNT(ip.id) as package_count,
          BOOL_OR(ip.is_dangerous) as has_dangerous_goods,
          BOOL_OR(ip.temperature IS NOT NULL) as temperature_controlled,
          BOOL_OR(ip.special_handling IS NOT NULL) as special_handling
        FROM inquiry_forwarder if
        JOIN inquiry i ON if.inquiry_id = i.id
        JOIN organization o ON i.shipper_organization_id = o.id
        JOIN "user" u ON i.created_by_id = u.id
        LEFT JOIN inquiry_package ip ON i.id = ip.inquiry_id
        WHERE if.forwarder_organization_id = ${membership.organization.id}
        GROUP BY 
          if.id, if.inquiry_id, if.forwarder_organization_id, if.sent_at, if.viewed_at, if.created_at,
          i.reference_number, i.title, i.service_type, i.origin_city, i.origin_country,
          i.destination_city, i.destination_country, i.cargo_type, i.cargo_description,
          i.status, i.validity_date, o.name, o.email, u.name
        ORDER BY if.created_at DESC
        LIMIT 50
      `);
      
      console.log(`⏱️ Raw SQL query: ${Date.now() - sqlStart}ms`);
      console.log(`📊 Found ${result.length} inquiries`);
      console.log(`✅ Total getMyInquiriesFast time: ${Date.now() - startTime}ms`);

      // Transform the result to match expected format
      return result.map((row: Record<string, unknown>) => ({
        id: row.id,
        inquiryId: row.inquiry_id,
        forwarderOrganizationId: row.forwarder_organization_id,
        sentAt: row.sent_at,
        viewedAt: row.viewed_at,
        createdAt: row.created_at,
        inquiry: {
          id: row.inquiry_id as string,
          referenceNumber: row.reference_number as string,
          title: row.title as string,
          serviceType: row.service_type as string,
          originCity: row.origin_city as string,
          originCountry: row.origin_country as string,
          destinationCity: row.destination_city as string,
          destinationCountry: row.destination_country as string,
          cargoType: row.cargo_type as string,
          cargoDescription: row.cargo_description as string,
          status: row.status as string,
          validityDate: row.validity_date as string,
          totalPieces: parseInt(row.total_pieces as string),
          totalGrossWeight: parseFloat(row.total_gross_weight as string).toFixed(2),
          totalChargeableWeight: parseFloat(row.total_chargeable_weight as string).toFixed(2),
          totalVolume: parseFloat(row.total_volume as string).toFixed(3),
          shipperOrganization: {
            name: row.shipper_name as string,
            email: row.shipper_email as string
          },
          createdBy: {
            name: row.created_by_name as string
          }
        },
        packageSummary: {
          count: parseInt(row.package_count as string),
          hasDangerousGoods: row.has_dangerous_goods as boolean,
          temperatureControlled: row.temperature_controlled as boolean,
          specialHandling: row.special_handling as boolean
        },
        statusDateInfo: {
          formattedSentDate: row.sent_at ? new Date(row.sent_at as string).toLocaleDateString('de-DE') : '',
          formattedViewedDate: row.viewed_at ? new Date(row.viewed_at as string).toLocaleDateString('de-DE') : null,
          statusDetail: row.status === "sent" && row.viewed_at 
            ? `Viewed ${new Date(row.viewed_at as string).toLocaleDateString('de-DE')}`
            : row.status === "sent" 
            ? `Sent ${new Date(row.sent_at as string).toLocaleDateString('de-DE')}`
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