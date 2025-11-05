import { Star } from "@/components/shared";
import { calculateCourseRating, formatNumber } from "@/lib/utils";
import { TCourse } from "@/types/models.types";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface Props {
  course: TCourse;
}

const PendingCourse = ({ course }: Props) => {
  const { courseRating, ratingFrom } = calculateCourseRating(course);
  return (
    <>
      <div
        className={`w-full md:w-[350px] lg:w-full h-[350px] lg:h-full shadow-md lg:shadow-none rounded-md relative `}
      >
        <Link
          href={`/admin/dashboard/courses/explore/${course._id}`}
          className="group relative w-full h-full rounded-md flex gap-4 flex-col lg:flex-row hover:bg-input/50 transition ease-in-out duration-300"
        >
          <p className="absolute top-1/3 left-1/2  hidden  lg:group-hover:block font-bold text-[22px] text-brand-red-500 transition ease-in-out duration-300">
            Explore Course
          </p>
          <div className="w-full h-[200px] lg:w-[400px] lg:h-full relative border-input">
            <div className="absolute top-1 left-1 text-[12px] font-semibold rounded-sm bg-black px-2 py-4 flex items-center justify-center h-[30px] text-slate-200">
              {course.category?.name}
            </div>
            <Image
              src={
                course.thumbnail
                  ? course.thumbnail
                  : "/images/default-course-thumbnail.jpg"
              }
              alt="course"
              width={300}
              height={200}
              className=" h-[200px] lg:h-full w-full lg:w-[300px] object-cover rounded-sm"
            />
          </div>
          <div className="hidden w-full py-3 lg:grid grid-cols-3 gap-2 group-hover:opacity-5 transition ease-in-out duration-300">
            <div className="flex flex-col justify-between gap-3 items-start">
              <h2 className="font-bold line-clamp-2">{course.title}</h2>
              <p className="font-semibold text-[14px]">
                {`${course.level![0].toUpperCase()}${course.level!.slice(1)}`}{" "}
                Level
              </p>
              <div className="flex items-center gap-x-2">
                <Image
                  src={course.instructor.picture || "/images/default_profile.avif"}
                  alt="instructor"
                  width={30}
                  height={30}
                  className="rounded-full object-cover border"
                />
                <p className="text-slate-500 font-semibold text-sm">
                  {course.instructor.username}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-4 items-center justify-center w-full h-full">
              <p className="flex flex-col gap-2 items-center">
                <span className="font-bold text-[16px]">
                  {course.price && course.students?.length
                    ? "$" + course.price * course.students.length
                    : "$" + 0.0}
                </span>
                <span className="text-[13px]">Total Earned</span>
              </p>
              <p className="flex flex-col gap-2 items-center">
                <span className="font-bold text-[16px] text-center">
                  {course.students?.length
                    ? formatNumber(course.students?.length)
                    : "No Student Enrolled "}
                </span>
                {course.students?.length ? (
                  <span className="text-[13px] text-center">
                    Total Enrollment(s)
                  </span>
                ) : null}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center">
              {!course.students?.length ? (
                <span className="font-bold text-[16px] text-center">
                  No Student Enrolled
                </span>
              ) : (
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
                  <span className="text-[11px] text-[#5555558f] ml-2">
                    ({ratingFrom})
                  </span>
                </div>
              )}
              <span className="text-[13px]">Course Rating</span>
            </div>
          </div>

          <div className="flex md:flex-col lg:hidden p-4">
            <div className="w-full flex flex-col justify-between gap-3 items-start">
              <div className="w-full flex justify-between items-center">
                <h2 className="font-bold">{course.title}</h2>
                <div className="flex items-center gap-1">
                  <p className="font-bold mr-2">{courseRating}</p>

                  <Image
                    src="/icons/star-solid.svg"
                    fill={false}
                    alt="filled"
                    width={20}
                    height={20}
                  />
                </div>
              </div>
              <div className="flex items-center gap-x-2">
                <Image
                  src={course.instructor.picture || "/images/default_profile.avif"}
                  alt="instructor"
                  width={20}
                  height={20}
                  className="rounded-full"
                />
                <p className="text-slate-500 font-semibold text-sm">
                  {course.instructor.username}
                </p>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
};

export default PendingCourse;
