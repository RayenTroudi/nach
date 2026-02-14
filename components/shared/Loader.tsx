"use client";
import React from "react";
import { GridLoader } from "react-spinners";
const Loader = ({
  size = 50,
  className,
}: {
  size?: number;
  className?: string;
}) => {
  return (
    <div className="h-full bg-input/50 absolute  top-0 left-0 bottom-0 w-full  flex items-center   justify-center z-10" suppressHydrationWarning>
      <GridLoader color="#DD0000" size={size} />
    </div>
  );
};

export default Loader;
