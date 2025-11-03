import React from "react";

interface Props {
  className?: string;
  children: React.ReactNode;
}

const Container = ({ className = "", children }: Props) => {
  return (
    <div
      className={`w-full md:w-[800px] lg:w-[1300px] mx-auto p-4 ${className} `}
    >
      {children}
    </div>
  );
};

export default Container;
