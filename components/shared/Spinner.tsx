import { Loader2 } from "lucide-react";
import React from "react";

const Spinner = ({
  size = 20,
  className,
}: {
  size?: number;
  className?: string;
}) => {
  return (
    <Loader2
      size={size}
      className={`animate-spin ${!className ? "text-[#FF782D]" : className}`}
    />
  );
};

export default Spinner;
