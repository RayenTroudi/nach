/**
 * UploadThing File Management Utility
 * Handles file deletion and management operations
 */

import { UTApi } from "uploadthing/server";

// Initialize UTApi - it reads UPLOADTHING_SECRET from environment automatically
// Make sure UPLOADTHING_SECRET is set in your .env.local file
const utapi = new UTApi();

/**
 * Delete a file from UploadThing by its URL
 * @param fileUrl - The full URL of the file (e.g., https://utfs.io/f/abc123.mp4)
 * @returns Promise<boolean> - True if deletion successful
 */
export async function deleteFileFromUploadThing(fileUrl: string): Promise<boolean> {
  try {
    if (!fileUrl || !fileUrl.startsWith('https://utfs.io/')) {
      console.warn('[UploadThing] Invalid URL:', fileUrl);
      return false;
    }

    // Extract file key from URL
    // URL format: https://utfs.io/f/{fileKey}
    const fileKey = extractFileKeyFromUrl(fileUrl);
    
    if (!fileKey) {
      console.error('[UploadThing] Could not extract file key from URL:', fileUrl);
      return false;
    }

    console.log('[UploadThing] Deleting file:', fileKey);
    
    // Delete file using UTApi
    await utapi.deleteFiles(fileKey);
    
    console.log('[UploadThing] File deleted successfully:', fileKey);
    return true;
  } catch (error: any) {
    console.error('[UploadThing] Error deleting file:', error.message);
    // Don't throw error - allow deletion to continue even if UploadThing fails
    return false;
  }
}

/**
 * Delete multiple files from UploadThing
 * @param fileUrls - Array of file URLs to delete
 * @returns Promise<number> - Number of successfully deleted files
 */
export async function deleteFilesFromUploadThing(fileUrls: string[]): Promise<number> {
  try {
    if (!fileUrls || fileUrls.length === 0) return 0;

    const fileKeys = fileUrls
      .filter(url => url && url.startsWith('https://utfs.io/'))
      .map(url => extractFileKeyFromUrl(url))
      .filter(key => key !== null) as string[];

    if (fileKeys.length === 0) return 0;

    console.log('[UploadThing] Deleting multiple files:', fileKeys.length);
    
    await utapi.deleteFiles(fileKeys);
    
    console.log('[UploadThing] Files deleted successfully');
    return fileKeys.length;
  } catch (error: any) {
    console.error('[UploadThing] Error deleting files:', error.message);
    return 0;
  }
}

/**
 * Extract file key from UploadThing URL
 * @param url - Full UploadThing URL
 * @returns File key or null if invalid
 */
function extractFileKeyFromUrl(url: string): string | null {
  try {
    // URL format: https://utfs.io/f/{fileKey}
    // or: https://uploadthing-prod.s3.us-west-2.amazonaws.com/{fileKey}
    
    if (url.includes('utfs.io/f/')) {
      const parts = url.split('/f/');
      return parts[1]?.split('?')[0] || null;
    }
    
    if (url.includes('uploadthing')) {
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1];
      return lastPart?.split('?')[0] || null;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Get storage usage information
 * Note: This requires UploadThing Pro plan
 */
export async function getStorageInfo() {
  try {
    // Note: listFiles is a Pro feature
    // const files = await utapi.listFiles();
    // return files;
    console.log('[UploadThing] Storage info requires Pro plan');
    return null;
  } catch (error: any) {
    console.error('[UploadThing] Error getting storage info:', error.message);
    return null;
  }
}
