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

import CategoryFilter from "./CategoryFilter";
import { Divide, MoonStarIcon } from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";
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
            <div className="hidden md:flex items-center gap-3">
              <Link href="/sign-up">
                <Button
                  name="Sign up"
                  className="contrast-100 hover:opacity-90 transition-all duration-300 ease-in-out w-[100px] h-[40px] bg-slate-100 dark:bg-slate-800 text-brand-red-500 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-button"
                >
                  Sign Up
                </Button>
              </Link>

              <Link href="/sign-in">
                <Button
                  name="Sign In"
                  className="contrast-100 hover:opacity-90 transition-all duration-300 ease-in-out bg-brand-red-500 text-white w-[100px] h-[40px] hover:bg-brand-red-600 shadow-button hover:shadow-button-hover rounded-button"
                >
                  Login
                </Button>
              </Link>
            </div>
          </HeaderContent>
        ) : null}

        <HeaderContent>
          <div className="flex items-center gap-x-4">
            <ShoppingCard />
            <ThemeSwitcher />
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
