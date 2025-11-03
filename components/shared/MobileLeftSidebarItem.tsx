"use client";
import { useTheme } from "@/contexts/ThemeProvider";
import { IconProps } from "@radix-ui/react-icons/dist/types";
import { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { ForwardRefExoticComponent, RefAttributes } from "react";
interface Props {
  icon: LucideIcon;
  label: string;
  href: string;
}

const MobileLeftSidebarItem = ({ icon: Icon, label, href }: Props) => {
  const pathname = usePathname();
  const { mode } = useTheme();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`group w-full px-2 py-6 rounded-sm flex items-center justify-start gap-4 h-[30px] hover:bg-[#FF782D] duration-300 ease-in-out ${
        pathname === href || pathname.startsWith(`${href}/`)
          ? "bg-[#FF782D]"
          : ""
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
          pathname === href || pathname.startsWith(`${href}/`)
            ? "text-slate-200"
            : ""
        }`}
      >
        {label}
      </p>
    </Link>
  );
};

export default MobileLeftSidebarItem;
