"use client";
import { useTheme } from "@/contexts/ThemeProvider";
import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";

const SignUpPage = () => {
  const { mode } = useTheme();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string>("/");
  const direction = locale === "ar" ? "rtl" : "ltr";

  // Fix hydration error by only running client-side logic after mount
  useEffect(() => {
    setMounted(true);
    
    // Check if there's saved form data to redirect back to resume page
    const savedFormData = localStorage.getItem("resumeFormData");
    if (savedFormData) {
      setRedirectUrl("/contact/resume");
    }
    
    // Or check if redirect URL is in query params
    const redirect = searchParams?.get("redirect");
    if (redirect) {
      setRedirectUrl(redirect);
    }
  }, [searchParams]);

  if (!mounted) {
    return (
      <div className="w-full flex items-center justify-center min-h-[600px] p-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center min-h-[600px] p-4" dir={direction}>
      <SignUp
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
              "bg-brand-red-500 hover:bg-brand-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 !w-full !block !text-center !mt-6",
            formFieldInput:
              "border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 py-3 rounded-lg focus:ring-2 focus:ring-brand-red-500 focus:border-brand-red-500 !w-full",
            formFieldInputShowPasswordButton:
              "[html[dir='rtl']_&]:!left-3 [html[dir='rtl']_&]:!right-auto [html[dir='ltr']_&]:!right-3 [html[dir='ltr']_&]:!left-auto !text-slate-600 dark:!text-slate-400 hover:!text-slate-900 dark:hover:!text-slate-200",
            formFieldLabel:
              "text-slate-700 dark:text-slate-300 font-medium mb-2 block",
            formFieldRow: "!mb-4",
            footerActionLink: "text-brand-red-500 hover:text-brand-red-600",
            // Social buttons for OAuth
            socialButtonsBlockButton:
              "!border-2 !border-slate-300 dark:!border-slate-600 hover:!bg-slate-50 dark:hover:!bg-slate-800 !text-slate-900 dark:!text-slate-100",
            socialButtonsBlockButtonText: "!font-medium",
          },
        }}
        signInUrl="/sign-in"
        routing="path"
        path="/sign-up"
        afterSignUpUrl={redirectUrl}
        redirectUrl={redirectUrl}
      />
    </div>
  );
};

export default SignUpPage;
