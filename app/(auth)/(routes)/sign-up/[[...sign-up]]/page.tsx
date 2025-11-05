"use client";
import { useTheme } from "@/contexts/ThemeProvider";
import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import React from "react";

const SignUpPage = () => {
  const { mode } = useTheme();
  return (
    <SignUp
      appearance={{
        baseTheme: mode === "dark" ? dark : undefined,

        variables: {
          colorPrimary: "#DD0000",

          colorBackground: mode === "dark" ? "#0f172a" : "#f8fafc",
        },
      }}
      redirectUrl="/"
      signInUrl="/sign-in"
    />
  );
};

export default SignUpPage;
