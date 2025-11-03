"use client";
import React from "react";
import Lottie from "lottie-react";
import QuizEndAnimation from "@/public/assets/end-quiz.json";

const QuizEnd = ({ className }: { className?: string }) => {
  return (
    <div className={`w-full ${className ? className : "h-[200px]"}`}>
      <Lottie animationData={QuizEndAnimation} className="w-full h-full" />
    </div>
  );
};

export default QuizEnd;
