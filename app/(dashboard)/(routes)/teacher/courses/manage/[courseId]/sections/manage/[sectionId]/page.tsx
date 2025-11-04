"use server";
import { scnToast } from "@/components/ui/use-toast";
import { getSectionById } from "@/lib/actions/section.action";
import React from "react";
import {
  AttachmentForm,
  SectionThumbnailForm,
  SectionTitleForm,
  SectionVisibilityForm,
  StepBack,
  VideoForm,
} from "./_components";
import { Banner, CourseStepHeader } from "@/components/shared";
import { TSection } from "@/types/models.types";

const CoursesSectionIdPage = async ({
  params,
}: {
  params: { sectionId: string };
}) => {
  let section: TSection = {} as TSection;
  try {
    section = await getSectionById(params.sectionId);
  } catch (error: any) {
    scnToast({
      variant: "destructive",
      title: "Error",
      description: error.message,
    });
  }

  return (
    <>
      {section.isPublished ? (
        <Banner
          label="This section is now available for all enrolled students."
          variant={"success"}
        />
      ) : (
        <Banner
          label="This section is currently in draft mode. It will only become visible when you publish it."
          variant={"warning"}
        />
      )}
      <div className="p-6">
        <div className="w-full flex justify-between items-center p-4 border-b border-input">
          <div className="flex items-center gap-4">
            <StepBack />
            <div className="flex flex-col gap-2">
              <h2 className="text-lg md:text-3xl font-bold text-slate-950 dark:text-slate-200">
                Manage your{" "}
                <span className="text-[#FF782D]">{section?.title}</span> Section
              </h2>
              <p className="text-md md:text-lg font-semibold text-slate-400">
                <span className="text-[#FF782D]">{section?.course?.title}</span>{" "}
                Course
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col mt-6 gap-4  w-full lg:w-[800px] mx-auto">
          <div className="grid grid-cols-1 gap-4">
            <CourseStepHeader
              icon="/icons/eye.svg"
              alt="message"
              bgColor="bg-[#FF782D]/30"
              title="Manage Visibility Settings"
            />

            <SectionVisibilityForm section={section} />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <CourseStepHeader
              icon="/icons/customize.svg"
              alt="message"
              bgColor="bg-[#FF782D]/30"
              title="Manage your section"
            />
            <SectionTitleForm section={section} />
            <SectionThumbnailForm section={section} />
          </div>

          <VideoForm section={section} />
          <AttachmentForm section={section} />
        </div>
      </div>
    </>
  );
};

export default CoursesSectionIdPage;
