"use client";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { useTranslations } from "next-intl";

const MobileSignupSignInButtons = () => {
  const t = useTranslations('auth');
  
  return (
    <>
      <Link href="/sign-up" className="w-full">
        <Button 
          name="Sign up"
          className="w-full h-[40px] bg-slate-100 dark:bg-slate-800 text-brand-red-500 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-button"
        >
          {t('signUp')}
        </Button>
      </Link>
      <Link href="/sign-in" className="w-full">
        <Button 
          name="Sign In"
          className="w-full bg-brand-red-500 text-white h-[40px] hover:bg-brand-red-600 shadow-button hover:shadow-button-hover rounded-button"
        >
          {t('signIn')}
        </Button>
      </Link>
    </>
  );
};

export default MobileSignupSignInButtons;
