"use client";
import { usePathname } from "next/navigation";
import { SideBarItem } from "./";
import SignoutButton from "./SignoutButton";
import { adminRoutes, studentRoutes, teacherRoutes } from "@/lib/data";

function LeftSideBar() {
  const pathname = usePathname();
  const routes = pathname?.startsWith("/admin")
    ? adminRoutes
    : pathname?.startsWith("/teacher") || pathname?.includes("/section")
    ? teacherRoutes
    : studentRoutes;
  return (
    <div className="hidden shadow-sm border-r border-input min-h-screen w-24 lg:w-80 text-slate-950 dark:text-slate-200 md:flex flex-col gap-12 p-4 ">
      <div className="flex flex-col gap-6 mt-4">
        {routes.map((route, index) => (
          <SideBarItem key={index} {...route} />
        ))}

        <SignoutButton isSheetOpen={false} />
      </div>
    </div>
  );
}

export default LeftSideBar;
