import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const SkeletonComponent = () => {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-10 w-10 rounded-full bg-brand-red-500/30" />
    </div>
  );
};

export default SkeletonComponent;
