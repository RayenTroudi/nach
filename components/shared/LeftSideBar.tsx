"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { SideBarItem } from "./";
import SignoutButton from "./SignoutButton";
import { adminRoutes, studentRoutes, teacherRoutes } from "@/lib/data";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

function LeftSideBar() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  const routes = pathname?.startsWith("/admin")
    ? adminRoutes
    : pathname?.startsWith("/teacher") || pathname?.includes("/section")
    ? teacherRoutes
    : studentRoutes;

  const getFinalHref = (href: string) => {
    const hasLocale = href.startsWith('/ar/') || href.startsWith('/en/') || href.startsWith('/de/');
    const pathnameHasLocale = pathname.startsWith('/ar/') || pathname.startsWith('/en/') || pathname.startsWith('/de/');
    return pathnameHasLocale && !hasLocale ? `/${locale}${href}` : href;
  };

  console.log("🔲 LeftSideBar - Rendering:", {
    pathname,
    routesCount: routes.length,
    routeType: pathname?.startsWith("/admin") ? 'admin' : pathname?.startsWith("/teacher") || pathname?.includes("/section") ? 'teacher' : 'student',
  });

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden shadow-sm border-r border-input min-h-screen w-24 lg:w-80 text-slate-950 dark:text-slate-200 md:flex flex-col gap-12 p-4 ">
        <div className="flex flex-col gap-6 mt-4">
          {routes.map((route, index) => (
            <SideBarItem key={index} {...route} />
          ))}

          <SignoutButton isSheetOpen={false} />
        </div>
      </div>

      {/* Mobile hamburger button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="p-2 rounded-md bg-white dark:bg-slate-900 border border-input shadow-md">
              <Menu size={22} className="text-slate-950 dark:text-slate-200" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <div className="flex flex-col gap-3 p-4 mt-10">
              {routes.map((route, index) => {
                const finalHref = getFinalHref(route.href);
                const isActive = pathname === finalHref;
                const Icon = route.icon;
                return (
                  <Link
                    key={index}
                    href={finalHref}
                    onClick={() => setOpen(false)}
                    className={`w-full px-4 py-3 rounded-md flex items-center gap-4 hover:bg-brand-red-500 hover:text-white duration-300 ease-in-out ${
                      isActive
                        ? "bg-brand-red-500 text-white"
                        : "text-slate-950 dark:text-slate-200"
                    }`}
                  >
                    <Icon
                      size={20}
                      className={isActive ? "text-white" : "text-slate-950 dark:text-slate-200"}
                    />
                    <span className="font-semibold text-[15px]">{t(route.labelKey)}</span>
                  </Link>
                );
              })}
              <div className="mt-2">
                <SignoutButton isSheetOpen={true} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

export default LeftSideBar;
