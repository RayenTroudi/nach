import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const Loading = () => {
  return (
    <div className="w-full ">
      <div className="w-full md:w-[800px] lg:w-[1200px] mx-auto p-4 flex flex-col gap-y-6">
        <div className="w-full flex justify-between items-center">
          <div className="w-full md:w-1/2 flex flex-col gap-y-2 md:flex-row gap-x-2 md:items-center">
            <Skeleton className="w-full md:w-[80px] h-[130px] md:h-[80px] rounded-lg border border-input" />

            <div className="pl-2 md:pl-0 h-full flex flex-col gap-y-3 justify-between ">
              <p className="text-slate-700 dark:text-slate-200 text-lg font-bold">
                <Skeleton className="w-full md:w-[100px] lg:w-[200px] h-[30px] " />
              </p>
              <span className="text-md font-semibold text-slate-500 dark:text-slate-400">
                <Skeleton className="w-full md:w-[100px] lg:w-[200px] h-[30px] " />
              </span>
              <div className="flex md:hidden h-full  flex-col gap-y-2 sm:gap-y-0 sm:flex-row sm:items-center sm:gap-x-2">
                <p className="text-md font-semibold flex items-center gap-x-2 text-slate-400 dark:text-slate-500 capitalize">
                  <Skeleton className="w-5 h-5 rounded-full " />
                  <Skeleton className="w-[100px] lg:w-[200px] h-5 " />
                </p>

                <p className="text-md font-semibold flex items-center gap-x-2 text-slate-400 dark:text-slate-500 capitalize">
                  <Skeleton className="w-5 h-5 rounded-full " />
                  <Skeleton className="w-[100px] lg:w-[200px] h-5 " />
                </p>
              </div>
            </div>
          </div>
          <div className="w-full flex-1 hidden md:flex h-full flex-col gap-y-2 md:items-end">
            <p className="text-md font-semibold flex items-center gap-x-2 text-slate-400 dark:text-slate-500 capitalize">
              <Skeleton className="w-5 h-5 rounded-full " />
              <Skeleton className="w-[100px] lg:w-[200px] h-5 " />
            </p>

            <p className="text-md font-semibold flex items-center gap-x-2 text-slate-400 dark:text-slate-500 capitalize">
              <Skeleton className="w-5 h-5 rounded-full " />
              <Skeleton className="w-[100px] lg:w-[200px] h-5 " />
            </p>
          </div>
        </div>
        <div className="w-full p-2  border-t flex flex-col gap-y-4 items-center justify-center">
          <h1 className="text-lg md:text-2xl lg:text-4xl font-bold uppercase text-center  text-slate-950 dark:text-slate-50 mt-5">
            Let&apos;s go and try to solve the quiz on your own
          </h1>
          <p className="text-sm md:text-md lg:text-lg font-semibold text-center text-slate-700 dark:text-slate-300">
            You have <Skeleton className="w-5 h-5 rounded-full inline-flex " />{" "}
            minutes to solve the quiz, it contains{" "}
            <Skeleton className="w-5 h-5 rounded-full inline-flex " />{" "}
            questions.
          </p>

          <span className="w-full md:w-1/2 mx-auto text-xs md:text-sm lg:text-md font-normal text-center text-slate-500 dark:text-slate-400">
            Solving all the course quizzes will help you to better understand
            the course, also without solving them you can&apos;t get your
            certificate
          </span>
          <div className="w-full md:w-1/2 mx-auto mt-8 flex flex-col gap-y-4">
            <Button className="pointer-events-none w-full  uppercase font-bold text-slate-50 bg-[#FF782D] hover:bg-[#FF782D] opacity-90 hover:opacity-100 transition-all duration-300 ease-in-out">
              {" "}
              Start Solving{" "}
            </Button>
            <Button className="w-full pointer-events-none uppercase font-bold transition-all duration-300 ease-in-out">
              {" "}
              Go Back{" "}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
