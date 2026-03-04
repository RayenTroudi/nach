"use client";

import { TVideo } from "@/types/models.types";
import { useEffect, useState } from "react";
import MuxVideoPlayer, { getMuxThumbnail } from "./MuxVideoPlayer";
import Spinner from "./Spinner";

interface Props {
  video: TVideo;
  isLoading: boolean;
  poster?: string;
}

/**
 * VideoPlayer - Wrapper for section/course videos
 * Updated to use best-practice MuxVideoPlayer component
 * All videos are now streamed via Mux with adaptive bitrate
 */
const VideoPlayer = ({ video, isLoading, poster }: Props) => {
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    console.log("[VideoPlayer] Rendering with video:", {
      title: video?.title,
      videoId: video?._id,
      hasMuxData: !!video?.muxData,
      muxDataType: typeof video?.muxData,
      muxDataKeys: video?.muxData ? Object.keys(video.muxData) : [],
      muxData: video?.muxData,
      playbackId: video?.muxData?.playbackId,
    });
    setIsMounted(true);
  }, [video]);

  // Show loading state before mounting
  if (!isMounted) {
    return (
      <div className="w-full lg:flex-1 bg-slate-50 dark:bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner size={50} />
          </div>
        </div>
      </div>
    );
  }

  // Loading state while fetching video data
  if (isLoading) {
    return (
      <div className="w-full lg:flex-1 bg-slate-50 dark:bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <div className="absolute inset-0 flex items-center justify-center bg-slate-200 dark:bg-slate-900">
            <Spinner size={50} />
          </div>
        </div>
      </div>
    );
  }

  // Check if video has Mux data
  const hasValidMuxData = video && video.muxData && typeof video.muxData === 'object' && video.muxData.playbackId && video.muxData.playbackId.length > 0;
  
  if (!hasValidMuxData) {
    console.error("[VideoPlayer] Missing video data:", {
      hasVideo: !!video,
      videoTitle: video?.title,
      videoId: video?._id,
      hasMuxData: !!video?.muxData,
      muxDataType: typeof video?.muxData,
      muxDataContent: video?.muxData,
      hasPlaybackId: !!video?.muxData?.playbackId,
      playbackIdValue: video?.muxData?.playbackId,
      playbackIdLength: video?.muxData?.playbackId?.length,
      hasVideoUrl: !!video?.videoUrl
    });
    
    return (
      <div className="w-full lg:flex-1 bg-slate-50 dark:bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-6">
              <div className="text-6xl mb-4">🎬</div>
              <p className="text-slate-600 dark:text-slate-400 mb-2">
                Video not available or still processing
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                {video?.title ? `"${video.title}"` : 'Unknown video'}
              </p>
              {process.env.NODE_ENV === 'development' && (
                <p className="text-xs text-slate-400 mt-2">
                  Missing: {!video?.muxData ? 'muxData' : !video.muxData.playbackId ? 'playbackId' : 'video'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // At this point we know video and muxData exist
  // Extract playbackId safely
  const playbackId = typeof video.muxData === 'object' && video.muxData.playbackId 
    ? video.muxData.playbackId 
    : '';
  
  console.log("[VideoPlayer] About to render MuxVideoPlayer:", {
    videoTitle: video.title,
    playbackId: playbackId,
    hasPlaybackId: !!playbackId,
    playbackIdLength: playbackId.length
  });

  // Generate poster from Mux if not provided
  const posterUrl = poster || getMuxThumbnail(playbackId);

  return (
    <div className="w-full lg:flex-1 bg-slate-50 dark:bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
      <MuxVideoPlayer
        playbackId={playbackId}
        title={video.title}
        poster={posterUrl}
        metadata={{
          video_id: video._id?.toString(),
          video_title: video.title,
        }}
        showControls={true}
      />
    </div>
  );
};

export default VideoPlayer;
