"use client";
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { TCourse } from "@/types/models.types";
import { useCart } from "@/contexts/CartContext";
import { Ban, Radio, Trash2 } from "lucide-react";
import { Star } from "@/components/shared";
import { CourseStatusEnum } from "@/lib/enums";
import {
  calculateCourseRating,
  formatNumber,
  transformCurrencyToSymbol,
} from "@/lib/utils";

interface Props {
  course: TCourse;
}

const CourseCard = ({ course }: Props) => {
  const { removeFromCart } = useCart();
  const { courseRating, ratingFrom } = calculateCourseRating(course);

  const devideBy =
    course.students?.length === 0 ? 1 : course.students?.length ?? 1;

  return (
    <div
      className={`w-full md:w-[350px] lg:w-full h-[350px] lg:h-full shadow-md lg:shadow-none rounded-md relative
        
      `}
    >
      <div className="group relative w-full h-full rounded-md flex gap-4 flex-col lg:flex-row hover:bg-input/50 transition ease-in-out duration-300">
        <div className="w-full h-[200px] lg:w-[400px] lg:h-full relative border border-input">
          <div className="absolute top-0 left-0 w-full aspect-[6/1] bg-gradient-to-b from-black/50 to-transparent"></div>

          <Button className="absolute top-2 left-2 cursor-pointer size-[30px] p-0 rounded-md bg-transparent hover:bg-transparent group/deleteBtn">
            <Trash2
              size={20}
              className=" text-slate-950 dark:text-slate-50 group-hover/deleteBtn:text-destructive "
              onClick={() => removeFromCart(course._id!)}
            />
          </Button>

          <Image
            loading="lazy"
            src={course.thumbnail!}
            alt="course"
            width={300}
            height={200}
            className=" h-[200px] lg:h-full w-full lg:w-[300px] object-cover z-10  "
          />
        </div>
        <div className="hidden w-full py-3 lg:grid grid-cols-3 gap-2 group-hover:opacity-5 transition ease-in-out duration-300">
          <div className="flex flex-col justify-between gap-3 items-start">
            <h2 className="font-bold">{course.title}</h2>
            <p className="font-semibold text-[14px]">
              {`${course.level![0].toUpperCase()}${course.level!.slice(1)}`}{" "}
              Level
            </p>
            <div className="flex items-center gap-x-2 text-[#16a34a] text-[13px]">
              <Radio size={18} className="animate-pulse" />
              <p>Live Now</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 items-center justify-center w-full h-full">
            <p className="flex flex-col gap-2 items-center">
              <span className="font-bold text-[16px]">
                {transformCurrencyToSymbol(course?.currency!.toUpperCase())}
                {course.price!}
              </span>
              <span className="font-bold text-[16px] text-center">
                Course Price
              </span>
            </p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center">
              <p className="font-bold mr-2">{courseRating}</p>

              {Array.from({ length: 5 }).map((_, key) => (
                <Star
                  key={key}
                  index={key}
                  stars={courseRating}
                  filled={courseRating > key}
                />
              ))}
              <span className="text-[11px] text-slate-400 dark:text-slate-400 ml-2">
                ({ratingFrom})
              </span>
            </div>
            <span className="text-[13px]">Course Rating</span>
          </div>
        </div>

        <div className="flex md:flex-col lg:hidden p-4">
          <div className="w-full flex flex-col justify-between gap-3 items-start">
            <div className="w-full flex justify-between items-center">
              <h2 className="font-bold">{course.title}</h2>
              <div className="flex items-center gap-1">
                {course.students?.length ? (
                  <p className="font-bold mr-2">
                    {/* {Math.round(
                      (course.votes! / course.students?.length!) * 2
                    ) / 2} */}
                    to calculate
                  </p>
                ) : (
                  <p className="font-bold">0</p>
                )}
                <Image
                  loading="lazy"
                  src="/icons/star-solid.svg"
                  fill={false}
                  alt="filled"
                  width={20}
                  height={20}
                />
              </div>
            </div>
            <p className="font-semibold text-[14px]">
              {`${course.level![0].toUpperCase()}${course.level!.slice(1)}`}{" "}
              Level
            </p>
            <p className="text-slate-400 dark:text-slate-400 text-[13px]">
              {course.isPublished ? (
                <div className="flex items-center gap-x-2 text-[#16a34a]">
                  <Radio size={18} className="animate-pulse" />
                  <p>Live Now</p>
                </div>
              ) : course.status === CourseStatusEnum.Rejected ? (
                <div className="flex items-center gap-x-2 text-[#b91c1c]">
                  <Ban size={18} className="animate-pulse" />
                  <p>Rejected</p>
                </div>
              ) : (
                <span>
                  Private ·{" "}
                  {`${course.status![0].toUpperCase()}${course.status!.slice(
                    1
                  )}`}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
