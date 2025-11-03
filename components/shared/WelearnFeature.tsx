"use client";
import React, { ReactNode } from "react";
import SparklesText from "../magicui/sparkles-text";

type Props = {
  title: string;
  children: ReactNode;
};

const WelearnFeature = ({ title, children }: Props) => {
  return (
    <div className="w-[90%] md:w-[80%] h-full mx-auto flex flex-col gap-y-4 py-6 relative">
      <SparklesText
        text={title}
        className="text-center text-7xl md:text-8xl"
        colors={{
          first: "#9333ea",
          second: "#f97316",
        }}
      />
      {children}
    </div>
  );
};

export default WelearnFeature;
