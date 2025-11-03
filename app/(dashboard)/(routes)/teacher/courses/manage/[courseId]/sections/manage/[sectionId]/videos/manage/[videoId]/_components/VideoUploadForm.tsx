"use client";
import React, { useState } from "react";

import { z } from "zod";
import { VidSyncPlayer } from "vidsync";

import { PencilLineIcon, XCircle } from "lucide-react";
import { FileUpload, Spinner } from "@/components/shared";
import { scnToast } from "@/components/ui/use-toast";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateVideo } from "@/lib/actions/video.action";
import { updateCourseStatus } from "@/lib/actions";
import { CourseStatusEnum } from "@/lib/models/course.model";
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
          <VidSyncPlayer src={video.videoUrl!} primaryColor="#FF782D" />
        </div>
      ) : (
        <>
          {videoUrl ? (
            <VidSyncPlayer src={video.videoUrl!} primaryColor="#FF782D" />
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
              className="bg-[#FF782D] hover:bg-[#FF782D] dark:text-slate-50"
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
