"use client";

import { useEffect, useRef, useState } from "react";
import { TVideo } from "@/types/models.types";
import MuxPlayer from "@mux/mux-player-react";
import Spinner from "./Spinner";
import { getProxiedVideoUrl } from "@/lib/utils/video-url-helper";
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

// Add types for Video.js
declare global {
  interface Window {
    videojs: typeof videojs;
  }
}

interface Props {
  video: TVideo;
  isLoading: boolean;
  poster: string;
  autoplay?: boolean;
  className?: string;
}

const OptimizedVideoPlayer = ({ video, isLoading, poster, autoplay = false, className = "" }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      // Cleanup Video.js player on unmount
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Only initialize for UploadThing videos
    if (!videoRef.current || !video?.videoUrl || !video.videoUrl.startsWith('https://utfs.io/')) {
      return;
    }

    // Initialize Video.js player with optimized settings
    const player = videojs(videoRef.current, {
      controls: true,
      autoplay: autoplay,
      preload: 'none', // Changed from 'auto' to 'none' for faster initial load
      fluid: true,
      responsive: true,
      aspectRatio: '16:9',
      controlBar: {
        volumePanel: { inline: false },
        pictureInPictureToggle: true,
        fullscreenToggle: true,
      },
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
      html5: {
        vhs: {
          enableLowInitialPlaylist: true,
          smoothQualityChange: true,
          overrideNative: true,
        },
        nativeVideoTracks: false,
        nativeAudioTracks: false,
        nativeTextTracks: false,
      },
    });

    playerRef.current = player;

    // Add error handling
    player.on('error', () => {
      const error = player.error();
      if (error) {
        console.error('Video.js error:', error);
        setError('Failed to load video. Please try again.');
      }
    });

    // Add loading optimization
    player.on('loadstart', () => {
      setError(null);
    });

    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [video?.videoUrl, autoplay]);

  // Check if video has a valid URL
  if (!video || !video.videoUrl) {
    return (
      <div className={`w-full lg:flex-1 bg-slate-50 dark:bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 ${className}`}>
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-4">
              <p className="text-slate-600 dark:text-slate-400">
                Video not available
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Determine if this is an UploadThing video or Mux video
  const isUploadThingVideo = video.videoUrl.startsWith('https://utfs.io/');

  return isMounted ? (
    <div className={`w-full lg:flex-1 bg-slate-50 dark:bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 ${className}`}>
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <div className="absolute inset-0">
          {isLoading ? (
            <div className="w-full h-full bg-slate-200 dark:bg-slate-900 flex items-center justify-center">
              <Spinner size={50} />
            </div>
          ) : error ? (
            <div className="w-full h-full bg-slate-200 dark:bg-slate-900 flex items-center justify-center">
              <div className="text-center p-4">
                <p className="text-red-500 dark:text-red-400">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-2 px-4 py-2 bg-brand-red-500 text-white rounded hover:bg-brand-red-600"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : isUploadThingVideo ? (
            // Use Video.js for UploadThing videos with optimized settings
            <div data-vjs-player>
              <video
                ref={videoRef}
                className="video-js vjs-big-play-centered vjs-theme-forest"
                poster={poster}
              >
                <source src={getProxiedVideoUrl(video.videoUrl)} type="video/mp4" />
                <p className="vjs-no-js">
                  To view this video please enable JavaScript, and consider upgrading to a
                  web browser that supports HTML5 video
                </p>
              </video>
            </div>
          ) : (
            // Use MuxPlayer for Mux videos (already optimized)
            <MuxPlayer
              playbackId={video.muxData?.playbackId}
              poster={poster}
              streamType="on-demand"
              metadata={{
                video_id: video._id?.toString(),
                video_title: video.title,
              }}
              accentColor="#DD0000"
              preload="none"
              style={{ 
                width: '100%', 
                height: '100%',
                '--media-object-fit': 'cover',
              } as React.CSSProperties}
            />
          )}
        </div>
      </div>
    </div>
  ) : null;
};

export default OptimizedVideoPlayer;
