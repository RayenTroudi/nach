"use server";
import { auth } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";

const MobileSignupSignInButtons = () => {
  return (
    <>
      <Link href="/sign-up" className="w-full">
        <Button className="w-full h-[40px] bg-[#0071DC]/10 text-[#FF782D] font-medium hover:bg-[#0071DC]/10 ">
          Sign Up
        </Button>
      </Link>

      <Link href="/sign-in" className="w-full">
        <Button className="w-full bg-[#FF782D] text-white h-[40px] hover:bg-[#FF782D]">
          Login
        </Button>
      </Link>
    </>
  );
};

export default MobileSignupSignInButtons;
