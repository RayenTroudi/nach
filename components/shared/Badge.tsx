import React from "react";

interface Props {
  text?: string;
  className?: string;
}

const Badge = ({ text, className }: Props) => {
  if (!text) return null;
  
  return (
    <div
      className={`absolute top-2 left-2 min-w-[100px] px-3 py-2 h-[35px] flex items-center justify-center font-semibold rounded-md bg-brand-red-500 text-white text-[14px] shadow-lg z-10 ${className}`}
    >
      {text}
    </div>
  );
};

export default Badge;
