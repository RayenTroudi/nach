"use client";
import { useTheme } from "@/contexts/ThemeProvider";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

interface Props {
  icon: LucideIcon;
  labelKey: string;
  href: string;
}

const SideBarItem = ({ icon: Icon, labelKey, href }: Props) => {
  const t = useTranslations();
  const locale = useLocale();
  const { mode } = useTheme();
  const pathname = usePathname();
  
  // Check if the href already includes a locale
  const hasLocale = href.startsWith('/ar/') || href.startsWith('/en/') || href.startsWith('/de/');
  
  // If current pathname includes locale but href doesn't, prepend locale
  const pathnameHasLocale = pathname.startsWith('/ar/') || pathname.startsWith('/en/') || pathname.startsWith('/de/');
  const finalHref = pathnameHasLocale && !hasLocale ? `/${locale}${href}` : href;
  
  // Only match exact path to prevent multiple items being active
  const isActive = pathname === finalHref;

  return (
    <Link
      href={finalHref}
      className={`group w-full px-2 py-6 rounded-sm flex items-center justify-center lg:justify-start gap-4 h-[30px] hover:bg-brand-red-500 duration-300 ease-in-out ${
        isActive ? "bg-brand-red-500" : ""
      }`}
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
        className={`text-[15px] text-slate-950 dark:text-slate-200 font-semibold group-hover:text-slate-200 hidden lg:block ${
          isActive ? "!text-slate-200" : ""
        }`}
      >
        {t(labelKey)}
      </p>
    </Link>
  );
};

export default SideBarItem;
