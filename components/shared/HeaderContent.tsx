"use client";
import { usePathname } from "next/navigation";
import React from "react";

const HeaderContent = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isTeacher = pathname?.startsWith("/teacher");
  const isSection = pathname?.includes("/section");
  const isAdmin = pathname?.includes("/admin");
  return <>{isTeacher || isSection || isAdmin ? null : children}</>;
};

export default HeaderContent;
