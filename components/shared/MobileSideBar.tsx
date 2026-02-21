"use client";
import React, { useEffect, useState } from "react";

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
import { useAuth, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeProvider";
import { useTranslations, useLocale } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

const MobileSideBar = ({
  isAdmin,
  children,
}: {
  isAdmin: boolean;
  children?: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations();
  const locale = useLocale();
  const { mode } = useTheme();
  const pathname = usePathname();
  const { isLoaded: authLoaded, userId, sessionId } = useAuth();
  const { isLoaded: userLoaded, isSignedIn, user } = useUser();
  
  console.log("📱 MobileSideBar - Rendering:", {
    isAdmin,
    pathname,
    isOpen,
  });

  useEffect(() => {
    console.log("🔐 MobileSideBar - Clerk client state:", {
      authLoaded,
      userLoaded,
      isSignedIn,
      userId,
      sessionId,
      email: user?.primaryEmailAddress?.emailAddress,
    });
  }, [authLoaded, userLoaded, isSignedIn, userId, sessionId, user]);
  
  // Check if current pathname uses locale
  const pathnameHasLocale = pathname.startsWith('/ar/') || pathname.startsWith('/en/') || pathname.startsWith('/de/');
  const getLocalizedHref = (href: string) => {
    const hasLocale = href.startsWith('/ar/') || href.startsWith('/en/') || href.startsWith('/de/');
    return pathnameHasLocale && !hasLocale ? `/${locale}${href}` : href;
  };
  
  const isTeacherView =
    pathname?.startsWith("/teacher") || pathname?.includes("/section");
  const isAdminView =
    pathname?.startsWith("/admin") || pathname?.includes("/admin");

  const routes = isTeacherView
    ? teacherRoutes
    : isAdminView
    ? adminRoutes
    : studentRoutes;

  console.log("📱 MobileSideBar - Routes:", {
    isTeacherView,
    isAdminView,
    routesCount: routes.length,
    routeType: isTeacherView ? 'teacher' : isAdminView ? 'admin' : 'student',
  });

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <button
            className="flex items-center justify-center p-2 min-h-[44px] min-w-[44px]"
            aria-label="Toggle mobile menu"
          >
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
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col h-full">
          <SheetHeader className="flex-shrink-0">
            <SheetTitle className="">
              <Logo isSheetOpen={true} />
            </SheetTitle>
          </SheetHeader>
          {/* Show loading skeleton while auth is loading */}
          {!authLoaded || !userLoaded ? (
            <div className="flex-1 overflow-y-auto py-4 mb-20">
              <div className="grid grid-cols-1 gap-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="w-full h-12 rounded-md" />
                ))}
              </div>
            </div>
          ) : isSignedIn && userId ? (
            <div className="flex-1 overflow-y-auto py-4 mb-20">
              <div className="grid grid-cols-1 gap-2">
                {routes.map((route, key) => (
                  <MobileLeftSidebarItem key={key} {...route} onClose={() => setIsOpen(false)} />
                ))}
              {/* Only admins can access instructor mode */}
              {isAdmin && (!pathname.startsWith("/teacher") ||
              pathname.includes("/section")) ? (
                <Link
                  href={getLocalizedHref("/teacher/courses")}
                  onClick={() => setIsOpen(false)}
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
                    {t("navigation.instructor")}
                  </p>
                </Link>
              ) : null}

              {isAdmin ? (
                <>
                  {!pathname.startsWith("/admin") ? (
                    <Link
                      href={getLocalizedHref("/admin/dashboard")}
                      onClick={() => setIsOpen(false)}
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
                        {t("navigation.admin")}
                      </p>
                    </Link>
                  ) : null}
                </>
              ) : null}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center py-4">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {t("auth.pleaseSignIn") || "Please sign in to view menu"}
              </p>
            </div>
          )}

          <SheetFooter className="flex flex-col gap-2 absolute bottom-5 left-0 w-full px-4 ">
            {children}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileSideBar;
