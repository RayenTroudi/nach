import { Container } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const Loading = () => {
  return (
    <Container>
      <div className="flex flex-col gap-12 md:flex-row justify-center items-start lg:items-center lg:space-x-12 space-y-8 lg:space-y-0 divide-y divide-transparent">
        <div className="w-full md:w-fit flex flex-col items-center justify-center space-y-2">
          <Skeleton className="w-[288px] h-[288px] rounded-full mb-4 md:mb-0" />
          <div className="flex flex-col justify-center items-center space-y-2 w-full">
            <Skeleton className=" w-[288px] h-[40px]" />
            <Skeleton className=" w-[288px] h-[40px]" />
            <Skeleton className=" w-[288px] h-[40px]" />
          </div>
        </div>
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl font-bold text-slate-950 dark:text-slate-200">
            <Skeleton className="w-52 h-8" />
          </h1>
          <p className="text-xl text-slate-500 text-wrap">
            <Skeleton className="w-64 h-8" />
          </p>
          <div>
            <Skeleton className="w-40 h-8" />
          </div>
          <div className="space-y-6">
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-8" />

            <div className="w-full">
              <h3 className="text-lg text-slate-900 dark:text-slate-300">
                <Skeleton className="w-full! h-8 mb-2" />
              </h3>
              <Skeleton className="w-full md:w-full h-8 mb-2" />

              <Skeleton className="w-full h-8 mb-2" />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-10"></div>
      <div className="space-y-10">
        <h2 className="text-3xl font-semibold ">
          <Skeleton className="w-40 h-8" />
        </h2>
        <div className="flex gap-6 flex-wrap ">
          {Array.from({ length: 4 }).map((course, index) => (
            <Skeleton
              key={index}
              className="group relative flex flex-col gap-2 w-full md:w-[340px] h-[500px] border hover:scale-105 rounded-[16px] shadow-sm hover:shadow-md    hover:z-100"
            />
          ))}
        </div>
      </div>
    </Container>
  );
};

export default Loading;
