import React from "react";

const Info = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-col gap-12">{children}</div>;
};

export default Info;
