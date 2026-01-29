/**
 * Helper function to get the correct video URL for playback
 * 
 * UploadThing videos (utfs.io) don't support CORS for direct video playback,
 * so we proxy them through our API route that adds proper CORS headers.
 * 
 * Mux videos and other video services work directly.
 * 
 * @param url - The original video URL
 * @returns The proxied URL for UploadThing videos, or the original URL for others
 */
export function getProxiedVideoUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  
  // If it's an UploadThing URL, use the proxy
  if (url.startsWith('https://utfs.io/')) {
    return `/api/video-proxy?url=${encodeURIComponent(url)}`;
  }
  
  // Otherwise, return the original URL (e.g., Mux URLs, direct video files, etc.)
  return url;
}
