/**
 * Helper function to get the correct video URL for playback
 * 
 * Returns the direct video URL without any proxy.
 * UploadThing videos work directly without CORS issues when accessed properly.
 * 
 * @param url - The original video URL from MongoDB
 * @returns The video URL (direct, no proxy)
 */
export function getProxiedVideoUrl(url: string | undefined): string | undefined {
  // Return URL directly - no proxy needed
  return url;
}
