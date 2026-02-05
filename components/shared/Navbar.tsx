"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { MenuIcon } from "lucide-react";
import MobileSideBar from "./MobileSideBar";
import { dark } from "@clerk/themes";
import { useTheme } from "@/contexts/ThemeProvider";
import ThemeSwitcher from "./ThemeSwitcher";
import { Separator } from "../ui/separator";
import ClerkUserButton from "./ClerkUserButton";
import { useTranslations, useLocale } from 'next-intl';

import { motion } from "framer-motion";

const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

const Navbar = ({ isUserAdmin }: { isUserAdmin: boolean }) => {
  const pathname = usePathname();
  const t = useTranslations('navigation');
  const locale = useLocale();
  
  // Check if current pathname uses locale
  const pathnameHasLocale = pathname.startsWith('/ar/') || pathname.startsWith('/en/') || pathname.startsWith('/de/');
  const getLocalizedHref = (href: string) => {
    const hasLocale = href.startsWith('/ar/') || href.startsWith('/en/') || href.startsWith('/de/');
    return pathnameHasLocale && !hasLocale ? `/${locale}${href}` : href;
  };
  const isTeacher = pathname?.startsWith("/teacher");
  const isSection = pathname?.includes("/section");
  const isAdmin = pathname?.includes("/admin");
  const isRTL = locale === 'ar';
  
  return (
    <div className={`flex items-center ${isRTL ? 'gap-x-reverse gap-2 sm:gap-3 flex-row-reverse' : 'gap-2 sm:gap-3'}`}>
      {isTeacher || isSection || isAdmin ? (
        <div className={`flex items-center ${isRTL ? 'gap-x-reverse gap-x-2 sm:gap-x-3 flex-row-reverse' : 'gap-x-2 sm:gap-x-3'}`}>
          <Link
            href="/"
            className="text-slate-950 dark:text-slate-200 font-bold text-xs sm:text-sm hover:text-brand-red-500 ease-in-out duration-100 whitespace-nowrap touch-manipulation"
          >
            {t('student')}
          </Link>
          <SignedIn>
            <ClerkUserButton />
          </SignedIn>
          <ThemeSwitcher />
          <MobileSideBar isAdmin={isUserAdmin} />
        </div>
      ) : (
        <div className={`flex items-center ${isRTL ? 'gap-x-reverse gap-x-2 sm:gap-x-3 flex-row-reverse' : 'gap-x-2 sm:gap-x-3'}`}>
          {isUserAdmin ? (
            <>
              <Link
                href={getLocalizedHref("/admin/dashboard/")}
                className="font-bold text-xs sm:text-sm text-brand-red-500 ease-in-out duration-100 hidden md:block whitespace-nowrap touch-manipulation"
              >
                {t('admin')}
              </Link>
              <Separator
                orientation="vertical"
                className="h-[18px] sm:h-[20px] hidden md:block"
              />
              {/* Admins can access instructor features */}
              <Link href={getLocalizedHref("/teacher/courses")} className="hidden md:block">
                <p className="text-slate-950 dark:text-slate-200 font-bold text-xs sm:text-sm cursor-pointer relative touch-manipulation">
                  <span className="primary-color hover:border-b-2 hover:border-brand-red-500 ease-in-out duration-100 whitespace-nowrap">
                    {t('instructor')}
                  </span>
                </p>
              </Link>
              <Separator
                orientation="vertical"
                className="h-[18px] sm:h-[20px] hidden md:block"
              />
            </>
          ) : null}

          <Link
            href="/my-learning"
            className="text-slate-950 dark:text-slate-200 font-medium text-xs sm:text-sm cursor-pointer relative hidden sm:block whitespace-nowrap touch-manipulation"
          >
            <span className="hover:primary-color ease-in-out duration-100">
              {t('myLearning')}
            </span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Navbar;
