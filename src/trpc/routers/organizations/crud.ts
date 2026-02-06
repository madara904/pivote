/* eslint-disable @typescript-eslint/no-unused-vars */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, eq, or, ne } from "drizzle-orm";
import { organization, organizationMember, user } from "@/db/schema";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { utapi } from "@/app/api/uploadthing/core";


const createOrgSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  type: z.enum(["shipper", "forwarder"]).optional().default("shipper"),
  description: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  vatNumber: z
    .string()
    .regex(/^DE[0-9]{9}$/, "Die UST-ID muss mit 'DE' beginnen und 9 Ziffern enthalten"),
  registrationNumber: z.string().optional(),
  logo: z.string().optional(),
  settings: z.string().optional(),
  isActive: z.boolean().optional(),
});
type CreateOrgInput = z.infer<typeof createOrgSchema>;

const editOrgSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  type: z.enum(["shipper", "forwarder"]).optional(),
  description: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  vatNumber: z
    .string()
    .regex(/^DE[0-9]{9}$/, "Die UST-ID muss mit 'DE' beginnen und 9 Ziffern enthalten")
    .optional(),
  registrationNumber: z.string().optional(),
  logo: z.string().url().optional(),
});
type EditOrgInput = z.infer<typeof editOrgSchema>;

type DeleteOrgInput = { organizationId: string };

export const crudRouter = createTRPCRouter({
  createOrganization: protectedProcedure
    .input(createOrgSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      // Prevent user from owning more than one organization
      const existingOwner = await db.query.organizationMember.findFirst({
        where: and(
          eq(organizationMember.userId, session.user.id),
          eq(organizationMember.role, "owner"),
          eq(organizationMember.isActive, true)
        ),
      });
      if (existingOwner) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Du kannst nur eine Organisation besitzen.",
        });
      }
      const existingOrg = await db.query.organization.findFirst({
        where: or(
          eq(organization.name, input.name),
          eq(organization.vatNumber, input.vatNumber)
        ),
      });
      
      if (existingOrg) {
        if (existingOrg.name === input.name) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Diese Organisation '${input.name}' existiert bereits! Bitte wähle einen anderen Namen.`,
          });
        }
        if (existingOrg.vatNumber === input.vatNumber) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Die UST-ID '${input.vatNumber}' ist bereits vergeben. Bitte prüfe deine Eingabe.`,
          });
        }
      }
      try {
        // 1. Create the organization
        const [org] = await db
          .insert(organization)
          .values({
            name: input.name,
            email: input.email,
            type: input.type,
            description: input.description,
            phone: input.phone,
            website: input.website,
            address: input.address,
            city: input.city,
            postalCode: input.postalCode,
            country: input.country,
            vatNumber: input.vatNumber,
            registrationNumber: input.registrationNumber || null,
            logo: input.logo,
            settings: input.settings,
            isActive: input.isActive,
          })
          .returning();
        // 2. Check if the user exists
        const dbUser = await db.query.user.findFirst({
          where: eq(user.id, session.user.id),
        });
        if (!dbUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Der User ${session.user.id} existiert nicht! Bitte erneut einloggen oder Support kontaktieren.`,
          });
        }
        // 3. Attach the current user as owner
        const [membership] = await db
          .insert(organizationMember)
          .values({
            organizationId: org.id,
            userId: session.user.id,
            role: "owner",
            isActive: true,
          })
          .returning();

        // 4. Update user's org_type to match the organization type
        const updateResult = await db
          .update(user)
          .set({
            orgType: input.type,
          })
          .where(eq(user.id, session.user.id))
          .returning();
        
        return {
          organization: org,
          membership,
        };
      } catch (err: unknown) {
        if (typeof err === "object" && err !== null && "code" in err) {
          const code = (err as { code?: string }).code;
          if (code === "23505") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Diese Organisation oder Mitglied existiert bereits.",
            });
          }
          if (code === "23503") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Benutzer oder Organisation nicht gefunden.",
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Ein unerwarteter Fehler ist aufgetreten.",
        });
      }
    }),

  editOrganization: protectedProcedure
    .input(editOrgSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      try {
        // Check if user is owner of the organization
        const membership = await db.query.organizationMember.findFirst({
          where: and(
            eq(organizationMember.userId, session.user.id),
            eq(organizationMember.organizationId, input.organizationId),
            eq(organizationMember.role, "owner"),
            eq(organizationMember.isActive, true)
          ),
        });
        if (!membership) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Nur der Besitzer kann die Organisation bearbeiten.",
          });
        }
        // Check for name or vatNumber conflicts if being changed
        if (input.name || input.vatNumber) {
          const conflictOrg = await db.query.organization.findFirst({
            where: and(
              or(
                input.name ? eq(organization.name, input.name) : undefined,
                input.vatNumber ? eq(organization.vatNumber, input.vatNumber) : undefined
              ),
              // Exclude the current organization
              ne(organization.id, input.organizationId)
            ),
          });
          if (conflictOrg) {
            if (input.name && conflictOrg.name === input.name) {
              throw new TRPCError({
                code: "CONFLICT",
                message: `Diese Organisation '${input.name}' existiert bereits! Bitte wähle einen anderen Namen.`,
              });
            }
            if (input.vatNumber && conflictOrg.vatNumber === input.vatNumber) {
              throw new TRPCError({
                code: "CONFLICT",
                message: `Die UST-ID '${input.vatNumber}' ist bereits vergeben. Bitte prüfe deine Eingabe.`,
              });
            }
          }
        }
        // Update organization
        const [updated] = await db
          .update(organization)
          .set({
            ...(input.name && { name: input.name }),
            ...(input.email && { email: input.email }),
            ...(input.type && { type: input.type }),
            ...(input.description !== undefined && { description: input.description || null }),
            ...(input.phone !== undefined && { phone: input.phone || null }),
            ...(input.website !== undefined && { website: input.website || null }),
            ...(input.address !== undefined && { address: input.address || null }),
            ...(input.city !== undefined && { city: input.city || null }),
            ...(input.postalCode !== undefined && { postalCode: input.postalCode || null }),
            ...(input.country !== undefined && { country: input.country || null }),
            ...(input.vatNumber && { vatNumber: input.vatNumber }),
            ...(input.registrationNumber !== undefined && { registrationNumber: input.registrationNumber || null }),
            ...(input.logo !== undefined && { logo: input.logo || null }),
            updatedAt: new Date(),
          })
          .where(eq(organization.id, input.organizationId))
          .returning();
        if (!updated) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Organisation nicht gefunden.",
          });
        }
        
        return updated;
      } catch (err: unknown) {
        if (typeof err === "object" && err !== null && "code" in err) {
          const code = (err as { code?: string }).code;
          if (code === "23505") {
            // This is a unique constraint violation, but we should have caught it above
            // If we reach here, it might be an email conflict or other unique constraint
            throw new TRPCError({
              code: "CONFLICT",
              message: "Ein Konflikt mit einem bereits existierenden Wert ist aufgetreten.",
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Ein unerwarteter Fehler ist aufgetreten.",
        });
      }
    }),

  deleteOrganization: protectedProcedure
    .input(z.object({ organizationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const { organizationId } = input;
      try {
        // Check if user is owner of the organization
        const membership = await db.query.organizationMember.findFirst({
          where: and(
            eq(organizationMember.userId, session.user.id),
            eq(organizationMember.organizationId, organizationId),
            eq(organizationMember.role, "owner"),
            eq(organizationMember.isActive, true)
          ),
        });
        if (!membership) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Nur der Besitzer kann die Organisation löschen.",
          });
        }
        // Delete organization (cascades to members)
        const [deleted] = await db
          .delete(organization)
          .where(eq(organization.id, organizationId))
          .returning();
        if (!deleted) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Organisation nicht gefunden.",
          });
        }
        
        return { success: true };
      } catch (err: unknown) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Ein unerwarteter Fehler ist aufgetreten.",
        });
      }
    }),
    deleteOrganizationLogo: protectedProcedure
    .input(z.object({ organizationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const { organizationId } = input;
      try {
        // Check if user is owner of the organization
        const membership = await db.query.organizationMember.findFirst({
          where: and(
            eq(organizationMember.userId, session.user.id),
            eq(organizationMember.organizationId, organizationId),
            eq(organizationMember.role, "owner"),
            eq(organizationMember.isActive, true)
          ),
        });
        if (!membership) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Nur der Besitzer kann das Logo löschen.",
          });
        }
        // Get the current organization to get the logo URL before deleting
        const currentOrg = await db.query.organization.findFirst({
          where: eq(organization.id, organizationId),
        });

        if (!currentOrg) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Organisation nicht gefunden.",
          });
        }

        // Extract file key from URL before deleting
        // UploadThing URLs can be in various formats:
        // - https://utfs.io/f/<fileKey>
        // - https://uploadthing.com/f/<fileKey>
        // - https://sea1.ingest.uploadthing.com/<fileKey>?...
        let fileKey: string | null = null;
        
        if (currentOrg.logo) {
          try {
            const url = new URL(currentOrg.logo);
            // Try to extract from pathname (for utfs.io format)
            const pathSegments = url.pathname.split('/').filter(Boolean);
            const lastSegment = pathSegments[pathSegments.length - 1];
            
            // If pathname has segments and last one isn't 'f', use it
            if (lastSegment && lastSegment !== 'f' && lastSegment.length > 10) {
              fileKey = lastSegment;
            } else {
              // For ingest URLs, the key might be in the hostname path or first segment
              // Try the first non-empty segment after domain
              const firstSegment = pathSegments[0];
              if (firstSegment && firstSegment.length > 10) {
                fileKey = firstSegment;
              }
            }
          } catch {
            // If URL parsing fails, try to extract key from the string directly
            // Look for a pattern that looks like a file key (long alphanumeric string)
            const keyMatch = currentOrg.logo.match(/([a-zA-Z0-9]{20,})/);
            if (keyMatch) {
              fileKey = keyMatch[1];
            }
          }
        }

        // Delete organization logo from database
        const [deleted] = await db
          .update(organization)
          .set({ logo: null })
          .where(eq(organization.id, organizationId))
          .returning();

        // Delete file from UploadThing if we have a fileKey
        if (fileKey) {
          try {
            await utapi.deleteFiles(fileKey);
          } catch (uploadThingError) {
            // Wir loggen den Fehler, werfen aber keinen TRPC-Error, 
            // da die DB bereits erfolgreich aktualisiert wurde.
            console.error("UploadThing Delete failed:", uploadThingError);
          }
        } else if (currentOrg.logo) {
          console.warn("Could not extract file key from logo URL:", currentOrg.logo);
        }

        return { success: true };
      } catch (err: unknown) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Ein unerwarteter Fehler ist aufgetreten.",
        });
      }
    }),

}); 