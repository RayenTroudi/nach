"use client";
import React from "react";
import Lottie from "lottie-react";
import NoQuestionsAnimationData from "@/public/assets/no-questions-animation.json";

const NoQuestions = ({ className }: { className?: string }) => {
  return (
    <div className={`w-full ${className ? className : "h-[200px]"}`}>
      <Lottie
        animationData={NoQuestionsAnimationData}
        className="w-full h-full"
      />
    </div>
  );
};

export default NoQuestions;
