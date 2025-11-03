"use client";
import { usePageLoader } from "@/contexts/PageLoaderProvider";
import React, { ReactNode } from "react";

const InitialScreen = ({ children }: { children: ReactNode }) => {
  const { isLoading } = usePageLoader();
  return (
    <div className={isLoading ? "blur-md  overflow-hidden" : ""}>
      {children}
    </div>
  );
};

export default InitialScreen;
