"use client";

import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";
import { detectOptimalQuality, QualityLevel, VideoQuality } from "@/lib/utils/video-quality";
import "@/styles/adaptive-video-player.css";
import Spinner from "./Spinner";

// Register the quality selector plugin
import "@/lib/utils/videojs-quality-selector";

export interface VideoSource {
  quality: QualityLevel;
  url: string;
  label: string;
  width: number;
  height: number;
  bitrate?: number; // Optional: bits per second
}

interface AdaptiveVideoPlayerProps {
  sources: VideoSource[];
  poster?: string;
  autoplay?: boolean;
  className?: string;
  onQualityChange?: (quality: QualityLevel) => void;
  onError?: (error: Error) => void;
  defaultQuality?: QualityLevel | "auto";
  enableAutoQuality?: boolean;
}

/**
 * Adaptive Video Player Component
 * 
 * Features:
 * - Multiple quality levels (4K, 1440p, 1080p, 720p, 480p, 360p)
 * - Quality selector UI for manual switching
 * - Automatic quality selection based on bandwidth and device
 * - Smooth quality transitions without interruption
 * - Quality locking when manually selected
 * - Responsive and optimized for performance
 * 
 * Usage:
 * ```tsx
 * <AdaptiveVideoPlayer 
 *   sources={[
 *     { quality: '4K', url: 'https://utfs.io/f/video-4k.mp4', label: '4K (2160p)', width: 3840, height: 2160 },
 *     { quality: '1440p', url: 'https://utfs.io/f/video-1440p.mp4', label: '1440p', width: 2560, height: 1440 },
 *     { quality: '1080p', url: 'https://utfs.io/f/video-1080p.mp4', label: '1080p', width: 1920, height: 1080 },
 *     { quality: '720p', url: 'https://utfs.io/f/video-720p.mp4', label: '720p', width: 1280, height: 720 },
 *   ]}
 *   poster="/thumbnail.jpg"
 *   defaultQuality="auto"
 *   enableAutoQuality={true}
 * />
 * ```
 */
export default function AdaptiveVideoPlayer({
  sources,
  poster,
  autoplay = false,
  className = "",
  onQualityChange,
  onError,
  defaultQuality = "auto",
  enableAutoQuality = true,
}: AdaptiveVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Player | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentQuality, setCurrentQuality] = useState<QualityLevel | "auto">(defaultQuality);
  const [isAutoQuality, setIsAutoQuality] = useState(defaultQuality === "auto");
  const currentTimeRef = useRef(0);
  const wasPlayingRef = useRef(false);

  // Mount check
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!isMounted || !videoRef.current) return;

    // Check if element is in DOM
    if (!document.body.contains(videoRef.current)) {
      return;
    }

    // Sort sources by quality (highest to lowest)
    const sortedSources = [...sources].sort((a, b) => b.height - a.height);

    // Determine initial quality
    let initialQuality: QualityLevel;
    if (defaultQuality === "auto" && enableAutoQuality) {
      initialQuality = detectOptimalQuality(sortedSources);
    } else if (defaultQuality !== "auto") {
      initialQuality = defaultQuality;
    } else {
      initialQuality = sortedSources[0].quality;
    }

    const initialSource = sortedSources.find(s => s.quality === initialQuality) || sortedSources[0];

    // Initialize Video.js player
    const player = videojs(videoRef.current, {
      controls: true,
      autoplay: autoplay,
      preload: "metadata",
      fluid: true,
      responsive: true,
      aspectRatio: "16:9",
      poster: poster,
      controlBar: {
        volumePanel: { inline: false },
        pictureInPictureToggle: true,
        fullscreenToggle: true,
        qualitySelector: true, // Enable our custom quality selector
      },
      playbackRates: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
      html5: {
        vhs: {
          enableLowInitialPlaylist: false,
          smoothQualityChange: true,
          overrideNative: true,
        },
        nativeVideoTracks: false,
        nativeAudioTracks: false,
        nativeTextTracks: false,
      },
    });

    playerRef.current = player;

    // Set initial source
    player.src({
      type: "video/mp4",
      src: getProxiedUrl(initialSource.url),
    });

    // Add quality sources to player for the quality selector plugin
    (player as any).qualitySources = sortedSources.map(source => ({
      quality: source.quality,
      label: source.label,
      url: getProxiedUrl(source.url),
      selected: source.quality === initialQuality,
    }));

    // Add auto quality option
    (player as any).enableAutoQuality = enableAutoQuality;
    (player as any).isAutoQuality = isAutoQuality;

    // Initialize quality selector plugin
    if (typeof (player as any).qualitySelector === 'function') {
      (player as any).qualitySelector();
    }

    // Handle quality change from plugin
    player.on("qualityChange", (event: any, data: { quality: QualityLevel | "auto" }) => {
      handleQualityChange(data.quality);
    });

    // Track playback state
    player.on("play", () => {
      wasPlayingRef.current = true;
    });

    player.on("pause", () => {
      wasPlayingRef.current = false;
    });

    player.on("timeupdate", () => {
      currentTimeRef.current = player.currentTime() || 0;
    });

    // Error handling
    player.on("error", () => {
      const error = player.error();
      if (error) {
        onError?.(new Error(`Video Error: ${error.message}`));
      }
    });

    // Player ready
    player.ready(() => {
      setIsInitializing(false);
      setCurrentQuality(initialQuality);
      onQualityChange?.(initialQuality);
    });

    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [sources, poster, autoplay, enableAutoQuality, defaultQuality, isMounted]);

  /**
   * Handle quality change (manual or auto)
   */
  const handleQualityChange = (newQuality: QualityLevel | "auto") => {
    const player = playerRef.current;
    if (!player) return;

    // Handle auto quality
    if (newQuality === "auto") {
      setIsAutoQuality(true);
      setCurrentQuality("auto");
      
      // Detect optimal quality
      const optimalQuality = detectOptimalQuality(sources);
      switchQuality(optimalQuality);
      return;
    }

    // Manual quality selection
    setIsAutoQuality(false);
    switchQuality(newQuality);
  };

  /**
   * Switch to a specific quality level
   */
  const switchQuality = (quality: QualityLevel) => {
    const player = playerRef.current;
    if (!player) return;

    const targetSource = sources.find(s => s.quality === quality);
    if (!targetSource) return;

    // Store current state
    const currentTime = player.currentTime() || 0;
    const wasPlaying = !player.paused();

    // Update state
    setCurrentQuality(quality);
    onQualityChange?.(quality);

    // Switch source
    player.src({
      type: "video/mp4",
      src: getProxiedUrl(targetSource.url),
    });

    // Restore playback state
    player.one("loadedmetadata", () => {
      player.currentTime(currentTime);
      if (wasPlaying) {
        const playPromise = player.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {});
        }
      }
    });
  };

  if (!sources || sources.length === 0) {
    return (
      <div className={`relative bg-slate-900 flex items-center justify-center aspect-video ${className}`}>
        <div className="text-center p-8">
          <p className="text-white">No video sources available</p>
        </div>
      </div>
    );
  }

  if (!isMounted) {
    return (
      <div className={`relative bg-slate-900 flex items-center justify-center aspect-video ${className}`}>
        <Spinner size={50} />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {isInitializing && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 rounded-lg">
          <Spinner size={50} />
        </div>
      )}
      
      <div data-vjs-player className="w-full h-full">
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered vjs-theme-forest adaptive-video-player w-full h-full"
        >
          <p className="vjs-no-js">
            To view this video please enable JavaScript, and consider upgrading to a
            web browser that supports HTML5 video
          </p>
        </video>
      </div>

      {/* Quality indicator */}
      {!isInitializing && (
        <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium pointer-events-none z-10">
          {isAutoQuality ? `Auto (${currentQuality})` : currentQuality}
        </div>
      )}
    </div>
  );
}

/**
 * Generate proxied URL for video streaming with range request support
 */
function getProxiedUrl(videoUrl: string): string {
  if (!videoUrl) return "";
  
  // If already proxied, return as-is
  if (videoUrl.includes("/api/video-stream")) {
    return videoUrl;
  }
  
  // Route through streaming API
  return `/api/video-stream?url=${encodeURIComponent(videoUrl)}`;
}
