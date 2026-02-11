import { getVideoById } from "@/lib/actions/video.action";
import React from "react";
import { StepBack } from "../../../_components";
import {
  VideoAccessForm,
  VideoTitleForm,
  VideoDescriptionForm,
  VideoVisibilityForm,
} from "./_components";
import VideoUploadForm from "./_components/VideoUploadForm";
import VideoFilePacksForm from "./_components/VideoFilePacksForm";
import { Banner, CourseStepHeader } from "@/components/shared";
import { TVideo } from "@/types/models.types";
import { redirect } from "next/navigation";

const VideIdPage = async ({ params }: { params: { videoId: string } }) => {
  let video: TVideo | null = null;
  
  try {
    video = await getVideoById(params.videoId);
    console.log("Video data:", JSON.stringify(video, null, 2));
  } catch (error: any) {
    console.error("Error fetching video:", error);
    redirect("/teacher/courses");
  }

  if (!video) {
    console.error("Video not found");
    redirect("/teacher/courses");
  }

  if (!video.sectionId) {
    console.error("Video sectionId missing");
    redirect("/teacher/courses");
  }

  // Check if sectionId is populated (object) or just an ID (string)
  const section = typeof video.sectionId === 'object' ? video.sectionId : null;
  
  if (!section || !section.course) {
    console.error("Section or course data not populated properly");
    redirect("/teacher/courses");
  }

  return (
    <>
      {video.isPublished ? (
        <Banner
          label="This video is now available for all enrolled students."
          variant={"success"}
        />
      ) : (
        <Banner
          label="This video is currently in draft mode. It will only become visible when you publish it."
          variant={"warning"}
        />
      )}
      <div className="p-6">
        <div className="w-full flex justify-between items-center p-4 border-b border-input">
          <div className="flex items-center gap-4">
            <StepBack />
            <div className="flex flex-col gap-2">
              <h2 className="text-lg md:text-3xl font-bold text-slate-950 dark:text-slate-200 ">
                Manage your{" "}
                <span className="text-brand-red-500">{video?.title}</span> Video
              </h2>
              <p className="text-md md:text-lg font-semibold text-slate-400">
                <span className="text-brand-red-500">
                  {video?.sectionId?.course?.title}{" "}
                  <span className="text-slate-400">/</span>{" "}
                  {video?.sectionId?.title}
                </span>{" "}
                Section
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col mt-6 gap-4  w-full lg:w-[800px] mx-auto">
          <div className="grid grid-cols-1 gap-2">
            <CourseStepHeader
              icon="/icons/eye.svg"
              alt="message"
              bgColor="bg-brand-red-500/30"
              title="Accessability & Visibility Settings"
            />
            <VideoAccessForm video={video} />
            <VideoVisibilityForm video={video} />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <CourseStepHeader
              icon="/icons/customize.svg"
              alt="customize"
              bgColor="bg-brand-red-500/30"
              title="Customize your video"
            />
            <VideoTitleForm video={video} />
            <VideoDescriptionForm video={video} />
            <VideoFilePacksForm video={video} />
            <VideoUploadForm video={video} />
            {/* <SectionThumbnailForm section={section} /> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default VideIdPage;
