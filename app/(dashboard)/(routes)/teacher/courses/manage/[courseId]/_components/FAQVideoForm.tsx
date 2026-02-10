"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/shared";
import { PencilLineIcon, XCircle } from "lucide-react";
import { updateCourse } from "@/lib/actions/course.action";
import { usePathname, useRouter } from "next/navigation";
import { scnToast } from "@/components/ui/use-toast";
import { TCourse } from "@/types/models.types";
import MuxVideoPlayer, { getMuxThumbnail } from "@/components/shared/MuxVideoPlayer";

interface Props {
  course: TCourse;
}

/**
 * FAQVideoForm - Teacher's FAQ video management
 * Updated to use Mux streaming for video preview
 * Videos are automatically processed to Mux after upload via API route
 */
const FAQVideoForm = ({ course }: Props) => {
  const pathname = usePathname();
  const [edit, setEdit] = useState<boolean>(false);
  const router = useRouter();

  const onSubmitHandler = async (videoUrl: string) => {
    try {
      await updateCourse({
        courseId: course._id,
        instructorId: course.instructor._id,
        data: { faqVideo: videoUrl },
        path: pathname,
      });

      scnToast({
        variant: "success",
        title: "Success!",
        description: "FAQ video uploaded successfully! Processing for streaming...",
      });

      setEdit(false);
      router.refresh();
    } catch (error: any) {
      scnToast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const onToggleEditHandler = () => setEdit((curr) => !curr);

  // Check if video has Mux data
  const hasMuxVideo = course.faqVideoMuxData?.playbackId;
  const playbackId = course.faqVideoMuxData?.playbackId || "";
  const posterUrl = course.thumbnail || (playbackId ? getMuxThumbnail(playbackId) : "");

  return (
    <div className="flex flex-col gap-4 bg-slate-200/10 px-3 py-4 dark:bg-slate-800/10 rounded-sm">
      {!edit && (course.faqVideo || hasMuxVideo) ? (
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex items-center justify-between">
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">
              Current FAQ Video
            </h3>
            <Button variant="ghost" size="icon" onClick={onToggleEditHandler}>
              <PencilLineIcon size={15} className="text-slate-600" />
            </Button>
          </div>
          
          {hasMuxVideo ? (
            // Mux streaming video (processed)
            <div className="w-full rounded-lg overflow-hidden bg-slate-900">
              <MuxVideoPlayer
                playbackId={playbackId}
                title={`${course.title} - FAQ Video`}
                poster={posterUrl}
                showControls={true}
                metadata={{
                  video_id: course._id?.toString(),
                  video_title: course.title,
                  video_type: "faq",
                }}
              />
            </div>
          ) : (
            // Show processing message if uploaded but not yet in Mux
            <div className="aspect-video rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center">
              <div className="text-center p-6">
                <div className="text-5xl mb-3">⏳</div>
                <h4 className="text-white font-semibold mb-2">Processing Video</h4>
                <p className="text-slate-400 text-sm">
                  Your video is being processed for streaming.
                  <br />
                  This usually takes 1-3 minutes.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.refresh()}
                >
                  Refresh Status
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full flex flex-col gap-4">
          {(course.faqVideo || hasMuxVideo) && (
            <div className="w-full flex items-center justify-between">
              <h3 className="font-semibold text-slate-700 dark:text-slate-300">
                Replace Video
              </h3>
              <Button variant="ghost" size="icon" onClick={onToggleEditHandler}>
                <XCircle size={15} className="text-slate-600" />
              </Button>
            </div>
          )}
          <FileUpload
            endpoint="sectionVideo"
            onChange={(url) => {
              if (url) {
                onSubmitHandler(url);
              }
            }}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload your FAQ video (recommended: 30 seconds to 3 minutes)
            <br />
            Video will be automatically processed for adaptive streaming.
          </p>
        </div>
      )}
    </div>
  );
};

export default FAQVideoForm;

