"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { MenuIcon } from "lucide-react";
import MobileSideBar from "./MobileSideBar";
import { dark } from "@clerk/themes";
import { useTheme } from "@/contexts/ThemeProvider";
import ThemeSwitcher from "./ThemeSwitcher";
import { Separator } from "../ui/separator";
import ClerkUserButton from "./ClerkUserButton";

import { motion } from "framer-motion";

const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

const Navbar = ({ isUserAdmin }: { isUserAdmin: boolean }) => {
  const pathname = usePathname();
  const isTeacher = pathname?.startsWith("/teacher");
  const isSection = pathname?.includes("/section");
  const isAdmin = pathname?.includes("/admin");
  return (
    <div className="flex items-center gap-1 ">
      {isTeacher || isSection || isAdmin ? (
        <div className="flex items-center gap-x-2">
          <Link
            href="/"
            className="text-slate-950 dark:text-slate-200 font-bold text-sm hover:text-[#FF782D] ease-in-out duration-100"
          >
            Student
          </Link>
          <SignedIn>
            <ClerkUserButton />
          </SignedIn>
          <ThemeSwitcher />
          <MobileSideBar isAdmin={isUserAdmin} />
        </div>
      ) : (
        <div className="flex items-center gap-x-2">
          {isUserAdmin ? (
            <>
              <Link
                href="/admin/dashboard/"
                className="font-bold text-sm text-[#FF782D] ease-in-out duration-100 hidden lg:block"
              >
                Admin
              </Link>
              <Separator
                orientation="vertical"
                className="h-[20px] hidden lg:block"
              />
              {/* Only admins can become instructors */}
              <Link href="/teacher/courses" className="hidden lg:block">
                <p className="text-slate-950 dark:text-slate-200 font-bold text-[14px] cursor-pointer  relative">
                  Become an{" "}
                  <span className="primary-color hover:border-b-2 hover:border-[#FF782D] ease-in-out duration-100">
                    Instructor
                  </span>
                </p>
              </Link>
              <Separator
                orientation="vertical"
                className="h-[20px] hidden lg:block"
              />
            </>
          ) : null}

          <Link
            href="/my-learning"
            className="text-slate-950 dark:text-slate-200 font-medium text-[14px] cursor-pointer relative hidden md:block"
          >
            <span className="hover:primary-color ease-in-out duration-100">
              My learning
            </span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Navbar;
