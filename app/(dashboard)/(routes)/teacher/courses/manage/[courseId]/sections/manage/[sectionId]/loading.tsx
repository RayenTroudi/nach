import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const Loading = () => {
  return (
    <>
      <Skeleton className="w-full h-[30px]" />

      <div className="p-6">
        <Skeleton className="w-full h-[100px]" />
        <div className="flex flex-col mt-6 gap-4  w-full lg:w-[800px] mx-auto">
          <div className="grid grid-cols-1 gap-2">
            <Skeleton className="w-full h-[100px]" />
            <Skeleton className="w-full h-[250px]" />
          </div>

          <Skeleton className="w-full h-[100px]" />
          <Skeleton className="w-full h-[100px]" />
          <Skeleton className="w-full h-[100px]" />
        </div>
      </div>
    </>
  );
};

export default Loading;
