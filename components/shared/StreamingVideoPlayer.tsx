"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface StreamingVideoPlayerProps {
  videoUrl: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
  onError?: (error: Error) => void;
  onLoadStart?: () => void;
  onCanPlay?: () => void;
}

/**
 * Optimized Video Player Component
 * 
 * Features:
 * - Lazy loading with preload="none" for instant page load
 * - Automatic streaming URL generation
 * - Range request support for seeking
 * - Error handling with user-friendly messages
 * - Loading states
 * - Poster image display
 * 
 * Usage:
 * <StreamingVideoPlayer 
 *   videoUrl="https://utfs.io/f/video-id.mp4"
 *   poster="/thumbnail.jpg"
 * />
 */
export default function StreamingVideoPlayer({
  videoUrl,
  poster,
  className = "",
  autoPlay = false,
  muted = false,
  controls = true,
  onError,
  onLoadStart,
  onCanPlay,
}: StreamingVideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  // Generate streaming URL
  const streamingUrl = getStreamingUrl(videoUrl);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => {
      setIsLoading(true);
      setHasError(false);
      onLoadStart?.();
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      onCanPlay?.();
    };

    const handleError = (e: Event) => {
      setIsLoading(false);
      setHasError(true);
      
      const target = e.target as HTMLVideoElement;
      const error = target.error;
      
      let message = "Unable to load video";
      if (error) {
        switch (error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            message = "Video loading was aborted";
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            message = "Network error while loading video";
            break;
          case MediaError.MEDIA_ERR_DECODE:
            message = "Video format not supported or corrupted";
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            message = "Video source not found or format not supported";
            break;
        }
      }
      
      setErrorMessage(message);
      onError?.(new Error(message));
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [onLoadStart, onCanPlay, onError]);

  if (hasError) {
    return (
      <div className={`relative bg-slate-900 flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🎥</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Video Unavailable
          </h3>
          <p className="text-sm text-slate-400 mb-4">{errorMessage}</p>
          <button
            onClick={() => {
              setHasError(false);
              setErrorMessage("");
              videoRef.current?.load();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}
      
      <video
        ref={videoRef}
        src={streamingUrl}
        poster={poster}
        controls={controls}
        autoPlay={autoPlay}
        muted={muted}
        playsInline
        preload="none" // Only load when user clicks play
        className="w-full h-full object-cover bg-black"
      >
        <p className="text-white p-4">
          Your browser does not support HTML5 video playback.
        </p>
      </video>
    </div>
  );
}

/**
 * Generate streaming URL for video
 * Routes video through streaming API for range request support
 */
function getStreamingUrl(videoUrl: string): string {
  if (!videoUrl) return "";
  
  // If already using streaming API, return as-is
  if (videoUrl.includes('/api/video-stream')) {
    return videoUrl;
  }
  
  // Route through streaming API
  return `/api/video-stream?url=${encodeURIComponent(videoUrl)}`;
}
