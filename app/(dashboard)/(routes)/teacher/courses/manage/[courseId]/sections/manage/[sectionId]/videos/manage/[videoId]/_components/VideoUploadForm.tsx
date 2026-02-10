"use client";
import React, { useState } from "react";

import { z } from "zod";
import MuxVideoPlayer, { getMuxThumbnail } from "@/components/shared/MuxVideoPlayer";

import { PencilLineIcon, XCircle } from "lucide-react";
import { FileUpload, Spinner } from "@/components/shared";
import { scnToast } from "@/components/ui/use-toast";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateVideo } from "@/lib/actions/video.action";
import { updateCourseStatus } from "@/lib/actions";
import { CourseStatusEnum } from "@/lib/enums";
import { TVideo } from "@/types/models.types";

const formSchema = z.object({
  videoUrl: z.string().min(5).max(50),
});

interface Props {
  video: TVideo;
}

const VideoUploadForm = ({ video }: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(() =>
    video.videoUrl ? video.videoUrl : ""
  );

  // Safety check for nested properties
  if (!video?.sectionId?.course) {
    return (
      <div className="flex flex-col gap-2 bg-slate-200/50 dark:bg-slate-900 shadow-md p-6 rounded-md border border-input">
        <p className="text-red-500">Error: Video data is incomplete</p>
      </div>
    );
  }

  async function onSubmit(uploadedUrl: string) {
    try {
      setIsSaving(true);
      setIsProcessing(true);

      // Step 1: Create Mux asset from the uploaded video URL
      const muxResponse = await fetch('/api/mux/create-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: video._id,
          videoUrl: uploadedUrl,
        }),
      });

      if (!muxResponse.ok) {
        const error = await muxResponse.json();
        throw new Error(error.error || 'Failed to process video with Mux');
      }

      const muxData = await muxResponse.json();
      console.log('[VideoUpload] Mux asset created:', muxData);

      setIsProcessing(false);

      // Step 2: Update course status if needed
      await updateCourseStatus({
        courseId: video?.sectionId.course._id,
        status:
          video?.sectionId.course.status !== CourseStatusEnum.Draft
            ? CourseStatusEnum.Pending
            : video?.sectionId.course.status,
        path: pathname,
      });

      setEdit(false);
      setVideoUrl("");
      scnToast({
        variant: "success",
        title: "Success",
        description: "Video processed successfully! Adaptive streaming is now enabled.",
      });
      router.refresh();
    } catch (error: any) {
      console.error('[VideoUpload] Error:', error);
      setIsProcessing(false);
      scnToast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to process video",
      });
    } finally {
      setIsSaving(false);
    }
  }

  const onToggleEditHandler = () =>
    setEdit((curr) => {
      return !video.muxData?.playbackId ? false : !curr;
    });

  const onChangeVideoUrlHandler = (url?: string) => {
    if (url) {
      setVideoUrl(url);
      // Automatically submit when video is uploaded
      onSubmit(url);
    }
  };

  const onEditVideo = () => setVideoUrl("");

  return (
    <div className=" flex flex-col gap-2 bg-slate-200/50 dark:bg-slate-900 shadow-md p-6 rounded-md border border-input ">
      <div className="w-full flex items-center justify-between">
        <h2 className="font-bold text-slate-500 dark:text-slate-300">
          Video Upload
        </h2>
        <Button variant="ghost" size="icon" onClick={onToggleEditHandler}>
          {!edit && video.muxData?.playbackId ? (
            <PencilLineIcon
              size={15}
              className="text-slate-600  dark:text-slate-300"
            />
          ) : (
            <XCircle size={15} className="text-slate-600 dark:text-slate-300" />
          )}
        </Button>
      </div>
      
      {!edit && video.muxData?.playbackId ? (
        <div className="w-full h-full relative">
          <MuxVideoPlayer
            playbackId={video.muxData.playbackId}
            title={video.title}
            poster={getMuxThumbnail(video.muxData.playbackId)}
            metadata={{
              video_id: video._id?.toString(),
              video_title: video.title,
            }}
            showControls={true}
          />
        </div>
      ) : (
        <>
          {isSaving || isProcessing ? (
            <div className="w-full h-[300px] flex flex-col items-center justify-center gap-4">
              <Spinner size={50} />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {isProcessing 
                  ? "Processing video with Mux... This may take a few minutes." 
                  : "Uploading video..."}
              </p>
            </div>
          ) : (
            <FileUpload
              className={`w-full ${videoUrl ? "" : "h-full"} `}
              endpoint="sectionVideo"
              onChange={onChangeVideoUrlHandler}
            />
          )}
          {!isSaving && !isProcessing && (
            <div className="pt-4 flex gap-x-2 justify-end">
              <Button onClick={onEditVideo} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VideoUploadForm;
