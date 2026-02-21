"use client";
import { useTheme } from "@/contexts/ThemeProvider";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import React from "react";

const ClerkUserButton = () => {
  const { mode } = useTheme();
  
  return (
    <UserButton
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
    </UserButton>
  );
};

export default ClerkUserButton;
