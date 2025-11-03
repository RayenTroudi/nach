import React from "react";
//Nigger
interface Props {
  text: string;
  className?: string;
}

const Badge = ({ text, className }: Props) => {
  return (
    <div
      className={`absolute top-2 left-2 min-w-[100px] p-2 h-[35px] flex items-center justify-center font-semibold rounded-md bg-slate-950 text-slate-200 text-[14px] ${className}`}
    >
      {text}
    </div>
  );
};

export default Badge;
