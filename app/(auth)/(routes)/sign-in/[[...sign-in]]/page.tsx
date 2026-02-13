"use client";
import { useTheme } from "@/contexts/ThemeProvider";
import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";

const SigninPage = () => {
  const { mode } = useTheme();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string>("/");
  const [hasTicket, setHasTicket] = useState(false);

  // Fix hydration error by only running client-side logic after mount
  useEffect(() => {
    setMounted(true);
    
    // Check if there's a ticket (for password reset)
    const ticket = searchParams?.get("__clerk_ticket");
    if (ticket) {
      setHasTicket(true);
      return; // Don't process other redirects if there's a ticket
    }
    
    // Check if there's saved form data to redirect back to resume page
    const savedFormData = localStorage.getItem("resumeFormData");
    if (savedFormData) {
      setRedirectUrl("/contact/resume");
    }
    
    // Or check if redirect URL is in query params
    const redirect = searchParams?.get("redirect") || searchParams?.get("redirect_url");
    if (redirect) {
      setRedirectUrl(redirect);
    }
  }, [searchParams]);

  if (!mounted) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen p-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center min-h-screen p-4">
      {/* Show loading overlay when processing ticket */}
      {hasTicket && (
        <div className="fixed inset-0 bg-white/90 dark:bg-slate-900/90 z-50 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red-500"></div>
            <p className="text-slate-600 dark:text-slate-400 text-center">
              {locale === "ar" 
                ? "جارٍ التحقق من رابط إعادة تعيين كلمة المرور..."
                : locale === "de"
                ? "Link zum Zurücksetzen des Passworts wird überprüft..."
                : "Verifying password reset link..."}
            </p>
          </div>
        </div>
      )}
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red-500"></div>
        </div>
      }>
        <div className="w-full max-w-md mx-auto">
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
                card: "shadow-lg w-full mx-auto !p-6",
                formButtonPrimary:
                  "bg-brand-red-500 hover:bg-brand-red-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 !w-full !block !text-center !mt-4 text-sm",
                formFieldInput:
                  "border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-brand-red-500 focus:border-brand-red-500 !w-full text-sm",
                "formFieldInput__signOutOfOtherSessions":
                  "!w-4 !h-4 !px-0 !py-0 !min-w-[1rem] !min-h-[1rem] cursor-pointer accent-brand-red-500",
                "formFieldLabel__signOutOfOtherSessions":
                  "text-slate-700 dark:text-slate-300 font-normal text-sm !mb-0 cursor-pointer",
                "formFieldLabelRow__signOutOfOtherSessions":
                  "!flex !flex-row !items-center !gap-2 !mb-3",
                "formFieldRow__signOutOfOtherSessions":
                  "!flex !flex-row !items-center !gap-2 !mb-3",
                formFieldInputShowPasswordButton:
                  "[html[dir='rtl']_&]:!left-3 [html[dir='rtl']_&]:!right-auto [html[dir='ltr']_&]:!right-3 [html[dir='ltr']_&]:!left-auto !text-slate-600 dark:!text-slate-400 hover:!text-slate-900 dark:hover:!text-slate-200",
                formFieldLabel:
                  "text-slate-700 dark:text-slate-300 font-medium mb-1.5 block text-sm",
                formFieldRow: "!mb-3",
                footerActionLink: "text-brand-red-500 hover:text-brand-red-600 text-sm",
                identityPreview: "border-2 border-slate-300 dark:border-slate-600",
                formResendCodeLink: "text-brand-red-500 hover:text-brand-red-600 text-sm",
                headerTitle: "text-xl font-bold text-slate-900 dark:text-slate-100 !mb-2",
                headerSubtitle: "text-sm text-slate-600 dark:text-slate-400 !mb-4",
                formHeaderTitle: "text-xl font-bold text-slate-900 dark:text-slate-100 !mb-2",
                formHeaderSubtitle: "text-sm text-slate-600 dark:text-slate-400 !mb-4",
                footer: "!mt-4",
                footerAction: "!mt-3",
                footerActionText: "text-sm text-slate-600 dark:text-slate-400",
                formFieldErrorText: "text-xs text-red-600 dark:text-red-400 !mt-1",
                formFieldSuccessText: "text-xs text-green-600 dark:text-green-400 !mt-1",
                formFieldHintText: "text-xs text-slate-500 dark:text-slate-400 !mt-1",
                // Hide Clerk's built-in forgot password link (we have a custom one)
                formFieldAction: "!hidden",
                formFieldLabelRow: "!justify-start",
                // Social buttons for OAuth
                socialButtonsBlockButton:
                  "!border-2 !border-slate-300 dark:!border-slate-600 hover:!bg-slate-50 dark:hover:!bg-slate-800 !text-slate-900 dark:!text-slate-100",
                socialButtonsBlockButtonText: "!font-medium",
                // OTP/Verification code inputs - Force LTR and ensure visibility
                otpCodeFieldInput: 
                  "!appearance-none !border-2 !border-slate-300 dark:!border-slate-600 focus:!border-brand-red-500 !bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-slate-100 !w-12 !h-12 !min-w-[3rem] !min-h-[3rem] !text-xl !font-bold !text-center [direction:ltr] !inline-block !visible !opacity-100 !rounded-lg !mx-1",
                otpCodeFieldInputs:
                  "!flex !flex-row !justify-center !items-center !gap-2 [direction:ltr] !visible !opacity-100 !my-4",
                otpCodeFieldErrorText: "!text-red-500 !mt-2",
                // Verification/Reset password specific elements
                verificationCodeForm: "!block !visible !opacity-100 !w-full",
                verificationCodeField: "!block !visible !opacity-100 !w-full",
                verificationCodeFieldInput: "!block !visible !opacity-100 !w-full",
                alternativeMethodsBlockButton: "!text-brand-red-500 hover:!text-brand-red-600",
              },
            }}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            redirectUrl={redirectUrl}
          />
          
          {/* Custom Forgot Password Link */}
          <div className="mt-4 text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-brand-red-500 hover:text-brand-red-600 font-medium"
            >
              {locale === "ar" ? "نسيت كلمة المرور؟" : locale === "de" ? "Passwort vergessen?" : "Forgot password?"}
            </Link>
          </div>
        </div>
      </Suspense>
    </div>
  );
};

export default SigninPage;
