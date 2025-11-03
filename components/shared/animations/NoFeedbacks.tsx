"use client";
import React from "react";
import Lottie from "lottie-react";
import NoFeedbacksAnimation from "@/public/assets/no-feedbacks.json";

const NoFeedbacks = ({ className }: { className?: string }) => {
  return (
    <div className={`w-full ${className ? className : "h-[200px]"}`}>
      <Lottie animationData={NoFeedbacksAnimation} className="w-full h-full" />
    </div>
  );
};

export default NoFeedbacks;
