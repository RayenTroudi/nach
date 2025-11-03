import Image from "next/image";
import React from "react";
import FramerMotion from "./FramerMotion";
import { Ban } from "lucide-react";
import { Meteors } from "../ui/meteors";
import { BorderBeam } from "../magicui/border-beam";

interface Props {
  icon?: string;
  category: string;
  courses?: number;
  description?: string;
}

const Category = ({ category, courses = 0, description = "" }: Props) => {
  return (
    <FramerMotion className="">
      <div className="  relative w-full lg:w-[210px] rounded-md h-[160px] hover:scale-110 group duration-300 transition-all ease-in-out">
        <div className="relative shadow-md dark:shadow-none bg-transparent border rounded-md border-input  w-full h-full overflow-hidden  flex flex-col justify-end items-start">
          <BorderBeam size={250} duration={12} delay={7} />
          <div className=" w-full h-full flex flex-col  items-center justify-center gap-4 ">
            <Image
              src="/icons/logo.svg"
              alt="logo"
              width={40}
              height={40}
              className="flex-shrink-0 w-[32px] h-[32px] md:w-[40px] md:h-[40px]"
            />
            <div className="flex flex-col gap-y-2 items-center justify-center">
              <p className="text-md text-center md:text-lg  text-slate-950 dark:text-slate-200 font-semibold group-hover:primary-color ease-in-out duration-300">
                {category}
              </p>
              <span className="text-[11px] text-slate-800 dark:text-slate-400">
                {courses > 0 ? (
                  <div className="flex items-center gap-x-1">
                    <span className="primary-color font-bold text-md md:text-lg">
                      {courses}
                    </span>
                    <span>courses</span>
                  </div>
                ) : (
                  <Ban
                    size={24}
                    className="text-slate-800 dark:text-slate-300"
                  />
                )}
              </span>
            </div>
          </div>

          {/* Meaty part - Meteor effect */}
          {/* <Meteors number={20} /> */}
        </div>
      </div>
    </FramerMotion>
  );
};

export default Category;
