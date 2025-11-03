import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { PlusCircle } from "lucide-react";
import React from "react";

const Loading = () => {
  return (
    <div className="flex flex-col gap-4 items-start w-full p-6">
      <div className="flex items-center  justify-between py-2 border-b border-input w-full">
        <Skeleton className="w-full h-[50px] " />
      </div>

      <div className="w-full flex flex-col gap-2 items-start md:items-center md:justify-between md:gap-4 md:flex-row">
        <Skeleton className="w-full md:flex-1 h-[43px]" />
        <Skeleton className="w-full md:w-[180px] h-[43px]" />
      </div>

      <div className="flex flex-wrap gap-y-2 w-full h-[220px]  ">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton
            key={i}
            className="w-full md:w-[350px] lg:w-full h-[350px] lg:h-full shadow-md lg:shadow-none rounded-md"
          />
        ))}
      </div>
    </div>
  );
};

export default Loading;
