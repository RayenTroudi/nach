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
      {/* TDS Logo */}
        <Image
          src="/images/nobgLogo.png"
          alt="TDS Logo"
          width={80}
          height={40}
          className="w-full h-full object-contain"
        />
    </Link>
  );
};

export default Logo;
