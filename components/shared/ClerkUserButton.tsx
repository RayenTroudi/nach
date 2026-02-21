"use client";
import { useTheme } from "@/contexts/ThemeProvider";

import { dark } from "@clerk/themes";
import React, { useState, useEffect } from "react";
import { Skeleton } from "../ui/skeleton";
import dynamic from "next/dynamic";

const DynamicUserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.UserButton),
  {
    loading: () => (
      <Skeleton className="w-[32px] h-[32px] rounded-full" />
    ),
    ssr: false, // Disable SSR for UserButton to prevent hydration issues
  }
);

interface ClerkUserButtonProps {
  serverUserId?: string | null;
}

const ClerkUserButton = ({ serverUserId }: ClerkUserButtonProps) => {
  const { mode } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Only render if server confirms user is authenticated
  if (!serverUserId) {
    return null;
  }
  
  // Show skeleton during server render and initial client render to prevent hydration mismatch
  if (!isMounted) {
    return <Skeleton className="w-[32px] h-[32px] rounded-full" />;
  }
  
  return (
    <DynamicUserButton
      afterSignOutUrl="/"
      showName={false}
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
          userButtonPopoverCard: {
            pointerEvents: "auto"
          },
          userButtonPopoverActions: {
            pointerEvents: "auto"
          }
        },
      }}
    >
      {/* UserButton.MenuItems is used to add custom menu items */}
      {/* UserButton.UserProfilePage is used to add custom user profile pages */}
      {/* UserButton.UserProfileLink is used to add custom links in the user button */}
    </DynamicUserButton>
  );
};

export default ClerkUserButton;
