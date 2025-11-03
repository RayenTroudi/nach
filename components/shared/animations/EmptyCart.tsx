"use client";
import React from "react";
import Lottie from "lottie-react";
import EmptyShoppingCartAnimation from "@/public/assets/empty-shopping-cart.json";

const EmptyCartAnimation = ({ className }: { className?: string }) => {
  return (
    <div className={`w-full ${className ? className : "h-[300px]"}`}>
      <Lottie
        animationData={EmptyShoppingCartAnimation}
        className="w-full h-full"
      />
    </div>
  );
};

export default EmptyCartAnimation;
