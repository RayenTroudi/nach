import Image from "next/image";
import React from "react";

interface Props {
  icon: string | React.ReactNode;
  alt: string;
  bgColor: string;
  title: string;
}

const CourseStepHeader = ({ icon, alt, bgColor, title }: Props) => {
  return (
    <div>
      <div className="flex items-center gap-2">
        <div
          className={`w-[30px] h-[30px] lg:w-[40px] lg:h-[40px] rounded-full ${bgColor} flex items-center justify-center`}
        >
          {typeof icon === "string" ? (
            <Image
              src={icon}
              width={18}
              height={18}
              alt={alt}
              className="w-[20px] h-[20px] lg:w-[25px] lg:h-[25px]"
            />
          ) : (
            <>{icon}</>
          )}
        </div>
        <h2 className="text-lg lg:text-xl font-bold text-slate-700 dark:text-slate-300">
          {title}
        </h2>
      </div>
    </div>
  );
};

export default CourseStepHeader;
