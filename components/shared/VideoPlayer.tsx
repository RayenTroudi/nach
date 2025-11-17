"use client";
import { TVideo } from "@/types/models.types";
import { useEffect, useState } from "react";
import Spinner from "./Spinner";
import { VidSyncPlayer } from "vidsync";

interface Props {
  video: TVideo;
  isLoading: boolean;
  poster: string;
}

const VideoPlayer = ({ video, isLoading, poster }: Props) => {
  const [isMounted, setIsMounted] = useState<boolean>(false);

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

  return isMounted ? (
    <div className="w-full lg:flex-1 bg-slate-50 dark:bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <div className="absolute inset-0">
          {isLoading ? (
            <div className="w-full h-full bg-slate-200 dark:bg-slate-900 flex items-center justify-center">
              <Spinner size={50} />
            </div>
          ) : (
            <VidSyncPlayer src={video.videoUrl} poster={poster} />
          )}
        </div>
      </div>
    </div>
  ) : null;
};

export default VideoPlayer;
