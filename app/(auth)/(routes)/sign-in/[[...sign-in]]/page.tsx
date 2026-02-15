"use client";
import { useTheme } from "@/contexts/ThemeProvider";
import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import React from "react";
import { getClerkLocalization } from "@/lib/clerk-localizations";

function SignInContent() {
  const { mode } = useTheme();
  const locale = useLocale();
  const t = useTranslations("auth");
  const direction = locale === "ar" ? "rtl" : "ltr";

  // Get Clerk localization for current locale
  const clerkLocalization = getClerkLocalization(locale);

  return (
    <div className="w-full flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md mx-auto" dir={direction}>
        <SignIn
          localization={clerkLocalization}
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
          redirectUrl="/"
          afterSignInUrl="/"
        />
        
        {/* Custom Forgot Password Link */}
        <div className="mt-6 text-center">
          <Link
            href="/forgot-password"
            className="text-brand-red-500 hover:text-brand-red-600 font-medium text-sm transition-colors duration-200"
          >
            {t("forgotPassword")}
          </Link>
        </div>
      </div>
    </div>
  );
}

const SigninPage = () => {
  return <SignInContent />;
};

export default SigninPage;
