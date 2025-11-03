"use client";
import React from "react";
import Lottie from "lottie-react";
import NoCoursesAnimationData from "@/public/assets/no-courses-animation.json";

const NoCoursesAnimation = ({ className }: { className?: string }) => {
  return (
    <div className={`w-full ${className ? className : "h-[300px]"}`}>
      <Lottie
        animationData={NoCoursesAnimationData}
        className="w-full h-full"
      />
    </div>
  );
};

export default NoCoursesAnimation;
