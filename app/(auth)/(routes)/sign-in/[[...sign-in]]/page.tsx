"use client";
import { useTheme } from "@/contexts/ThemeProvider";
import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import React, { Suspense } from "react";

const SigninPage = () => {
  const { mode } = useTheme();
  return (
    <div className="w-full flex items-center justify-center min-h-[600px] p-4">
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red-500"></div>
        </div>
      }>
        <SignIn
          appearance={{
            baseTheme: mode === "dark" ? dark : undefined,
            variables: {
              colorPrimary: "#DD0000",
              colorBackground: mode === "dark" ? "#0f172a" : "#ffffff",
              colorText: mode === "dark" ? "#f1f5f9" : "#0f172a",
              colorInputBackground: mode === "dark" ? "#1e293b" : "#ffffff",
              colorInputText: mode === "dark" ? "#f1f5f9" : "#0f172a",
              borderRadius: "0.5rem",
            },
            elements: {
              rootBox: "w-full",
              card: "shadow-lg w-full max-w-md mx-auto",
              formButtonPrimary:
                "bg-brand-red-500 hover:bg-brand-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200",
              formFieldInput:
                "border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 py-3 rounded-lg focus:ring-2 focus:ring-brand-red-500 focus:border-brand-red-500",
              formFieldLabel:
                "text-slate-700 dark:text-slate-300 font-medium mb-2 block",
              footerActionLink: "text-brand-red-500 hover:text-brand-red-600",
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
        />
      </Suspense>
    </div>
  );
};

export default SigninPage;
