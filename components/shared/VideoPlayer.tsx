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

  return isMounted ? (
    <div className="bg-slate-50 dark:bg-slate-950   aspect-video flex-1 max-h-[250px]  border-t md:border-r">
      <div className={` w-full  relative aspect-video max-h-full `}>
        {isLoading ? (
          <div className=" w-full h-full bg-slate-200 dark:bg-slate-900 flex items-center justify-center">
            <Spinner size={50} />
          </div>
        ) : (
          <VidSyncPlayer src={video.videoUrl!} poster={poster} />
        )}
      </div>
    </div>
  ) : null;
};

export default VideoPlayer;
