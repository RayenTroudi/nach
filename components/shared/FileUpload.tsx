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
      onUploadError={(error) => toast.error(error.message)}
    />
  );
}

export default FileUpload;
