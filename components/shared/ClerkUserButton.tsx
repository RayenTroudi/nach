"use client";
import { useTheme } from "@/contexts/ThemeProvider";

import { dark } from "@clerk/themes";
import React from "react";
import { Skeleton } from "../ui/skeleton";
import dynamic from "next/dynamic";

const DynamicUserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.UserButton),
  {
    loading: () => (
      <Skeleton className="w-[32px] h-[32px] rounded-full bg-red-500" />
    ),
  }
);

const ClerkUserButton = () => {
  const { mode } = useTheme();
  return (
    <DynamicUserButton
      afterSignOutUrl="/"
      appearance={{
        baseTheme: mode === "dark" ? dark : undefined,

        variables: {
          colorPrimary: "#DD0000",

          colorBackground: mode === "dark" ? "#0f172a" : "#f8fafc",
        },
      }}
    ></DynamicUserButton>
  );
};

export default ClerkUserButton;
