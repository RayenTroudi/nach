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
  const isTeacher = pathname?.startsWith("/teacher");
  const isSection = pathname?.includes("/section");
  const isAdmin = pathname?.includes("/admin");
  const isRTL = locale === 'ar';
  
  return (
    <div className={`flex items-center ${isRTL ? 'gap-x-reverse gap-1 flex-row-reverse' : 'gap-1'}`}>
      {isTeacher || isSection || isAdmin ? (
        <div className={`flex items-center ${isRTL ? 'gap-x-reverse gap-x-2 flex-row-reverse' : 'gap-x-2'}`}>
          <Link
            href="/"
            className="text-slate-950 dark:text-slate-200 font-bold text-sm hover:text-brand-red-500 ease-in-out duration-100 whitespace-nowrap"
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
        <div className={`flex items-center ${isRTL ? 'gap-x-reverse gap-x-2 flex-row-reverse' : 'gap-x-2'}`}>
          {isUserAdmin ? (
            <>
              <Link
                href="/admin/dashboard/"
                className="font-bold text-sm text-brand-red-500 ease-in-out duration-100 hidden lg:block whitespace-nowrap"
              >
                {t('admin')}
              </Link>
              <Separator
                orientation="vertical"
                className="h-[20px] hidden lg:block"
              />
              {/* Admins can access instructor features */}
              <Link href="/teacher/courses" className="hidden lg:block">
                <p className="text-slate-950 dark:text-slate-200 font-bold text-[14px] cursor-pointer relative">
                  <span className="primary-color hover:border-b-2 hover:border-brand-red-500 ease-in-out duration-100 whitespace-nowrap">
                    {t('instructor')}
                  </span>
                </p>
              </Link>
              <Separator
                orientation="vertical"
                className="h-[20px] hidden lg:block"
              />
            </>
          ) : null}

          <Link
            href="/my-learning"
            className="text-slate-950 dark:text-slate-200 font-medium text-[14px] cursor-pointer relative hidden md:block whitespace-nowrap"
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
