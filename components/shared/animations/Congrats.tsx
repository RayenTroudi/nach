"use client";
import React from "react";
import Lottie from "lottie-react";
import CongratsAnimation from "@/public/assets/congrats.json";

const Congrats = ({ className }: { className?: string }) => {
  return (
    <div className={`w-full ${className ? className : "h-[200px]"}`}>
      <Lottie animationData={CongratsAnimation} className="w-full h-full" />
    </div>
  );
};

export default Congrats;
