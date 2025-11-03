import Image from "next/image";
import React from "react";
import FramerMotion from "./FramerMotion";

const Skill = ({ text }: { text: string }) => {
  return (
    <FramerMotion>
      <div className="flex items-center gap-2">
        <Image src="/icons/tick.svg" alt={text} width={25} height={25} />
        <p className="text-[15px] text-slate-900 dark:text-slate-300 font-semibold">
          {text}
        </p>
      </div>
    </FramerMotion>
  );
};

export default Skill;
