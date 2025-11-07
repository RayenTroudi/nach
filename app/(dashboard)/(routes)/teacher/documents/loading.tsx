import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const Loading = () => {
  return (
    <div className="flex flex-col gap-4 items-start w-full p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between py-2 border-b border-input w-full">
        <div className="flex flex-col gap-2">
          <Skeleton className="w-[200px] h-[36px]" />
          <Skeleton className="w-[300px] h-[20px]" />
        </div>
        <Skeleton className="w-[180px] h-[40px]" />
      </div>

      {/* Filters Section */}
      <div className="w-full p-4 border rounded-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <Skeleton className="flex-1 h-[40px]" />
          <Skeleton className="w-full md:w-[200px] h-[40px]" />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid gap-4 w-full">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="w-full p-6 border rounded-lg shadow-sm"
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
              
              <div className="flex-1 min-w-0">
                {/* Title and Actions */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <Skeleton className="w-3/4 h-[24px] mb-2" />
                    <Skeleton className="w-full h-[16px]" />
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Skeleton className="w-[32px] h-[32px] rounded" />
                    <Skeleton className="w-[32px] h-[32px] rounded" />
                  </div>
                </div>

                {/* Tags and Metadata */}
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <Skeleton className="w-[80px] h-[20px] rounded-full" />
                  <Skeleton className="w-[60px] h-[20px] rounded-full" />
                  <Skeleton className="w-[60px] h-[20px] rounded-full" />
                  <div className="ml-auto flex items-center gap-4">
                    <Skeleton className="w-[100px] h-[16px]" />
                    <Skeleton className="w-[80px] h-[16px]" />
                    <Skeleton className="w-[60px] h-[20px] rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loading;
