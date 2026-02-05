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

const VideoPlayerWrapper = ({ video, isLoading, poster }: Props) => {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<boolean>(false);

  useEffect(() => setIsMounted(true), []);

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
  const isUploadThingVideo = video.videoUrl.startsWith('https://utfs.io/');

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
                <div className="text-6xl mb-4">🎥</div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Video Not Available</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">This video file is missing or has been removed.</p>
                <p className="text-xs text-slate-500 dark:text-slate-500">Please contact support if this issue persists.</p>
              </div>
            </div>
          ) : isUploadThingVideo ? (
            // Use HTML5 video player for UploadThing videos - DIRECT URL
            <video
              src={video.videoUrl}
              poster={poster}
              controls
              className="w-full h-full object-cover"
              controlsList="nodownload"
              preload="metadata"
              playsInline
              onError={(e) => {
                console.error('Video loading failed:', e);
                setVideoError(true);
              }}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            // Use MuxPlayer for Mux videos - optimized streaming
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
          )}
        </div>
      </div>
    </div>
  ) : null;
};

export default VideoPlayerWrapper;
