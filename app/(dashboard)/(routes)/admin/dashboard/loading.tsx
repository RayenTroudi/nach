import { LeftSideBar } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { PlusCircle } from "lucide-react";
import React from "react";

const Loading = () => {
  return (
    <div className="flex">
      <LeftSideBar />
      <div className="p-6 flex flex-1 flex-col gap-4">
        <h1 className="text-3xl text-slate-800 font-bold">Pending Courses</h1>
        <Skeleton className="w-full h-[43px]" />

        <div className="flex flex-wrap gap-y-2 w-full h-[220px]  ">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton
              key={i}
              className="w-full md:w-[350px] lg:w-full h-[350px] lg:h-full shadow-md lg:shadow-none rounded-md"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Loading;
