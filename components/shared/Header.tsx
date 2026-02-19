import { Button } from "../ui/button";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton, auth } from "@clerk/nextjs";
import {
  HeaderContent,
  Logo,
  MobileSideBar,
  Navbar,
} from "./";
import MobileSignupSignInButtons from "./MobileSignupSignInButtons";
import { getUserByClerkId } from "@/lib/actions";
import { HeaderAuthButtons } from "./HeaderAuthButtons";

import CategoryFilter from "./CategoryFilter";
import { Divide, MoonStarIcon } from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";
import LanguageSwitcher from "./LanguageSwitcher";
import SignoutButton from "./SignoutButton";
import ClerkUserButton from "./ClerkUserButton";

const Header = async () => {
  const { userId } = auth();
  let mongoDbUser = null;
  try {
    if (userId) {
      mongoDbUser = await getUserByClerkId({ clerkId: userId! });
      console.log("🔍 Header - MongoDB User:", {
        clerkId: userId,
        isAdmin: mongoDbUser?.isAdmin,
        firstName: mongoDbUser?.firstName,
        email: mongoDbUser?.email,
      });
    }
  } catch (error: any) {
    console.log("❌ Header - Error fetching user:", error.message);
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-input flex items-center justify-between px-4 h-[80px] bg-white dark:bg-slate-950">
      {/* Logo */}
      <div className="flex items-center">
        <Logo />
      </div>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Navbar + Auth Buttons + Actions */}
      <div className="flex items-center gap-x-2 sm:gap-x-4">
        {/* Navbar Items */}
        {userId ? <Navbar isUserAdmin={mongoDbUser?.isAdmin || false} /> : null}
        
        {!userId ? (
          <HeaderContent>
            <HeaderAuthButtons />
          </HeaderContent>
        ) : null}

        <HeaderContent>
          <div className="flex items-center gap-x-2 sm:gap-x-4">
            <SignedIn>
              <ClerkUserButton />
            </SignedIn>
            <LanguageSwitcher />
            <ThemeSwitcher />
            <MobileSideBar isAdmin={mongoDbUser?.isAdmin || false}>
              {!userId ? <MobileSignupSignInButtons /> : <SignoutButton />}
            </MobileSideBar>
          </div>
        </HeaderContent>
      </div>
    </header>
  );
};

export default Header;
