import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircleIcon, XCircle } from "lucide-react";
import React from "react";

const Loading = () => {
  return (
    <div className="w-full flex flex-col">
      <div className="flex flex-col-reverse lg:flex-row gap-2">
        <div
          className={`w-full  relative aspect-video flex-1 max-h-[480px]   `}
        >
          <Skeleton className="w-full h-full rounded-none" />
        </div>
        <Skeleton className="w-full lg:w-96 flex flex-col gap-2 rounded-none p-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton
              key={i}
              className="w-full h-[50px] bg-slate-300 dark:bg-slate-900 rounded-none "
            />
          ))}
        </Skeleton>
      </div>
      <div className="w-full flex flex-col gap-y-2  mt-2">
        <Skeleton className="w-full h-16 rounded-none flex item-center gap-x-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton
              key={i}
              className="w-[150px] h-full bg-slate-300 dark:bg-slate-900 rounded-none "
            />
          ))}
        </Skeleton>
        <Skeleton className="w-full h-[135px] rounded-none " />
      </div>
    </div>
  );
};

export default Loading;
