"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function HeaderAuthButtons() {
  const t = useTranslations('auth');
  
  return (
    <div className="hidden md:flex items-center gap-3">
      <Link href="/sign-up">
        <Button
          name="Sign up"
          className="contrast-100 hover:opacity-90 transition-all duration-300 ease-in-out w-[100px] h-[40px] bg-slate-100 dark:bg-slate-800 text-brand-red-500 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-button"
        >
          {t('signUp')}
        </Button>
      </Link>

      <Link href="/sign-in">
        <Button
          name="Sign In"
          className="contrast-100 hover:opacity-90 transition-all duration-300 ease-in-out bg-brand-red-500 text-white w-[100px] h-[40px] hover:bg-brand-red-600 shadow-button hover:shadow-button-hover rounded-button"
        >
          {t('signIn')}
        </Button>
      </Link>
    </div>
  );
}
