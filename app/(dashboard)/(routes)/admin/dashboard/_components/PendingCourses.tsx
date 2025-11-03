"use client";
import React from "react";
import PendingCourse from "./PendingCourse";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { TCourse } from "@/types/models.types";
interface Props {
  courses: TCourse[];
}
const PendingCourses = ({ courses }: Props) => {
  return (
    <div className="flex flex-col items-start gap-4">
      <div className="w-full flex flex-col gap-2 items-start md:items-center md:justify-between md:gap-4 md:flex-row">
        <div className={`w-full md:flex-1 h-[43px] bg-transparent relative`}>
          <Input
            placeholder="Search For Courses By Instructor ..."
            className={`pl-[50px] w-full h-full text-slate-700 font-semibold bg-slate-100 dark:bg-slate-900 border-none outline-none rounded-sm focus-visible:ring-0  focus-visible:ring-offset-0 `}
            value={""}
            onChange={(e) => {}}
          />
          <Image
            src="/icons/search.svg"
            alt="search"
            width={20}
            height={20}
            className="absolute top-1/2 left-4 transform -translate-y-1/2 "
          />
        </div>
      </div>

      {courses.map((course: TCourse) => (
        <PendingCourse key={course._id} course={course} />
      ))}
    </div>
  );
};

export default PendingCourses;
