/**
 * Video Streaming Utilities
 * 
 * Helper functions for efficient video handling in Next.js
 */

/**
 * Check if a URL needs streaming proxy
 * External URLs benefit from our streaming API for range request support
 */
export function needsStreamingProxy(url: string): boolean {
  if (!url) return false;
  
  // External video hosts that benefit from streaming
  const externalHosts = [
    'utfs.io',           // UploadThing
    's3.amazonaws.com',  // AWS S3
    'storage.googleapis.com', // Google Cloud Storage
    'blob.core.windows.net',  // Azure Blob Storage
  ];
  
  return externalHosts.some(host => url.includes(host));
}

/**
 * Generate streaming URL for video playback
 * Routes external videos through streaming API for optimal performance
 */
export function getStreamingUrl(videoUrl: string | undefined): string | undefined {
  if (!videoUrl) return undefined;
  
  // If already using streaming API, return as-is
  if (videoUrl.includes('/api/video-stream')) {
    return videoUrl;
  }
  
  // If it's a relative URL or Mux URL, use directly
  if (videoUrl.startsWith('/') || videoUrl.includes('mux.com')) {
    return videoUrl;
  }
  
  // Route external videos through streaming API
  if (needsStreamingProxy(videoUrl)) {
    return `/api/video-stream?url=${encodeURIComponent(videoUrl)}`;
  }
  
  // Return as-is for other cases
  return videoUrl;
}

/**
 * Estimate video file size from duration and quality
 * Useful for showing loading progress estimates
 */
export function estimateVideoSize(durationSeconds: number, quality: 'low' | 'medium' | 'high' | 'hd'): number {
  // Bitrate estimates in Mbps
  const bitrates = {
    low: 0.5,
    medium: 1.5,
    high: 3,
    hd: 8,
  };
  
  const bitrate = bitrates[quality];
  return (durationSeconds * bitrate * 1024 * 1024) / 8; // Convert to bytes
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Validate video URL format
 */
export function isValidVideoUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    const parsedUrl = new URL(url);
    
    // Check for common video extensions
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
    const hasVideoExtension = videoExtensions.some(ext => 
      parsedUrl.pathname.toLowerCase().endsWith(ext)
    );
    
    // Check for video hosting services
    const videoHosts = ['mux.com', 'utfs.io', 'youtube.com', 'vimeo.com'];
    const isVideoHost = videoHosts.some(host => parsedUrl.hostname.includes(host));
    
    return hasVideoExtension || isVideoHost;
  } catch {
    return false;
  }
}

/**
 * Parse range header to get byte range
 */
export function parseRangeHeader(rangeHeader: string, fileSize: number): { start: number; end: number } | null {
  if (!rangeHeader || !rangeHeader.startsWith('bytes=')) {
    return null;
  }

  const parts = rangeHeader.replace('bytes=', '').split('-');
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

  if (isNaN(start) || isNaN(end) || start > end || start < 0) {
    return null;
  }

  return { start, end };
}

/**
 * Generate Content-Range header value
 */
export function generateContentRangeHeader(start: number, end: number, totalSize: number): string {
  return `bytes ${start}-${end}/${totalSize}`;
}
