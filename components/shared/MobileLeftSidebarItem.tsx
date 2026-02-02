"use client";
import { useTheme } from "@/contexts/ThemeProvider";
import { IconProps } from "@radix-ui/react-icons/dist/types";
import { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { ForwardRefExoticComponent, RefAttributes } from "react";
import { useTranslations, useLocale } from "next-intl";

interface Props {
  icon: LucideIcon;
  labelKey: string;
  href: string;
}

const MobileLeftSidebarItem = ({ icon: Icon, labelKey, href }: Props) => {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const { mode } = useTheme();
  
  // Check if the href already includes a locale
  const hasLocale = href.startsWith('/ar/') || href.startsWith('/en/') || href.startsWith('/de/');
  
  // If current pathname includes locale but href doesn't, prepend locale
  const pathnameHasLocale = pathname.startsWith('/ar/') || pathname.startsWith('/en/') || pathname.startsWith('/de/');
  const finalHref = pathnameHasLocale && !hasLocale ? `/${locale}${href}` : href;
  
  const isActive = pathname === finalHref || pathname.startsWith(`${finalHref}/`);

  return (
    <Link
      href={finalHref}
      className={`group w-full px-2 py-6 rounded-sm flex items-center justify-start gap-4 h-[30px] hover:bg-brand-red-500 duration-300 ease-in-out ${
        isActive ? "bg-brand-red-500" : ""
      }`}
      onMouseEnter={() => console.log("Hovered")}
    >
      <Icon
        size={20}
        className={`${
          mode === "dark"
            ? "text-slate-50"
            : isActive
            ? "text-slate-50"
            : "text-slate-950"
        }
          group-hover:text-slate-50
        `}
      />
      <p
        className={`text-[15px] text-950 dark:text-slate-200 font-semibold group-hover:text-white block ${
          isActive ? "text-slate-200" : ""
        }`}
      >
        {t(labelKey)}
      </p>
    </Link>
  );
};

export default MobileLeftSidebarItem;
