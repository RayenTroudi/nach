"use client";

import { useRef } from "react";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { UploadDropzone, useUploadThing } from "@/lib/upload-thing";
import toast from "react-hot-toast";

interface Props {
  onChange: (url?: string) => void;
  endpoint: keyof typeof ourFileRouter;
  className?: string;
  autoUpload?: boolean; // New prop to enable auto-upload on file selection
}

function FileUpload({ endpoint, onChange, className, autoUpload = false }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { startUpload, isUploading } = useUploadThing(endpoint, {
    onClientUploadComplete: (res) => {
      onChange(res?.[0]?.url);
      toast.success("File uploaded successfully!");
    },
    onUploadError: (error) => {
      const errorMessage = error.message;
      
      // Check if it's a file size error
      if (errorMessage.includes("bigger than allowed") || errorMessage.includes("File size")) {
        toast.error("File is too large! Maximum file size is 8MB. Please compress or use a smaller file.");
      } else {
        toast.error(errorMessage || "Upload failed. Please try again.");
      }
    },
  });

  // Handler for auto-upload mode
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    await startUpload(fileArray);
  };

  // If auto-upload is enabled, use a custom input
  if (autoUpload) {
    return (
      <div className={className}>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
          id={`file-upload-${endpoint}`}
        />
        <label
          htmlFor={`file-upload-${endpoint}`}
          className={`
            flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer
            ${isUploading 
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600'
            }
          `}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isUploading ? (
              <>
                <svg className="w-8 h-8 mb-2 text-gray-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mb-2 text-sm text-gray-500">Uploading...</p>
              </>
            ) : (
              <>
                <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span></p>
                <p className="text-xs text-gray-500">File will upload automatically after selection</p>
              </>
            )}
          </div>
        </label>
      </div>
    );
  }

  // Default mode with UploadDropzone (requires clicking "Upload" button)
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
