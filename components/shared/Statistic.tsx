import { formatNumber } from "@/lib/utils";
import Image from "next/image";
import React from "react";
import FramerMotion from "./FramerMotion";

interface Props {
  icon: string;
  number: number;
  title: string;
  type?: string;
}

const Statistic = ({ icon, number, title, type }: Props) => {
  return (
    <FramerMotion className="w-full md:w-[230px]">
      <div className="w-full h-[160px] rounded-md border border-input flex flex-col items-center justify-center gap-2 shadow-md">
        <Image src={icon} alt={title} width={45} height={45} />
        <p className="text-[28px]  font-bold group-hover:primary-color ease-in-out duration-300 text-slate-950 dark:text-slate-200">
          {type ? number + " %" : formatNumber(number)}
        </p>
        <span className="font-semibold text-[14px] text-slate-850 dark:text-slate-400">
          {title}
        </span>
      </div>
    </FramerMotion>
  );
};

export default Statistic;
