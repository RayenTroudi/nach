"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/shared";
import { PencilLineIcon, Video, XCircle } from "lucide-react";
import { updateCourse } from "@/lib/actions/course.action";
import { usePathname, useRouter } from "next/navigation";
import { scnToast } from "@/components/ui/use-toast";
import { TCourse } from "@/types/models.types";
import { getProxiedVideoUrl } from "@/lib/utils/video-url-helper";

interface Props {
  course: TCourse;
}

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
        description: "FAQ video uploaded successfully!",
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

  return (
    <div className="flex flex-col gap-4 bg-slate-200/10 px-3 py-4 dark:bg-slate-800/10 rounded-sm">
      {!edit && course.faqVideo ? (
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex items-center justify-between">
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">
              Current Video
            </h3>
            <Button variant="ghost" size="icon" onClick={onToggleEditHandler}>
              <PencilLineIcon size={15} className="text-slate-600" />
            </Button>
          </div>
          <div className="aspect-video rounded-lg overflow-hidden bg-slate-900">
            <video
              src={getProxiedVideoUrl(course.faqVideo)}
              controls
              controlsList="nodownload"
              className="w-full h-full"
              crossOrigin="anonymous"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col gap-4">
          {course.faqVideo && (
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
          </p>
        </div>
      )}
    </div>
  );
};

export default FAQVideoForm;
