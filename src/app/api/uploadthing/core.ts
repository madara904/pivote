import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { organization, organizationMember } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const f = createUploadthing();
const utapi = new UTApi();

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
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;