import { auth } from "@clerk/nextjs";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

const handleAuth = () => {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");
  return { userId };
};

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  courseThumbnail: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {}),

  courseAttachments: f({ pdf: { maxFileSize: "512GB", maxFileCount: 1 } })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {}),

  sectionVideo: f({ video: { maxFileSize: "512GB", maxFileCount: 1 } })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {}),

  paymentProof: f({ 
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    pdf: { maxFileSize: "4MB", maxFileCount: 1 }
  })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {}),

  documentUpload: f({ 
    pdf: { maxFileSize: "256MB", maxFileCount: 1 }
  })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {}),

  bundleDocuments: f({ 
    pdf: { maxFileSize: "256MB", maxFileCount: 50 },
    image: { maxFileSize: "16MB", maxFileCount: 50 },
    video: { maxFileSize: "512MB", maxFileCount: 50 },
    audio: { maxFileSize: "64MB", maxFileCount: 50 },
    text: { maxFileSize: "16MB", maxFileCount: 50 },
  })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {}),

  resumeDocument: f({ 
    pdf: { maxFileSize: "16MB", maxFileCount: 1 }
  })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
