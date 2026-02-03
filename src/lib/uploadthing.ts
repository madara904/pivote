import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define a file route
  inquiryDocument: f({
    pdf: { maxFileSize: "8MB" },
  })
    .middleware(async ({ req }) => {
      try {
        // Get the session using better-auth
        const session = await auth.api.getSession({
          headers: req.headers,
        });

        if (!session?.user?.id) {
          throw new Error("Unauthorized - Please log in to upload files");
        }

        return {
          userId: session.user.id,
          userEmail: session.user.email,
        };
      } catch (error) {
        console.error("Upload middleware error:", error);
        throw new Error("Authentication failed");
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Here you can handle the file after upload
      // For example, save the file info to your database
      console.log("Upload complete for user:", {
        userId: metadata.userId,
        fileUrl: file.url,
        fileName: file.name,
        fileType: file.type,
      });

      // Return any additional data you want to be available in the client
      return { success: true };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;