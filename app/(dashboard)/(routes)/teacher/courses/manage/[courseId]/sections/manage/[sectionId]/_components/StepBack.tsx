"use client";
import { ArrowLeftFromLine } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const StepBack = () => {
  const router = useRouter();
  return (
    <ArrowLeftFromLine
      className="flex-shrink-0 w-[25px] h-[25px] text-slate-700 hover:text-slate-900 duration-300 ease-in-out cursor-pointer dark:text-slate-200 dar:hover:text-slate-100"
      onClick={() => router.back()}
    />
  );
};

export default StepBack;
