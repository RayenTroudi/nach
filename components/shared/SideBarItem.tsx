"use client";
import { useTheme } from "@/contexts/ThemeProvider";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

interface Props {
  icon: LucideIcon;
  labelKey: string;
  href: string;
}

const SideBarItem = ({ icon: Icon, labelKey, href }: Props) => {
  const t = useTranslations();
  const { mode } = useTheme();
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
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
