import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircleIcon, XCircle } from "lucide-react";
import React from "react";

const Loading = () => {
  return (
    <div className="w-full flex flex-col">
      <div className="w-full border-b border-input flex items-center justify-between flex-row gap-y-0 p-4 mb-2 shadow-sm ">
        <h2 className="text-xl font-bold flex items-center gap-x-2 ">
          <Skeleton className="w-[150px] h-[60px] rounded-md" />
          <Skeleton className="w-[100px] h-[20px] rounded-md hidden md:block " />
          <Skeleton className="w-[100px] h-[20px] rounded-md hidden lg:block" />
        </h2>

        <div className="flex items-center gap-x-2">
          <Skeleton className="w-[60px] lg:w-[200px] h-[40px] flex" />
          <Skeleton className="w-[60px] lg:w-[200px] h-[40px] flex" />
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-2">
        <div
          className={`w-full  relative aspect-video flex-1 max-h-[480px]   `}
        >
          <Skeleton className="w-full h-full " />
        </div>
        <Skeleton className="w-full lg:w-96 flex flex-col gap-2 ">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-[50px]" />
          ))}
        </Skeleton>
      </div>
    </div>
  );
};

export default Loading;
