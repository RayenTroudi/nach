"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

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
      <Image
        src="/icons/logo.svg"
        alt="logo"
        width={40}
        height={40}
        className="flex-shrink-0 w-[32px] h-[32px] md:w-[40px] md:h-[40px]"
      />
      <em
        className={`${
          isSheetOpen ? "block" : "hidden md:block "
        } text-slate-950 dark:text-slate-100 font-bold text-[22px]`}
      >
        Germany
        <em className="primary-color text-[30px]">F</em>
        ormation
      </em>
    </Link>
  );
};

export default Logo;
