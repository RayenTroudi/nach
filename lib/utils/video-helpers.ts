/**
 * Video Helper Utilities
 * 
 * Helper functions for working with adaptive video sources
 * and integrating with existing video data structures
 */

import { QualityLevel, QUALITY_LEVELS } from "./video-quality";
import { VideoSource } from "@/components/shared/AdaptiveVideoPlayer";

/**
 * Convert video database object to VideoSource array
 */
export function convertToVideoSources(video: any): VideoSource[] {
  const sources: VideoSource[] = [];
  
  // Check if video has quality sources
  if (video.videoQualities && typeof video.videoQualities === "object") {
    Object.entries(video.videoQualities).forEach(([quality, url]) => {
      if (url && quality in QUALITY_LEVELS) {
        const qualityInfo = QUALITY_LEVELS[quality as QualityLevel];
        sources.push({
          quality: quality as QualityLevel,
          url: url as string,
          label: qualityInfo.label,
          width: qualityInfo.width,
          height: qualityInfo.height,
          bitrate: qualityInfo.bitrate,
        });
      }
    });
  }
  
  // Fallback to single video URL if no quality sources
  if (sources.length === 0 && video.videoUrl) {
    // Assume 1080p for existing videos
    sources.push({
      quality: "1080p",
      url: video.videoUrl,
      label: "1080p (Full HD)",
      width: 1920,
      height: 1080,
    });
  }
  
  // Sort by quality (highest first)
  return sources.sort((a, b) => b.height - a.height);
}

/**
 * Get quality label for display
 */
export function getQualityLabel(quality: QualityLevel | string): string {
  if (quality in QUALITY_LEVELS) {
    return QUALITY_LEVELS[quality as QualityLevel].label;
  }
  return quality;
}

/**
 * Get quality dimensions
 */
export function getQualityDimensions(quality: QualityLevel | string): { width: number; height: number } {
  if (quality in QUALITY_LEVELS) {
    const info = QUALITY_LEVELS[quality as QualityLevel];
    return { width: info.width, height: info.height };
  }
  return { width: 1920, height: 1080 }; // Default to 1080p
}

/**
 * Validate video source
 */
export function isValidVideoSource(source: Partial<VideoSource>): source is VideoSource {
  return !!(
    source.quality &&
    source.url &&
    source.label &&
    typeof source.width === "number" &&
    typeof source.height === "number"
  );
}

/**
 * Get proxied video URL for streaming
 */
export function getProxiedVideoUrl(url: string): string {
  if (!url) return "";
  
  // Already proxied
  if (url.includes("/api/video-stream")) {
    return url;
  }
  
  // Proxy through streaming API
  return `/api/video-stream?url=${encodeURIComponent(url)}`;
}

/**
 * Extract video ID from URL
 */
export function extractVideoId(url: string): string | null {
  try {
    // UploadThing URL format: https://utfs.io/f/{fileId}
    const match = url.match(/utfs\.io\/f\/([^/?#]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Generate thumbnail URL from video URL
 * Note: This is a placeholder - implement based on your thumbnail generation strategy
 */
export function generateThumbnailUrl(videoUrl: string, time: number = 0): string {
  const videoId = extractVideoId(videoUrl);
  if (!videoId) return "/placeholder-thumbnail.jpg";
  
  // If you have a thumbnail generation API
  return `/api/generate-thumbnail?videoId=${videoId}&time=${time}`;
}

/**
 * Estimate video file size based on quality and duration
 */
export function estimateVideoSize(quality: QualityLevel, durationSeconds: number): number {
  const qualityInfo = QUALITY_LEVELS[quality];
  if (!qualityInfo) return 0;
  
  // Size in bytes = (bitrate in bps * duration in seconds) / 8
  return (qualityInfo.bitrate * durationSeconds) / 8;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get available qualities from video sources
 */
export function getAvailableQualities(sources: VideoSource[]): QualityLevel[] {
  return sources.map(s => s.quality).sort((a, b) => {
    const aInfo = QUALITY_LEVELS[a];
    const bInfo = QUALITY_LEVELS[b];
    return bInfo.height - aInfo.height;
  });
}

/**
 * Find best quality below or equal to target
 */
export function findBestQuality(
  sources: VideoSource[],
  targetQuality: QualityLevel
): VideoSource | null {
  const targetHeight = QUALITY_LEVELS[targetQuality].height;
  
  // Sort by quality descending
  const sorted = [...sources].sort((a, b) => b.height - a.height);
  
  // Find highest quality <= target
  for (const source of sorted) {
    if (source.height <= targetHeight) {
      return source;
    }
  }
  
  // If no match, return lowest quality
  return sorted[sorted.length - 1] || null;
}

/**
 * Check if video has multiple quality levels
 */
export function hasMultipleQualities(video: any): boolean {
  if (!video.videoQualities) return false;
  
  const qualityCount = Object.keys(video.videoQualities).filter(
    key => video.videoQualities[key]
  ).length;
  
  return qualityCount > 1;
}

/**
 * Get default quality for video based on available sources and user preferences
 */
export function getDefaultQuality(sources: VideoSource[]): QualityLevel | "auto" {
  // Check saved preference
  if (typeof localStorage !== "undefined") {
    const saved = localStorage.getItem("preferred_video_quality");
    if (saved && (saved === "auto" || sources.some(s => s.quality === saved))) {
      return saved as QualityLevel | "auto";
    }
  }
  
  // Default to auto
  return "auto";
}

/**
 * Save quality preference
 */
export function saveQualityPreference(quality: QualityLevel | "auto"): void {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("preferred_video_quality", quality);
  }
}

/**
 * Create video source from URL and quality
 */
export function createVideoSource(
  url: string,
  quality: QualityLevel
): VideoSource {
  const qualityInfo = QUALITY_LEVELS[quality];
  
  return {
    quality,
    url,
    label: qualityInfo.label,
    width: qualityInfo.width,
    height: qualityInfo.height,
    bitrate: qualityInfo.bitrate,
  };
}

/**
 * Batch create video sources from quality map
 */
export function createVideoSources(
  qualityMap: Partial<Record<QualityLevel, string>>
): VideoSource[] {
  const sources: VideoSource[] = [];
  
  Object.entries(qualityMap).forEach(([quality, url]) => {
    if (url && quality in QUALITY_LEVELS) {
      sources.push(createVideoSource(url, quality as QualityLevel));
    }
  });
  
  return sources.sort((a, b) => b.height - a.height);
}

/**
 * Merge video sources with fallback to original URL
 */
export function mergeVideoSources(
  videoQualities: Partial<Record<QualityLevel, string>> | undefined,
  fallbackUrl: string
): VideoSource[] {
  if (videoQualities && Object.keys(videoQualities).length > 0) {
    return createVideoSources(videoQualities);
  }
  
  // Fallback to single source
  return [createVideoSource(fallbackUrl, "1080p")];
}

/**
 * Check if browser supports Video.js
 */
export function supportsVideoJS(): boolean {
  if (typeof window === "undefined") return false;
  
  const video = document.createElement("video");
  return !!(
    video.canPlayType &&
    video.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/no/, "")
  );
}

/**
 * Preload video metadata for faster playback
 */
export async function preloadVideoMetadata(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = url;
    
    video.onloadedmetadata = () => {
      resolve();
    };
    
    video.onerror = () => {
      reject(new Error("Failed to load video metadata"));
    };
    
    // Timeout after 10 seconds
    setTimeout(() => {
      reject(new Error("Video metadata loading timeout"));
    }, 10000);
  });
}
