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
  onUploadStart?: () => void; // Callback when upload starts
  onUploadError?: () => void; // Callback when upload fails
}

function FileUpload({ endpoint, onChange, className, autoUpload = false, onUploadStart, onUploadError: onUploadErrorCallback }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { startUpload, isUploading } = useUploadThing(endpoint, {
    onClientUploadComplete: (res) => {
      // Validate that we have a valid URL before calling onChange
      const uploadedUrl = res?.[0]?.url;
      if (uploadedUrl && typeof uploadedUrl === 'string' && uploadedUrl.trim() !== '') {
        onChange(uploadedUrl);
        toast.success("File uploaded successfully!");
      } else {
        console.error("[FileUpload] Invalid URL received:", res);
        toast.error("Upload failed - invalid URL received. Please try again.");
        onChange(undefined); // Clear any previous URL
        if (onUploadErrorCallback) {
          onUploadErrorCallback();
        }
      }
    },
    onUploadError: (error) => {
      const errorMessage = error.message;
      
      console.error("[FileUpload Error]", { endpoint, error: errorMessage });
      
      // Notify parent component of error
      onChange(undefined); // Clear any previous URL
      if (onUploadErrorCallback) {
        onUploadErrorCallback();
      }
      
      // Check for authentication error
      if (errorMessage.includes("Unauthorized") || errorMessage.includes("401")) {
        toast.error("Please sign in to upload files. Your form data has been saved.");
        return;
      }
      
      // Check if it's a file size error
      if (errorMessage.includes("bigger than allowed") || errorMessage.includes("File size")) {
        toast.error("File is too large! Maximum file size is 8MB. Please compress or use a smaller file.");
      } else {
        toast.error(errorMessage || "Upload failed. Please try again.");
      }
    },
    onUploadBegin: () => {
      if (onUploadStart) {
        onUploadStart();
      }
    },
  });

  // Handler for auto-upload mode
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    try {
      if (onUploadStart) {
        onUploadStart();
      }
      const result = await startUpload(fileArray);
      
      // Additional validation after upload completes
      if (!result || result.length === 0 || !result[0]?.url) {
        console.error("[FileUpload] No valid result from upload:", result);
        toast.error("Upload failed - no file URL received. Please try again.");
        onChange(undefined);
        if (onUploadErrorCallback) {
          onUploadErrorCallback();
        }
      }
    } catch (error) {
      console.error("[FileUpload] Upload failed:", error);
      onChange(undefined);
      if (onUploadErrorCallback) {
        onUploadErrorCallback();
      }
    }
    
    // Reset the file input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
