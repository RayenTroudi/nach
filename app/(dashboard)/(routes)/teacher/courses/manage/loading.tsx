import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const Loading = () => {
  return (
    <div className="flex flex-col gap-y-4 w-full">
      <Skeleton className="w-full h-[100px]" />
      <div className="flex flex-col gap-y-2 w-full lg:w-[1000px] lg:mx-auto">
        <Skeleton className="w-full h-[80px]" />
        <Skeleton className="w-full h-[80px]" />
        <Skeleton className="w-full h-[80px]" />
      </div>
    </div>
  );
};

export default Loading;
