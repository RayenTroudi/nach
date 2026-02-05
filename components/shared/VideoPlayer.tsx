"use client";
import { TVideo } from "@/types/models.types";
import { useEffect, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import Spinner from "./Spinner";

interface Props {
  video: TVideo;
  isLoading: boolean;
  poster: string;
}

const VideoPlayer = ({ video, isLoading, poster }: Props) => {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<string>("");

  useEffect(() => setIsMounted(true), []);

  // Debug logging
  useEffect(() => {
    if (video) {
      console.log('🎬 VideoPlayer mounted with:', {
        videoUrl: video.videoUrl,
        videoSource: video.videoSource,
        hasMuxData: !!video.muxData,
        muxPlaybackId: video.muxData?.playbackId,
      });
    }
  }, [video]);

  // Check if video has a valid URL
  if (!video || !video.videoUrl) {
    return (
      <div className="w-full lg:flex-1 bg-slate-50 dark:bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
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
  const isMuxVideo = video.videoSource === "Mux" && video.muxData?.playbackId;

  return isMounted ? (
    <div className="w-full lg:flex-1 bg-slate-50 dark:bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <div className="absolute inset-0">
          {isLoading ? (
            <div className="w-full h-full bg-slate-200 dark:bg-slate-900 flex items-center justify-center">
              <Spinner size={50} />
            </div>
          ) : videoError ? (
            <div className="w-full h-full bg-slate-200 dark:bg-slate-900 flex items-center justify-center">
              <div className="text-center p-6">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Video Load Error
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {videoError}
                </p>
                <button
                  onClick={() => {
                    setVideoError("");
                    window.location.reload();
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : isMuxVideo ? (
            // Use MuxPlayer for Mux videos
            <MuxPlayer
              playbackId={video.muxData?.playbackId}
              poster={poster}
              streamType="on-demand"
              metadata={{
                video_id: video._id?.toString(),
                video_title: video.title,
              }}
              accentColor="#DD0000"
              preload="metadata"
              style={{ 
                width: '100%', 
                height: '100%',
                '--media-object-fit': 'cover',
              } as React.CSSProperties}
            />
          ) : (
            // Use HTML5 video for UploadThing and other videos - DIRECT URL
            <video
              src={video.videoUrl}
              poster={poster}
              controls
              className="w-full h-full object-cover bg-black"
              playsInline
              preload="metadata"
              controlsList="nodownload"
              onError={(e) => {
                const errorMsg = `Video failed to load. URL: ${video.videoUrl}`;
                console.error('❌ Video error:', errorMsg, e);
                setVideoError(errorMsg);
              }}
              onLoadStart={() => console.log('▶️ Video loading started')}
              onCanPlay={() => console.log('✅ Video ready to play')}
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </div>
    </div>
  ) : null;
};

export default VideoPlayer;