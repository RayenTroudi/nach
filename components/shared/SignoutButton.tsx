"use client";
import React, { useState } from "react";
import { Button } from "@react-email/components";
import { useClerk } from "@clerk/clerk-react";
import { useRouter } from "next/navigation";
import { LogOut, Power } from "lucide-react";
import { scnToast } from "../ui/use-toast";
import { set } from "mongoose";
import Spinner from "./Spinner";

const SignoutButton = ({ isSheetOpen = true }: { isSheetOpen?: boolean }) => {
  const { signOut } = useClerk();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSignOutHandler = () => {
    try {
      setIsLoading(true);
      signOut(() => router.push("/"));

      setTimeout(() => {
        scnToast({
          variant: "success",
          title: "You have been signed out.",
          description: "You have been signed out successfully.",
        });
      }, 1500);
    } catch (error: any) {
      setIsLoading(false);
      scnToast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message,
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    }
  };

  return (
    // Clicking on this button will sign out a user and reroute them to the "/" (home) page.
    <div
      className={` ${
        !isSheetOpen
          ? "h-[30px] px-2 py-6 justify-center lg:justify-start"
          : "px-4 py-2"
      } ${
        isLoading ? "bg-brand-red-500" : ""
      } w-full text-brand-red-500 flex items-center gap-x-2 bg-slate-100 dark:bg-slate-800 font-semibold rounded-md hover:bg-brand-red-500 hover:text-white cursor-pointer duration-300 ease-in-out`}
      onClick={onSignOutHandler}
    >
      <Button className=" ">
        {isLoading ? (
          <Spinner size={18} className="text-slate-50" />
        ) : (
          <Power size={18} />
        )}
      </Button>
      <p
        className={`${!isSheetOpen ? "hidden lg:block" : ""} ${
          isLoading ? "text-slate-50" : ""
        }`}
      >
        Sign out
      </p>
    </div>
  );
};

export default SignoutButton;
