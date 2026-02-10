"use client";

/**
 * MuxVideoPlayer - Best Practice Mux Streaming Component
 * 
 * Features:
 * - Adaptive Bitrate (ABR) streaming via HLS
 * - Automatic thumbnail generation from Mux
 * - Loading and error states
 * - Accessibility (ARIA labels, keyboard controls)
 * - Mobile-optimized (playsInline)
 * - Next.js SSR-safe (client-only rendering)
 * - Responsive sizing
 * - Fast startup with metadata preloading
 * 
 * Usage:
 * <MuxVideoPlayer 
 *   playbackId="abc123xyz" 
 *   title="My Video"
 *   poster="https://image.mux.com/abc123xyz/thumbnail.jpg"
 * />
 */

import { useState, useEffect, useRef } from "react";
import MuxPlayer from "@mux/mux-player-react";
import "@mux/mux-player/themes/minimal";
import Spinner from "./Spinner";
import type MuxPlayerElement from "@mux/mux-player";

interface MuxVideoPlayerProps {
  playbackId: string;
  title?: string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  className?: string;
  aspectRatio?: "16:9" | "9:16" | "4:3" | "1:1";
  metadata?: {
    video_id?: string;
    video_title?: string;
    [key: string]: any;
  };
  onError?: (error: any) => void;
  onLoadedData?: () => void;
  showControls?: boolean;
  minimalHover?: boolean;  // If true, only shows pause icon on hover
}

/**
 * Generate Mux thumbnail URL from playback ID
 * Mux automatically generates thumbnails for all videos
 * @see https://docs.mux.com/guides/get-images-from-a-video
 */
export function getMuxThumbnail(playbackId: string, options?: {
  time?: number; // timestamp in seconds
  width?: number;
  height?: number;
  fitMode?: "preserve" | "stretch" | "crop" | "smartcrop";
}): string {
  const params = new URLSearchParams();
  
  if (options?.time !== undefined) params.append("time", options.time.toString());
  if (options?.width) params.append("width", options.width.toString());
  if (options?.height) params.append("height", options.height.toString());
  if (options?.fitMode) params.append("fit_mode", options.fitMode);
  
  const queryString = params.toString();
  return `https://image.mux.com/${playbackId}/thumbnail.jpg${queryString ? `?${queryString}` : ""}`;
}

const MuxVideoPlayer = ({
  playbackId,
  title,
  poster,
  autoPlay = false,
  muted = false,
  className = "",
  aspectRatio = "16:9",
  metadata,
  onError,
  onLoadedData,
  showControls = true,
  minimalHover = false,
}: MuxVideoPlayerProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videoError, setVideoError] = useState<string>("");
  const playerRef = useRef<MuxPlayerElement>(null);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [availableQualities, setAvailableQualities] = useState<string[]>([]);
  const [currentQuality, setCurrentQuality] = useState<string>("auto");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Next.js SSR safety: Only render player on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get available qualities when player loads
  useEffect(() => {
    if (playerRef.current && isMounted) {
      const player = playerRef.current;
      
      const updateQualities = () => {
        // Mux HLS provides automatic quality levels
        // Common renditions: 1080, 720, 540, 360
        const qualities = ['1080', '720', '540', '360'];
        setAvailableQualities(['auto', ...qualities]);
      };

      player.addEventListener('loadedmetadata', updateQualities);
      updateQualities(); // Try to get qualities immediately
      
      return () => player.removeEventListener('loadedmetadata', updateQualities);
    }
  }, [isMounted]);

  // Close quality menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showQualityMenu && !(e.target as HTMLElement).closest('.quality-selector')) {
        setShowQualityMenu(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showQualityMenu]);

  // Track fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Generate thumbnail from Mux if not provided
  const thumbnailUrl = poster || getMuxThumbnail(playbackId, { width: 1280 });

  // Calculate padding for aspect ratio
  const aspectRatioPadding = {
    "16:9": "56.25%",
    "9:16": "177.78%",
    "4:3": "75%",
    "1:1": "100%",
  }[aspectRatio];

  const handleError = (error: any) => {
    console.error("[MuxVideoPlayer] Error:", error);
    setVideoError("Failed to load video. Please try again later.");
    setIsLoading(false);
    onError?.(error);
  };

  const handleLoadedData = () => {
    setIsLoading(false);
    onLoadedData?.();
  };

  // Handle click to play/pause in minimal hover mode
  const handleVideoClick = (e: React.MouseEvent) => {
    // Don't toggle if clicking on control buttons or in fullscreen
    if ((e.target as HTMLElement).closest('.video-controls') || isFullscreen) {
      return;
    }
    
    if (minimalHover && playerRef.current) {
      if (playerRef.current.paused) {
        playerRef.current.play();
      } else {
        playerRef.current.pause();
      }
    }
  };

  // Handle fullscreen toggle
  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        playerRef.current.requestFullscreen?.();
      }
    }
  };

  // Handle quality change
  const handleQualityChange = (quality: string) => {
    if (playerRef.current) {
      if (quality === 'auto') {
        playerRef.current.removeAttribute('max-resolution');
      } else {
        // Set max resolution (e.g., "1080p", "720p")
        playerRef.current.setAttribute('max-resolution', `${quality}p`);
      }
      setCurrentQuality(quality);
      setShowQualityMenu(false);
    }
  };

  // Loading state before client-side mount
  if (!isMounted) {
    return (
      <div 
        className={`relative w-full bg-slate-100 dark:bg-slate-900 ${className}`}
        style={{ paddingBottom: aspectRatioPadding }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner size={48} />
        </div>
      </div>
    );
  }

  // Error state
  if (videoError) {
    return (
      <div 
        className={`relative w-full bg-slate-100 dark:bg-slate-900 ${className}`}
        style={{ paddingBottom: aspectRatioPadding }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-6 max-w-md">
            <div className="text-6xl mb-4" role="img" aria-label="Error">⚠️</div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Video Load Error
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {videoError}
            </p>
            <button
              onClick={() => {
                setVideoError("");
                setIsLoading(true);
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label="Retry loading video"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No playback ID provided
  if (!playbackId || playbackId.trim() === "") {
    return (
      <div 
        className={`relative w-full bg-slate-100 dark:bg-slate-900 ${className}`}
        style={{ paddingBottom: aspectRatioPadding }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-6">
            <div className="text-6xl mb-4" role="img" aria-label="Processing">🎬</div>
            <p className="text-slate-600 dark:text-slate-400">
              Video not available or still processing
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative w-full ${className} ${minimalHover ? 'group' : ''}`}
      style={{ paddingBottom: aspectRatioPadding }}
    >
      <div 
        className="absolute inset-0"
        onClick={handleVideoClick}
        style={{ cursor: minimalHover && !isFullscreen ? 'pointer' : 'default' }}
      >
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
            <Spinner size={48} />
          </div>
        )}

        {/* Minimal hover overlay - only pause icon (hidden in fullscreen) */}
        {minimalHover && !isLoading && !isFullscreen && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
              </svg>
            </div>
          </div>
        )}

        {/* Video Controls - Fullscreen & Quality (hidden in fullscreen) - Positioned Left for Vertical Layout */}
        {!isLoading && !isFullscreen && (
          <div className={`video-controls absolute top-3 left-3 flex flex-col gap-2 transition-opacity duration-200 z-30 pointer-events-auto ${
            minimalHover ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
          }`}>
            {/* Quality Selector */}
            <div className="relative quality-selector">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQualityMenu(!showQualityMenu);
                }}
                className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors relative"
                title={`Quality: ${currentQuality === 'auto' ? 'Auto' : currentQuality + 'p'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6"/>
                  <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24"/>
                  <path d="M1 12h6m6 0h6"/>
                  <path d="m4.93 19.07 4.24-4.24m5.66-5.66 4.24-4.24"/>
                </svg>
                {currentQuality !== 'auto' && (
                  <span className="absolute -bottom-1 -right-1 text-[10px] font-bold bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center">
                    {currentQuality.slice(0, 1)}
                  </span>
                )}
              </button>
              
              {/* Quality Menu */}
              {showQualityMenu && (
                <div className="absolute top-12 left-0 bg-black/90 backdrop-blur-md rounded-lg overflow-hidden min-w-[140px] border border-white/10 shadow-xl">
                  {availableQualities.length > 0 ? (
                    availableQualities.map((quality) => (
                      <button
                        key={quality}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQualityChange(quality);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors flex items-center justify-between ${
                          currentQuality === quality ? 'bg-red-600 text-white' : 'text-white/90'
                        }`}
                      >
                        <span>{quality === 'auto' ? 'Auto (Best)' : `${quality}p`}</span>
                        {currentQuality === quality && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-white/60">Loading...</div>
                  )}
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={handleFullscreen}
              className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
              title="Fullscreen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
              </svg>
            </button>
          </div>
        )}

        {/* Mux Player with best practices */}
        <MuxPlayer
          ref={playerRef}
          playbackId={playbackId}
          poster={thumbnailUrl}
          streamType="on-demand"
          autoPlay={autoPlay ? "muted" : false}
          muted={muted}
          preload="metadata"
          playsInline
          defaultHiddenCaptions={true}
          nohotkeys={minimalHover && !isFullscreen}
          accentColor="#DD0000"
          primaryColor="#FFFFFF"
          secondaryColor="#000000"
          title={title || "Video"}
          metadata={{
            video_title: title || "Video",
            ...metadata,
          }}
          // Accessibility
          aria-label={title ? `Video player: ${title}` : "Video player"}
          // Event handlers
          onLoadedData={handleLoadedData}
          onError={handleError}
          onLoadStart={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
          // Styling
          style={{
            width: "100%",
            height: "100%",
            "--controls": (showControls && !minimalHover) || isFullscreen ? "block" : "none",
            "--media-object-fit": "contain",
            "--media-object-position": "center",
            pointerEvents: minimalHover && !isFullscreen ? "none" : "auto",
          } as React.CSSProperties}
          className={`${minimalHover && !isFullscreen ? "minimal-hover-player" : ""} ${isFullscreen ? "fullscreen-player" : ""}`}
        />
      </div>
    </div>
  );
};

export default MuxVideoPlayer;
