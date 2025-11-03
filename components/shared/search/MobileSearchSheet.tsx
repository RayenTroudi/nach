"use client";
import React from "react";

import Image from "next/image";
import MobileSearch from "./MobileSearch";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const MobileSearchSheet = () => {
  return (
    <div className="flex-shrink-0 w-[20px] h-[20px]  md:w-[30px] md:h-[30px] md:hidden ">
      <Popover>
        <PopoverTrigger asChild className="">
          <Image
            src="/icons/search.svg"
            alt="search"
            width={30}
            height={30}
            className="cursor-pointer"
          />
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 mt-6 mr-2">
          <MobileSearch view="mobile" />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MobileSearchSheet;
