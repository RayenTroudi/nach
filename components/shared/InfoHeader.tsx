import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
interface Props {
  title: string;
  subTitle?: string;
  buttonText?: string;
  onClick?: () => void;
  rightText?: string;
}

const InfoHeader = ({
  title,
  subTitle,
  buttonText,
  onClick,
  rightText,
}: Props) => {
  return (
    <div className="w-full flex items-center justify-between">
      <div className="flex flex-col gap-2">
        <h2 className="text-[20px] md:text-[28px] font-semibold text-slate-950 dark:text-slate-200">
          {title}
        </h2>
        {subTitle ? (
          <p className="text-[13px] md:text-[16px] text-slate-800 dark:text-slate-400">
            {subTitle}
          </p>
        ) : null}
      </div>
      {buttonText ? (
        <Button className="rounded-full border border-slate-950 dark:border-slate-400 bg-transparent text-slate-950 dark:text-slate-200 font-semibold hover:bg-brand-red-500 hover:text-slate-200 hover:border-brand-red-500 duration-100">
          {buttonText}
        </Button>
      ) : (
        <Link
          className="text-sm font-bold text-teal-400 hover:underline"
          href={"/history"}
        >
          {rightText}
        </Link>
      )}
    </div>
  );
};

export default InfoHeader;
