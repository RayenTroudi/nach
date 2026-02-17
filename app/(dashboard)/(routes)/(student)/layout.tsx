"use client";

import { Footer } from "@/components/shared";
import { usePathname } from "next/navigation";
import React from "react";

const StudentLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  
  // Don't show footer on chat-rooms page
  const shouldShowFooter = !pathname?.includes("/chat-rooms");
  
  return (
    <>
      {children}
      {shouldShowFooter && <Footer />}
    </>
  );
};

export default StudentLayout;
