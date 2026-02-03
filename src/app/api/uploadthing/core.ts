import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { inquiry, inquiryDocument, organization, organizationMember, quotation } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const f = createUploadthing();
export const utapi = new UTApi();

export const ourFileRouter = {
  organizationLogo: f({ 
    image: { 
      maxFileSize: "2MB",
      maxFileCount: 1,
    } 
  })
    .middleware(async ({ req }) => {
      const session = await auth.api.getSession({ headers: req.headers });
      
      if (!session?.user) {
        throw new UploadThingError("Nicht autorisiert");
      }

      const organizationId = req.headers.get("x-organization-id");
      
      if (!organizationId) {
        throw new UploadThingError("Organisation ID erforderlich");
      }

      // Verify user is admin or owner
      const membership = await db.query.organizationMember.findFirst({
        where: and(
          eq(organizationMember.userId, session.user.id),
          eq(organizationMember.organizationId, organizationId)
        ),
      });

      if (!membership || !["admin", "owner"].includes(membership.role)) {
        throw new UploadThingError("Keine Berechtigungen um das Logo zu ändern");
      }

      return { 
        userId: session.user.id, 
        organizationId 
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Get the current organization to check for existing logo
      const currentOrg = await db.query.organization.findFirst({
        where: eq(organization.id, metadata.organizationId),
      });

      // If there's an old logo, delete it from UploadThing
      if (currentOrg?.logo) {
        try {
          // Extract file key from URL
          // UploadThing URLs can be in various formats:
          // - https://utfs.io/f/<fileKey>
          // - https://uploadthing.com/f/<fileKey>
          // - https://sea1.ingest.uploadthing.com/<fileKey>?...
          let fileKey: string | null = null;
          
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
          
          if (fileKey) {
            await utapi.deleteFiles(fileKey);
          } else {
            console.warn("Could not extract file key from old logo URL:", currentOrg.logo);
          }
        } catch (error) {
          // Log error but don't fail the upload if deletion fails
          console.error("Failed to delete old logo:", error);
        }
      }

      // Return the new logo URL - we'll update via tRPC
      // Use ufsUrl instead of deprecated url property
      return { 
        organizationId: metadata.organizationId,
        logoUrl: file.ufsUrl
      };
    }),
  inquiryDocument: f({
    pdf: {
      maxFileSize: "8MB",
      maxFileCount: 5,
    },
    image: {
      maxFileSize: "8MB",
      maxFileCount: 5,
    },
  })
    .middleware(async ({ req }) => {
      const session = await auth.api.getSession({ headers: req.headers });

      if (!session?.user) {
        throw new UploadThingError("Nicht autorisiert");
      }

      const inquiryId = req.headers.get("x-inquiry-id");
      const documentType = req.headers.get("x-document-type") as 'packing_list' | 'commercial_invoice' | 'certificate_of_origin' | 'awb' | 'other' | null;

      if (!inquiryId) {
        throw new UploadThingError("Inquiry ID erforderlich");
      }

      if (!documentType) {
        throw new UploadThingError("Dokumenttyp erforderlich");
      }

      const allowedTypes = [
        "packing_list",
        "commercial_invoice",
        "certificate_of_origin",
        "awb",
        "other",
      ] as const;

      if (!(allowedTypes as readonly string[]).includes(documentType)) {
        throw new UploadThingError("Ungültiger Dokumenttyp");
      }

      const membership = await db
        .select({
          organizationId: organizationMember.organizationId,
          organizationType: organization.type,
        })
        .from(organizationMember)
        .innerJoin(organization, eq(organizationMember.organizationId, organization.id))
        .where(eq(organizationMember.userId, session.user.id))
        .limit(1);

      if (!membership.length || membership[0].organizationType !== "shipper") {
        throw new UploadThingError("Nur Versender können Dokumente hochladen");
      }

      const inquiryRecord = await db
        .select({
          id: inquiry.id,
          shipperOrganizationId: inquiry.shipperOrganizationId,
        })
        .from(inquiry)
        .where(eq(inquiry.id, inquiryId))
        .limit(1);

      if (!inquiryRecord.length) {
        throw new UploadThingError("Frachtanfrage nicht gefunden");
      }

      if (inquiryRecord[0].shipperOrganizationId !== membership[0].organizationId) {
        throw new UploadThingError("Keine Berechtigung für diese Anfrage");
      }

      const acceptedQuotation = await db
        .select({ id: quotation.id })
        .from(quotation)
        .where(
          and(
            eq(quotation.inquiryId, inquiryId),
            eq(quotation.status, "accepted")
          )
        )
        .limit(1);

      if (!acceptedQuotation.length) {
        throw new UploadThingError("Dokumente sind erst nach der Nominierung verfügbar");
      }

      return {
        userId: session.user.id,
        organizationId: membership[0].organizationId,
        inquiryId,
        documentType,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db.insert(inquiryDocument).values({
        inquiryId: metadata.inquiryId,
        uploadedByOrganizationId: metadata.organizationId,
        uploadedByUserId: metadata.userId,
        documentType: metadata.documentType,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileKey: file.key,
        fileUrl: file.ufsUrl,
      });

      return {
        inquiryId: metadata.inquiryId,
        documentType: metadata.documentType,
        fileUrl: file.ufsUrl,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;