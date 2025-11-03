import { LeftSideBar } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const Loading = () => {
  return (
    <div className="flex">
      <LeftSideBar />

      <div className="p-6 flex flex-1 flex-col gap-4">
        <Skeleton className="h-[60px] w-full" />
        <Skeleton className="h-[40px] w-full" />
        <Skeleton className="w-full h-full " />
      </div>
    </div>
  );
};

export default Loading;
