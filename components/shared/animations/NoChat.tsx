"use client";
import React from "react";
import Lottie from "lottie-react";
import NoChatAnimationData from "@/public/assets/no-chat.json";

const NoChatAnimation = ({ className }: { className?: string }) => {
  return (
    <div className={`w-full ${className ? className : "h-[300px]"}`}>
      <Lottie animationData={NoChatAnimationData} className="w-full h-full" />
    </div>
  );
};

export default NoChatAnimation;
