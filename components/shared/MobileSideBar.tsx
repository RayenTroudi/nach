"use client";
import React from "react";

import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import Logo from "./Logo";
import { usePathname } from "next/navigation";
import { adminRoutes, studentRoutes, teacherRoutes } from "@/lib/data";
import { MobileLeftSidebarItem } from ".";
import { SignedIn } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeProvider";

const MobileSideBar = ({
  isAdmin,
  children,
}: {
  isAdmin: boolean;
  children?: React.ReactNode;
}) => {
  const { mode } = useTheme();
  const pathname = usePathname();
  const isTeacherView =
    pathname?.startsWith("/teacher") || pathname?.includes("/section");
  const isAdminView =
    pathname?.startsWith("/admin") || pathname?.includes("/admin");

  const routes = isTeacherView
    ? teacherRoutes
    : isAdminView
    ? adminRoutes
    : studentRoutes;

  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger className="">
          {mode === "dark" ? (
            <Image
              src="/icons/dark-menu.svg"
              alt="menu"
              width={40}
              height={40}
              className="flex-shrink-0"
            />
          ) : (
            <Image
              src="/icons/light-menu.svg"
              alt="menu"
              width={40}
              height={40}
              className="flex-shrink-0"
            />
          )}
        </SheetTrigger>
        <SheetContent side="left" className=" flex flex-col gap-12">
          <SheetHeader>
            <SheetTitle className="">
              <Logo isSheetOpen={true} />
            </SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-1 gap-2">
            {routes.map((route, key) => (
              <MobileLeftSidebarItem key={key} {...route} />
            ))}
            <SignedIn>
              {/* Only admins can access instructor mode */}
              {isAdmin && (!pathname.startsWith("/teacher") ||
              pathname.includes("/section")) ? (
                <Link
                  href="/teacher/courses"
                  className={`group w-full px-2 py-6 rounded-sm flex items-center justify-start gap-4 h-[30px] hover:bg-brand-red-500 duration-300 ease-in-out ${
                    pathname === "/teacher/courses" ||
                    pathname.startsWith("/teacher/courses")
                      ? "bg-brand-red-500"
                      : ""
                  }`}
                >
                  <Image
                    src={"/icons/instructor.svg"}
                    alt={"instructor"}
                    width={26}
                    height={26}
                    className={`w-[35px] h-[35px] invert group-hover:invert-0 ${
                      pathname === "/teacher/courses" ||
                      pathname.startsWith(`/teacher/courses/`) ||
                      mode === "dark"
                        ? "invert-0"
                        : ""
                    }`}
                  />
                  <p
                    className={`text-[15px] text-slate-950 dark:text-slate-200 font-semibold group-hover:text-slate-200 block ${
                      pathname === "/teacher/courses" ||
                      pathname.startsWith(`/teacher/courses/`)
                        ? "text-white"
                        : ""
                    }`}
                  >
                    Instructor
                  </p>
                </Link>
              ) : null}

              {isAdmin ? (
                <>
                  {!pathname.startsWith("/admin") ? (
                    <Link
                      href="/admin/dashboard"
                      className={`group w-full px-2 py-6 rounded-sm flex items-center justify-start gap-4 h-[30px] hover:bg-brand-red-500 duration-300 ease-in-out ${
                        pathname === "/admin/dashboard" ||
                        pathname.startsWith("/admin")
                          ? "bg-brand-red-500"
                          : ""
                      }`}
                    >
                      <Image
                        src={"/icons/admin.svg"}
                        alt={"admin"}
                        width={26}
                        height={26}
                        className={`w-[35px] h-[35px] invert group-hover:invert-0 ${
                          pathname === "/admin/dashboard" ||
                          pathname.startsWith(`/admin/dashboard/`) ||
                          mode === "dark"
                            ? "invert-0"
                            : ""
                        }`}
                      />
                      <p
                        className={`text-[15px] text-slate-950 dark:text-slate-200 font-semibold group-hover:text-white block ${
                          pathname === "/admin/dashboard" ||
                          pathname.startsWith(`/admin/dashboard/`)
                            ? "text-slate-200"
                            : ""
                        }`}
                      >
                        Admin
                      </p>
                    </Link>
                  ) : null}
                </>
              ) : null}
            </SignedIn>
          </div>

          <SheetFooter className="flex flex-col gap-2 absolute bottom-5 left-0 w-full px-4 ">
            {children}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileSideBar;
