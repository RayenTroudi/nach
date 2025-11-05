"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Plane } from "lucide-react";

const Logo = ({ isSheetOpen = false }: { isSheetOpen?: boolean }) => {
  const pathname = usePathname();
  const isTeacherView = pathname.startsWith("/teacher");
  const isAdminView = pathname.startsWith("/admin");
  const href = isTeacherView
    ? "/teacher/courses"
    : isAdminView
    ? "/admin/dashboard"
    : "/";
  return (
    <Link href={href} className="flex items-center gap-2 flex-shrink-0">
      {/* New German-themed logo */}
      <div className="relative flex-shrink-0 w-[32px] h-[32px] md:w-[40px] md:h-[40px]">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-red-500 to-brand-red-600 rounded-lg shadow-lg flex items-center justify-center">
          <Plane className="text-white w-4 h-4 md:w-5 md:h-5" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-brand-gold-500 rounded-full border-2 border-white dark:border-slate-950"></div>
      </div>
      <div
        className={`${
          isSheetOpen ? "block" : "hidden md:block "
        } text-slate-950 dark:text-slate-100 font-bold text-[20px] md:text-[22px]`}
      >
        <span className="bg-gradient-to-r from-brand-red-600 to-brand-red-500 bg-clip-text text-transparent">
          German
        </span>
        <span className="text-slate-950 dark:text-slate-100">
          Path
        </span>
      </div>
    </Link>
  );
};

export default Logo;
