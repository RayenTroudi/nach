"use client";
import React from "react";
import Lottie from "lottie-react";
import NoResultAnimationData from "@/public/assets/no-result.json";

const NoResult = ({ className }: { className?: string }) => {
  return (
    <div className={`w-full ${className ? className : "h-[200px]"}`}>
      <Lottie animationData={NoResultAnimationData} className="w-full h-full" />
    </div>
  );
};

export default NoResult;
