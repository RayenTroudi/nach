"use client";
import { useTheme } from "@/contexts/ThemeProvider";
import { useLocale } from "next-intl";
import { getClerkLocalization } from "@/lib/clerk-localizations";

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
  const locale = useLocale();
  const clerkLocalization = getClerkLocalization(locale);
  
  return (
    <DynamicUserButton
      afterSignOutUrl="/"
      localization={clerkLocalization as any}
      appearance={{
        baseTheme: mode === "dark" ? dark : undefined,

        variables: {
          colorPrimary: "#DD0000",

          colorBackground: mode === "dark" ? "#0f172a" : "#f8fafc",
        },
        elements: {
          badge: {
            display: "none",
          },
          userButtonBox: {
            "& .cl-badge": {
              display: "none !important",
            },
          },
          avatarBox: {
            "& .cl-badge": {
              display: "none !important",
            },
          },
        },
      }}
    ></DynamicUserButton>
  );
};

export default ClerkUserButton;
