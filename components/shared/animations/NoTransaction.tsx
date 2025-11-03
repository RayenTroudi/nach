import React from "react";
import Lottie from "lottie-react";
import TransactionAnimationData from "@/public/assets/no-transactions.json";

const NoTransaction = ({ className }: { className?: string }) => {
  return (
    <div className={`w-full ${className ? className : "h-[200px]"}`}>
      <Lottie
        animationData={TransactionAnimationData}
        className="w-full h-full"
      />
    </div>
  );
};

export default NoTransaction;
