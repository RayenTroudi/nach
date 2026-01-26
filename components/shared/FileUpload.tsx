"use client";

import { ourFileRouter } from "@/app/api/uploadthing/core";
import { UploadButton, UploadDropzone } from "@/lib/upload-thing";
import toast from "react-hot-toast";

interface Props {
  onChange: (url?: string) => void;
  endpoint: keyof typeof ourFileRouter;
  className?: string;
}

function FileUpload({ endpoint, onChange, className }: Props) {
  return (
    <UploadDropzone<keyof typeof ourFileRouter>
      className={`${className}`}
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        onChange(res?.[0].url);
      }}
      onUploadError={(error) => {
        const errorMessage = error.message;
        
        // Check if it's a file size error
        if (errorMessage.includes("bigger than allowed") || errorMessage.includes("File size")) {
          toast.error("File is too large! Maximum file size is 8MB. Please compress or use a smaller file.");
        } else {
          toast.error(errorMessage || "Upload failed. Please try again.");
        }
      }}
    />
  );
}

export default FileUpload;
