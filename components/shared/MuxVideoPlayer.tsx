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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false);
  const [timelineHover, setTimelineHover] = useState<{ show: boolean; time: number; x: number }>({ show: false, time: 0, x: 0 });
  const timelineRef = useRef<HTMLDivElement>(null);

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

  // Track video time and playback state
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const handleTimeUpdate = () => {
      setCurrentTime(player.currentTime || 0);
      setDuration(player.duration || 0);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    player.addEventListener('timeupdate', handleTimeUpdate);
    player.addEventListener('loadedmetadata', handleTimeUpdate);
    player.addEventListener('play', handlePlay);
    player.addEventListener('pause', handlePause);

    return () => {
      player.removeEventListener('timeupdate', handleTimeUpdate);
      player.removeEventListener('loadedmetadata', handleTimeUpdate);
      player.removeEventListener('play', handlePlay);
      player.removeEventListener('pause', handlePause);
    };
  }, [isMounted]);

  // Keyboard controls for seeking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!playerRef.current || !duration) return;
      
      // Skip if user is typing in an input field
      if ((e.target as HTMLElement).tagName === 'INPUT' || 
          (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          skipBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipForward();
          break;
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [duration, isMounted]);

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
    
    if (playerRef.current) {
      if (playerRef.current.paused) {
        playerRef.current.play();
      } else {
        playerRef.current.pause();
      }
    }
  };

  // Format time for display (MM:SS or HH:MM:SS)
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds === 0) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle timeline hover preview
  const handleTimelineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !duration) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const time = percentage * duration;
    setTimelineHover({ show: true, time, x: e.clientX - rect.left });
  };

  const handleTimelineMouseLeave = () => {
    setTimelineHover({ show: false, time: 0, x: 0 });
  };

  // Handle timeline seeking (click or drag)
  const handleTimelineSeek = (e: React.MouseEvent<HTMLDivElement> | MouseEvent, element?: HTMLDivElement) => {
    if (!playerRef.current || !duration) return;
    const targetElement = element || (e.currentTarget as HTMLDivElement);
    const rect = targetElement.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * duration;
    playerRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle timeline drag start
  const handleTimelineMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDraggingTimeline(true);
    handleTimelineSeek(e);
  };

  // Handle timeline drag
  useEffect(() => {
    if (!isDraggingTimeline) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (timelineRef.current) {
        handleTimelineSeek(e, timelineRef.current);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingTimeline(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingTimeline, duration]);

  // Handle play/pause toggle
  const togglePlayPause = () => {
    if (playerRef.current) {
      if (playerRef.current.paused) {
        playerRef.current.play();
      } else {
        playerRef.current.pause();
      }
    }
  };

  // Skip forward/backward
  const skipBackward = () => {
    if (playerRef.current) {
      playerRef.current.currentTime = Math.max(0, playerRef.current.currentTime - 10);
    }
  };

  const skipForward = () => {
    if (playerRef.current && duration) {
      playerRef.current.currentTime = Math.min(duration, playerRef.current.currentTime + 10);
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
    <div className={`w-full ${className} ${minimalHover ? 'group' : ''}`}>
      {/* Video Container */}
      <div 
        className="relative w-full bg-black"
        style={{ paddingBottom: aspectRatioPadding }}
      >
        <div className="absolute inset-0">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10 pointer-events-none">
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

        {/* Quality Selector Overlay - Hidden now, using external controls */}
        {false && !isLoading && showControls && (
          <div className="video-controls absolute bottom-16 right-4 flex items-center gap-2 transition-opacity duration-200 z-30 pointer-events-auto">
            {/* Quality Selector */}
            <div className="relative quality-selector">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQualityMenu(!showQualityMenu);
                }}
                className="px-3 py-1.5 rounded-md bg-slate-800/90 hover:bg-slate-700/90 flex items-center gap-1.5 transition-colors text-white text-sm font-medium border border-red-900/30"
                title={`Quality: ${currentQuality === 'auto' ? 'Auto' : currentQuality + 'p'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6"/>
                  <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24"/>
                  <path d="M1 12h6m6 0h6"/>
                  <path d="m4.93 19.07 4.24-4.24m5.66-5.66 4.24-4.24"/>
                </svg>
                <span>{currentQuality === 'auto' ? 'Auto' : currentQuality + 'p'}</span>
              </button>
              
              {/* Quality Menu */}
              {showQualityMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-slate-900/95 backdrop-blur-md rounded-lg overflow-hidden min-w-[140px] border border-red-900/30 shadow-xl shadow-black/50">
                  {availableQualities.length > 0 ? (
                    availableQualities.map((quality) => (
                      <button
                        key={quality}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQualityChange(quality);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-white/10 transition-colors flex items-center justify-between ${
                          currentQuality === quality ? 'bg-red-600 text-white' : 'text-white/90'
                        }`}
                      >
                        <span className="font-medium">{quality === 'auto' ? 'Auto (Best)' : `${quality}p`}</span>
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
          </div>
        )}

        {/* Mux Player with best practices */}
        <div 
          className="absolute inset-0 cursor-pointer"
          onClick={(e) => {
            // Only toggle if not clicking on controls
            if (!(e.target as HTMLElement).closest('.video-controls')) {
              togglePlayPause();
            }
          }}
        >
          <MuxPlayer
            ref={playerRef}
            playbackId={playbackId}
            poster={thumbnailUrl}
            streamType="on-demand"
            autoPlay={autoPlay}
            muted={muted}
            preload="metadata"
            playsInline
            defaultHiddenCaptions={true}
            nohotkeys={minimalHover && !isFullscreen}
            accentColor="#DC2626"
            primaryColor="#FFFFFF"
            secondaryColor="#1E293B"
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
              "--controls": "none",
              "--media-object-fit": "contain",
              "--media-object-position": "center",
            } as React.CSSProperties}
            className={`mux-video-player ${minimalHover && !isFullscreen ? "minimal-hover-player" : ""} ${isFullscreen ? "fullscreen-player" : ""}`}
          />
        </div>
        </div>
      </div>

      {/* External Controls Bar - Below Video (YouTube Style) */}
      {!isLoading && showControls && (
        <div className={`video-controls w-full bg-white dark:bg-slate-900 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 ${isFullscreen ? 'fixed bottom-0 left-0 right-0 z-[99999] pointer-events-auto' : ''}`}>
          {/* Timeline Progress Bar */}
          <div 
            ref={timelineRef}
            className="relative h-1 bg-slate-200 dark:bg-slate-700 hover:h-2 transition-all cursor-pointer group/timeline pointer-events-auto z-10"
            onMouseDown={handleTimelineMouseDown}
            onMouseMove={handleTimelineMouseMove}
            onMouseLeave={handleTimelineMouseLeave}
          >
            {/* Hover time preview tooltip */}
            {timelineHover.show && !isDraggingTimeline && (
              <div 
                className="absolute bottom-full mb-2 -translate-x-1/2 px-2 py-1 bg-brand-red-500 text-white text-xs rounded pointer-events-none whitespace-nowrap z-50 shadow-lg"
                style={{ left: `${timelineHover.x}px` }}
              >
                {formatTime(timelineHover.time)}
              </div>
            )}
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 to-red-500 transition-all shadow-lg shadow-red-500/50"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            >
              {/* Draggable handle */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-brand-red-500 rounded-full shadow-lg opacity-0 group-hover/timeline:opacity-100 transition-opacity" />
            </div>
          </div>
          
          {/* Control Buttons Row */}
          <div className="flex items-center justify-between px-4 py-3 pointer-events-auto z-10">
            {/* Left Controls */}
            <div className="flex items-center gap-3">
              {/* Play/Pause Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlayPause();
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="p-2 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-brand-red-500 dark:hover:bg-brand-red-500 transition-colors text-brand-red-500 hover:text-white shadow-md pointer-events-auto cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="4" width="4" height="16"/>
                    <rect x="14" y="4" width="4" height="16"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                )}
              </button>
              
              {/* Skip Backward 10s Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  skipBackward();
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="p-2 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-brand-red-500 dark:hover:bg-brand-red-500 transition-colors text-brand-red-500 hover:text-white shadow-md pointer-events-auto cursor-pointer"
                title="Rewind 10 seconds (Left Arrow)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                  <text x="12" y="16" fontSize="8" textAnchor="middle" fill="currentColor" fontWeight="bold">10</text>
                </svg>
              </button>

              {/* Skip Forward 10s Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  skipForward();
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="p-2 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-brand-red-500 dark:hover:bg-brand-red-500 transition-colors text-brand-red-500 hover:text-white shadow-md pointer-events-auto cursor-pointer"
                title="Forward 10 seconds (Right Arrow)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
                  <path d="M21 3v5h-5"/>
                  <text x="12" y="16" fontSize="8" textAnchor="middle" fill="currentColor" fontWeight="bold">10</text>
                </svg>
              </button>
              
              <div className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 pointer-events-auto">
              {/* Quality Selector */}
              <div className="relative quality-selector pointer-events-auto z-[100000]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowQualityMenu(!showQualityMenu);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-brand-red-500 dark:hover:bg-brand-red-500 flex items-center gap-1.5 transition-colors text-brand-red-500 hover:text-white text-sm font-medium border border-slate-200 dark:border-slate-700 pointer-events-auto cursor-pointer shadow-md"
                  title={`Quality: ${currentQuality === 'auto' ? 'Auto' : currentQuality + 'p'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v6m0 6v6"/>
                    <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24"/>
                    <path d="M1 12h6m6 0h6"/>
                    <path d="m4.93 19.07 4.24-4.24m5.66-5.66 4.24-4.24"/>
                  </svg>
                  <span>{currentQuality === 'auto' ? 'Auto' : currentQuality + 'p'}</span>
                </button>
                
                {/* Quality Menu */}
                {showQualityMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-slate-900 backdrop-blur-md rounded-lg overflow-hidden min-w-[140px] border border-slate-200 dark:border-slate-700 shadow-xl pointer-events-auto z-[100001]">
                    {availableQualities.length > 0 ? (
                      availableQualities.map((quality) => (
                        <button
                          key={quality}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQualityChange(quality);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between pointer-events-auto cursor-pointer ${
                            currentQuality === quality ? 'bg-brand-red-500 text-white' : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className="font-medium">{quality === 'auto' ? 'Auto (Best)' : `${quality}p`}</span>
                          {currentQuality === quality && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">Loading...</div>
                    )}
                  </div>
                )}
              </div>

              {/* Fullscreen Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFullscreen(e);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="p-2 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-brand-red-500 dark:hover:bg-brand-red-500 transition-colors text-brand-red-500 hover:text-white border border-slate-200 dark:border-slate-700 pointer-events-auto cursor-pointer shadow-md"
                title="Fullscreen"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MuxVideoPlayer;
