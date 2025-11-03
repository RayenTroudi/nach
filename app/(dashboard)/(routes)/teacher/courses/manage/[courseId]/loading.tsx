import { CourseStepHeader } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { CircleDollarSign, File, ListChecks } from "lucide-react";
import React from "react";

const Loading = () => {
  return (
    <>
      <Skeleton className="w-full h-[30px]" />

      <div className="w-full flex justify-between items-center  border-b border-input p-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold text-slate-950 dark:text-slate-200">
            Manage your course
          </h2>
          <p className="text-slate-400">
            Completed fields (
            <span className="text-sm font-bold text-[#FF782D]">{2}</span>/
            <span className="text-sm font-bold"> {11} </span>)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2  gap-6 mt-16 p-6">
        {/* Customize your course */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <CourseStepHeader
              icon="/icons/customize.svg"
              alt="customize"
              bgColor="bg-[#FF782D]/30"
              title="Customize your course"
            />
            <Skeleton className="w-full h-[100px]" />
          </div>
          <div className="flex flex-col gap-4">
            <CourseStepHeader
              icon="/icons/messages.svg"
              alt="message"
              bgColor="bg-[#FF782D]/30"
              title="Customize your course Messages"
            />
            <Skeleton className="w-full h-[100px]" />
            <Skeleton className="w-full h-[100px]" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <CourseStepHeader
              icon={<ListChecks color="#FF782D" />}
              alt="message"
              bgColor="bg-[#FF782D]/30"
              title="Customize your course Sections"
            />
            <Skeleton className="w-full h-[100px]" />
          </div>

          <div className="flex flex-col gap-4">
            <CourseStepHeader
              icon={<CircleDollarSign color="#FF782D" />}
              alt="pricing"
              bgColor="bg-[#FF782D]/30"
              title="Customize your course Pricing"
            />
            <Skeleton className="w-full h-[100px]" />
          </div>

          <div className="flex flex-col gap-4">
            <CourseStepHeader
              icon={<File color="#FF782D" />}
              alt="Certificate's Exam"
              bgColor="bg-[#FF782D]/30"
              title="Certificate's Exam"
            />
            <Skeleton className="w-full h-[100px]" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Loading;
