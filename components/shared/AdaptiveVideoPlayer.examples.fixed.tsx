/**
 * Example Usage: Adaptive Video Player
 * 
 * This file demonstrates how to integrate the AdaptiveVideoPlayer
 * into your existing application pages
 * 
 * Note: TVideo type doesn't have a thumbnailUrl property.
 * Pass the poster prop separately (e.g., from course.thumbnail or section.thumbnail)
 */

"use client";

import { useEffect, useState } from "react";
import AdaptiveVideoPlayer, { VideoSource } from "@/components/shared/AdaptiveVideoPlayer";
import { convertToVideoSources, hasMultipleQualities } from "@/lib/utils/video-helpers";
import { estimateBandwidth, formatBandwidth } from "@/lib/utils/video-quality";
import { TVideo } from "@/types/models.types";

/**
 * Example 1: Basic Usage
 * Replace your existing video player with this
 */
export function BasicVideoPlayer({ video, poster }: { video: TVideo; poster?: string }) {
  const sources = convertToVideoSources(video);

  return (
    <div className="w-full">
      <AdaptiveVideoPlayer
        sources={sources}
        poster={poster}
        defaultQuality="auto"
      />
    </div>
  );
}

/**
 * Example 2: With All Features
 * Shows bandwidth info and quality controls
 */
export function AdvancedVideoPlayer({ video, poster }: { video: TVideo; poster?: string }) {
  const [bandwidth, setBandwidth] = useState<number | null>(null);
  const [currentQuality, setCurrentQuality] = useState<string>("auto");

  useEffect(() => {
    const bw = estimateBandwidth();
    setBandwidth(bw);
  }, []);

  const sources = convertToVideoSources(video);
  const hasMultiQuality = hasMultipleQualities(video);

  return (
    <div className="space-y-2">
      {/* Bandwidth indicator */}
      {bandwidth && (
        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 px-2">
          <span>Network: {formatBandwidth(bandwidth)}</span>
          {hasMultiQuality && (
            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
              Adaptive Quality Available
            </span>
          )}
        </div>
      )}

      {/* Video Player */}
      <AdaptiveVideoPlayer
        sources={sources}
        poster={poster}
        defaultQuality="auto"
        enableAutoQuality={true}
        onQualityChange={(quality) => {
          setCurrentQuality(quality);
          console.log("Quality changed to:", quality);
        }}
        onError={(error) => {
          console.error("Video error:", error);
          // Handle error (e.g., show toast notification)
        }}
      />

      {/* Current quality indicator */}
      <div className="text-xs text-center text-slate-500">
        Playing at: {currentQuality === "auto" ? "Auto" : currentQuality}
      </div>
    </div>
  );
}

/**
 * Example 3: Course Video Player
 * For use in course learning pages
 */
export function CourseVideoPlayer({
  video,
  poster,
  onProgress,
  onComplete,
}: {
  video: TVideo;
  poster?: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}) {
  const sources = convertToVideoSources(video);

  useEffect(() => {
    // Track video progress
    const interval = setInterval(() => {
      const videoElement = document.querySelector("video");
      if (videoElement && !videoElement.paused) {
        const progress = (videoElement.currentTime / videoElement.duration) * 100;
        onProgress?.(progress);

        // Check if completed (>95%)
        if (progress > 95) {
          onComplete?.();
        }
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [onProgress, onComplete]);

  return (
    <div className="relative">
      <AdaptiveVideoPlayer
        sources={sources}
        poster={poster}
        defaultQuality="auto"
        enableAutoQuality={true}
        className="rounded-lg overflow-hidden"
      />
    </div>
  );
}

/**
 * Example 4: Mobile-Optimized Player
 * Adjusts defaults for mobile devices
 */
export function MobileOptimizedPlayer({ video, poster }: { video: TVideo; poster?: string }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent));
    };
    checkMobile();
  }, []);

  const sources = convertToVideoSources(video);

  // Filter sources for mobile (max 1080p)
  const mobileSources = isMobile
    ? sources.filter((s) => s.height <= 1080)
    : sources;

  return (
    <AdaptiveVideoPlayer
      sources={mobileSources}
      poster={poster}
      defaultQuality={isMobile ? "720p" : "auto"}
      enableAutoQuality={true}
      className="w-full"
    />
  );
}

/**
 * Example 5: With Preloading
 * Preloads next video in playlist
 */
export function PlaylistVideoPlayer({
  currentVideo,
  currentPoster,
  nextVideo,
}: {
  currentVideo: TVideo;
  currentPoster?: string;
  nextVideo?: TVideo;
}) {
  const sources = convertToVideoSources(currentVideo);

  useEffect(() => {
    // Preload next video metadata
    if (nextVideo && nextVideo.videoUrl) {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = nextVideo.videoUrl;
      document.head.appendChild(link);

      return () => {
        document.head.removeChild(link);
      };
    }
  }, [nextVideo]);

  return (
    <div>
      <AdaptiveVideoPlayer
        sources={sources}
        poster={currentPoster}
        defaultQuality="auto"
      />

      {nextVideo && (
        <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Next: {nextVideo.title}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Example 6: With Custom Controls
 * Add custom buttons alongside quality selector
 */
export function CustomControlsPlayer({ video, poster }: { video: TVideo; poster?: string }) {
  const sources = convertToVideoSources(video);
  const [showTranscript, setShowTranscript] = useState(false);

  return (
    <div className="space-y-4">
      <AdaptiveVideoPlayer
        sources={sources}
        poster={poster}
        defaultQuality="auto"
      />

      {/* Custom controls */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-md text-sm"
        >
          {showTranscript ? "Hide" : "Show"} Transcript
        </button>
        <button className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-md text-sm">
          Take Notes
        </button>
        <button className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-md text-sm">
          Download
        </button>
      </div>

      {showTranscript && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <p className="text-sm">Video transcript would appear here...</p>
        </div>
      )}
    </div>
  );
}

/**
 * Example 7: Drop-in Replacement for Existing Player
 * Minimal changes to existing code
 */
export function LegacyPlayerReplacement({ video, poster }: { video: any; poster?: string }) {
  // Check if video has multiple qualities
  const hasAdaptiveQuality = video.videoQualities && Object.keys(video.videoQualities).length > 1;

  if (hasAdaptiveQuality) {
    // Use new adaptive player
    const sources = convertToVideoSources(video);
    return (
      <AdaptiveVideoPlayer
        sources={sources}
        poster={poster}
        defaultQuality="auto"
        enableAutoQuality={true}
      />
    );
  }

  // Fallback to existing single-quality player
  return (
    <AdaptiveVideoPlayer
      sources={[
        {
          quality: "1080p",
          url: video.videoUrl,
          label: "1080p",
          width: 1920,
          height: 1080,
        },
      ]}
      poster={poster}
    />
  );
}
