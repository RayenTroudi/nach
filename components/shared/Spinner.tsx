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
      className={`animate-spin ${!className ? "text-brand-red-500" : className}`}
    />
  );
};

export default Spinner;
