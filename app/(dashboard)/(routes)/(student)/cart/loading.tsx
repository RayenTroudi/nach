import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { LeftSideBar } from "@/components/shared";

const Loading = () => {
  return (
    <div className="flex gap-4 w-full">
      <LeftSideBar />
      <div className="flex flex-col lg:flex-row w-full">
        <div className="p-6 w-full">
          <div className="grid grid-cols-1 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-slate-100 p-4 shadow-md mb-2 rounded dark:bg-slate-900"
              >
                <Skeleton className="w-full h-16 rounded-md" />
              </div>
            ))}
          </div>
        </div>
        <div className="lg:w-[40rem] bg-slate-100 dark:bg-slate-900 p-4 shadow-lg rounded w-full">
          <h2 className="text-lg font-bold mb-4 text-slate-950 dark:text-slate-50">
            <Skeleton className="w-32 h-6" />
          </h2>
          <div className="flex justify-between mb-2 text-slate-950 dark:text-slate-50">
            <Skeleton className="w-24 h-5" />
            <Skeleton className="w-24 h-5" />
          </div>
          <Button className="w-full bg-[#FF782D] text-slate-950 dark:text-slate-50 mt-4 opacity-50 cursor-not-allowed">
            Checkout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Loading;
