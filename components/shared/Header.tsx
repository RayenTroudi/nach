import { Button } from "../ui/button";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton, auth } from "@clerk/nextjs";
import {
  HeaderContent,
  Logo,
  MobileSideBar,
  Navbar,
  ShoppingCard,
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
    mongoDbUser = await getUserByClerkId({ clerkId: userId! });
    console.log("🔍 Header - MongoDB User:", {
      clerkId: userId,
      isAdmin: mongoDbUser?.isAdmin,
      firstName: mongoDbUser?.firstName,
      email: mongoDbUser?.email,
    });
  } catch (error: any) {
    console.log("❌ Header - Error fetching user:", error.message);
  }

  return (
    <header className="z-50 border-b border-input flex items-center justify-between px-4 h-[80px] w-screen bg-transparent">
      {/* Left: Logo + Category Filter */}
      <div className="flex items-center gap-x-4">
        <Logo />
        <HeaderContent>
          <CategoryFilter />
        </HeaderContent>
      </div>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Right: Navbar + Auth Buttons + Actions */}
      <div className="flex items-center gap-x-4">
        {/* Navbar Items */}
        {userId ? <Navbar isUserAdmin={mongoDbUser?.isAdmin || false} /> : null}
        
        {!userId ? (
          <HeaderContent>
            <HeaderAuthButtons />
          </HeaderContent>
        ) : null}

        <HeaderContent>
          <div className="flex items-center gap-x-4">
            <ShoppingCard />
            <ThemeSwitcher />
            <LanguageSwitcher />
            <SignedIn>
              <ClerkUserButton />
            </SignedIn>
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
