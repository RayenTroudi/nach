import Image from "next/image";
import React from "react";
import { Container } from "@/components/shared";

interface CourseComponentProps {
  lessons: number;
  quizzes: number;
  category: string;
  title: string;
  author: string;
  index: number;
  courseImage: string;
}

const Lesson = ({
  lessons,
  quizzes,
  category,
  title,
  author,
  index,
  courseImage,
}: CourseComponentProps) => {
  const isWhiteBackground = index % 2 === 0;
  return (
    <div
      className={`flex flex-col gap-4 p-4 ${
        isWhiteBackground
          ? "bg-white text-[#001C27]"
          : "bg-[#001C27] text-white"
      } rounded-md shadow-sm border w-full lg:w-[380px] max-h-[255px]  hover:scale-110 ease-in-out duration-300`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center bg-[#FF782D] rounded-full h-10 w-10">
          <Image
            src="/icons/hat.svg"
            alt="Course Icon"
            loading="lazy"
            width={32}
            height={28}
          />
        </div>
        <div
          className={`flex gap-2 text-xs ${
            isWhiteBackground ? "text-[#828282]" : "text-white"
          }  whitespace-nowrap`}
        >
          <div>{lessons} lessons</div>
          <div>•</div>
          <div>{quizzes} quizzes</div>
        </div>
      </div>

      <div
        className={`mt-3 text-[12px] font-semibold ${
          isWhiteBackground ? "text-[#001C27]" : "text-white"
        }`}
      >
        {category}
      </div>

      <div
        className={`mt-2 text-[14px] font-bold ${
          isWhiteBackground ? "text-[#001C27]" : "text-white"
        }`}
      >
        {title}
      </div>

      <div className="flex items-center justify-between text-xs text-white">
        <div className="flex items-center gap-2">
          <Image
            src="/icons/user.svg"
            alt="Course Author Icon"
            loading="lazy"
            className="w-4 h-4 aspect-square"
            width={16}
            height={16}
          />
          <div
            className={`${isWhiteBackground ? "text-[#001C27]" : "text-white"}`}
          >
            {author}
          </div>
        </div>

        <div className="flex items-center">
          <div>
            <Image
              src="/icons/courseImage1.svg"
              alt="Course Icon"
              loading="lazy"
              width={60}
              height={60}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lesson;
