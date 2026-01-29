"use client";
import React, { useState } from "react";

import { z } from "zod";
import MuxPlayer from "@mux/mux-player-react";
import { getProxiedVideoUrl } from "@/lib/utils/video-url-helper";

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSaving(true);
      const updatedVideo = await updateVideo({
        videoId: video._id,
        courseId: video.sectionId.course._id,
        instructorId: video.sectionId.course.instructor._id,
        data: values,
        path: pathname,
      });

      await updateCourseStatus({
        courseId: video?.sectionId.course._id,
        status:
          video?.sectionId.course.status !== CourseStatusEnum.Draft
            ? CourseStatusEnum.Pending
            : video?.sectionId.course.status,
        path: pathname,
      });

      setEdit(false);
      scnToast({
        variant: "success",
        title: "Success",
        description: "Video Added Successfully!",
      });
      router.refresh();
    } catch (error: any) {
      scnToast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  }

  const onToggleEditHandler = () =>
    setEdit((curr) => {
      return !video.videoUrl ? false : !curr;
    });

  const onChangeVideoUrlHandler = (url?: string) => setVideoUrl(url);
  const onEditVideo = () => setVideoUrl("");
  return (
    <div className=" flex flex-col gap-2 bg-slate-200/50 dark:bg-slate-900 shadow-md p-6 rounded-md border border-input ">
      <div className="w-full flex items-center justify-between">
        <h2 className="font-bold text-slate-500 dark:text-slate-300">
          Video URL
        </h2>
        <Button variant="ghost" size="icon" onClick={onToggleEditHandler}>
          {!edit && video.videoUrl ? (
            <PencilLineIcon
              size={15}
              className="text-slate-600  dark:text-slate-300"
            />
          ) : (
            <XCircle size={15} className="text-slate-600 dark:text-slate-300" />
          )}
        </Button>
      </div>
      {!edit && video.videoUrl ? (
        <div className="w-full h-full relative aspect-video">
          {video.videoUrl.startsWith('https://utfs.io/') ? (
            <video
              src={getProxiedVideoUrl(video.videoUrl)}
              controls
              className="w-full h-full object-cover bg-black"
              controlsList="nodownload"
              crossOrigin="anonymous"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <MuxPlayer
              playbackId={video.muxData?.playbackId}
              streamType="on-demand"
              metadata={{
                video_id: video._id?.toString(),
                video_title: video.title,
              }}
              accentColor="#DD0000"
              style={{ 
                width: '100%', 
                height: '100%',
                '--media-object-fit': 'cover',
              } as React.CSSProperties}
            />
          )}
        </div>
      ) : (
        <>
          {videoUrl ? (
            videoUrl.startsWith('https://utfs.io/') ? (
              <video
                src={getProxiedVideoUrl(videoUrl)}
                controls
                className="w-full h-full object-cover bg-black"
                controlsList="nodownload"
                crossOrigin="anonymous"
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <MuxPlayer
                playbackId={video.muxData?.playbackId}
                streamType="on-demand"
                metadata={{
                  video_id: video._id?.toString(),
                  video_title: video.title,
                }}
                accentColor="#DD0000"
                style={{ 
                  width: '100%', 
                  height: '100%',
                  '--media-object-fit': 'cover',
                } as React.CSSProperties}
              />
            )
          ) : (
            <>
              {isSaving ? (
                <div className="w-full h-[300px] flex items-center justify-center">
                  <Spinner size={50} />
                </div>
              ) : (
                <FileUpload
                  className={`w-full ${videoUrl ? "" : "h-full"} `}
                  endpoint="sectionVideo"
                  onChange={onChangeVideoUrlHandler}
                />
              )}
            </>
          )}
          <div className="pt-4 flex gap-x-2 justify-between">
            <Button onClick={onEditVideo} disabled={!videoUrl}>
              Change Video
            </Button>
            <Button
              size="sm"
              className="bg-brand-red-500 hover:bg-brand-red-600 dark:text-slate-50"
              disabled={isSaving || !videoUrl || videoUrl === video.videoUrl}
              onClick={() => onSubmit({ videoUrl: videoUrl!.toString() })}
            >
              {isSaving ? (
                <Spinner size={20} className="text-slate-50 " />
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default VideoUploadForm;
