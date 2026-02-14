"use client";
import { Logo, Star } from "@/components/shared";
import { Separator } from "@/components/ui/separator";
import { calculateCourseRating, formatDate } from "@/lib/utils";
import { TCourse, TUser } from "@/types/models.types";
import { Calendar, StarIcon } from "lucide-react";
import Image from "next/image";
import React from "react";

type Props = {
  user: TUser;
  course: TCourse;
  certificateRef: React.RefObject<HTMLDivElement>;
};

const Certificate = ({ user, course, certificateRef }: Props) => {
  const { courseRating, ratingFrom } = calculateCourseRating(course);
  return (
    <div
      className="h-calc(100vh-80px) flex-1 bg-white dark:bg-slate-950 py-24 px-16 border-2 border-black dark:border-white"
      ref={certificateRef}
    >
      <div className=" bg-white dark:bg-slate-950  mx-auto h-full flex  flex-col gap-y-14 justify-between">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2 flex-shrink-0">
            <em className={` text-black dark:text-white font-bold text-4xl`}>
              We
              <em className="primary-color text-5xl">l</em>
              earn
            </em>
          </div>
        </div>

        <div className="w-full flex flex-col gap-y-2">
          <p className="text-lg font-bold text-slate-500 dark:text-slate-400 uppercase">
            Certificate of completion
          </p>
          <h2 className="leading-relaxed tracking-wider text-6xl capitalize text-black dark:text-white font-bold">
            {course.title}
          </h2>
          <div className="flex items-center gap-x-2 text-slate-500 dark:text-slate-400">
            <span className="text-md">Instructors</span>
            <span className="text-lg font-bold text-black dark:text-white">
              {" "}
              {course.instructor.username ||
                `${course.instructor.firstName} ${course.instructor.lastName}`}{" "}
            </span>
          </div>
          <div className="flex gap-1 items-center">
            <p className="text-lg font-bold text-black dark:text-white"> {courseRating} </p>
            <StarIcon size={20} className="text-[#facc15]" fill="#facc15" />
            <span className="text-md text-slate-400 dark:text-slate-500 ml-2">
              ({ratingFrom} votes)
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-y-6">
          <h3 className="text-5xl font-bold text-black dark:text-white">
            {user.username || `${user.firstName} ${user.lastName}`}
          </h3>

          <div className="flex items-center gap-x-2 text-slate-500 dark:text-slate-400">
            <span className="text-md">Date</span>
            <span className="text-lg font-bold text-black dark:text-white">
              {formatDate(Date.now())}
            </span>
          </div>
          <div className="flex items-center gap-x-2 text-slate-500 dark:text-slate-400">
            <span className="text-md">Course Level</span>
            <span className="text-lg font-bold text-black dark:text-white capitalize">
              {course.level}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
