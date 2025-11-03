import React from "react";

const Seperator = ({ className }: { className?: string }) => {
  return (
    <span className={`w-[1px] h-full absolute bg-[#3333] ${className}`}></span>
  );
};

export default Seperator;
