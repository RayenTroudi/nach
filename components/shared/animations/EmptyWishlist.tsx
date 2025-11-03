"use client";
import React from "react";
import Lottie from "lottie-react";
import emptyWishList from "@/public/assets/emptyWishList.json";

const EmptyWishList = ({ className }: { className?: string }) => {
  return (
    <div className={`w-full ${className ? className : "h-[300px]"}`}>
      <Lottie animationData={emptyWishList} className="w-full h-full" />
    </div>
  );
};

export default EmptyWishList;
