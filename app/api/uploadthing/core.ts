import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

const handleAuth = async () => {
  const { userId } = auth();
  
  console.log("[UploadThing Auth]", {
    userId: userId || 'null',
    timestamp: new Date().toISOString()
  });
  
  if (!userId) {
    console.error("[UploadThing Auth] No userId found - user not authenticated");
    throw new Error("Unauthorized - Please sign in to upload files");
  }
  
  return { userId };
};

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  courseThumbnail: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => await handleAuth())
    .onUploadComplete(() => {}),

  courseAttachments: f({ pdf: { maxFileSize: "512GB", maxFileCount: 1 } })
    .middleware(async () => await handleAuth())
    .onUploadComplete(() => {}),

  sectionVideo: f({ video: { maxFileSize: "512GB", maxFileCount: 1 } })
    .middleware(async () => await handleAuth())
    .onUploadComplete(() => {}),

  paymentProof: f({ 
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    pdf: { maxFileSize: "4MB", maxFileCount: 1 }
  })
    .middleware(async () => await handleAuth())
    .onUploadComplete(() => {}),

  documentUpload: f({ 
    pdf: { maxFileSize: "256MB", maxFileCount: 1 }
  })
    .middleware(async () => await handleAuth())
    .onUploadComplete(() => {}),

  bundleDocuments: f({ 
    pdf: { maxFileSize: "256MB", maxFileCount: 50 },
    image: { maxFileSize: "16MB", maxFileCount: 50 },
    video: { maxFileSize: "512MB", maxFileCount: 50 },
    audio: { maxFileSize: "64MB", maxFileCount: 50 },
    text: { maxFileSize: "16MB", maxFileCount: 50 },
  })
    .middleware(async () => await handleAuth())
    .onUploadComplete(() => {}),

  resumeDocument: f({ 
    pdf: { maxFileSize: "16MB", maxFileCount: 1 }
  })
    .middleware(async () => await handleAuth())
    .onUploadComplete(() => {}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
