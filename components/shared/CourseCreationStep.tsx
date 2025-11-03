import React, { Dispatch, SetStateAction } from "react";
import Link from "next/link";
import { ArrowLeftFromLine, LogOutIcon } from "lucide-react";

interface Props {
  setStep: Dispatch<SetStateAction<number>>;
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  stepSubTitle: string;
  children: React.ReactNode;
}

export const CourseCreationStepHeader = ({
  currentStep,
  totalSteps,
  setStep,
}: {
  currentStep: Props["currentStep"];
  totalSteps: Props["totalSteps"];
  setStep: Props["setStep"];
}) => {
  return (
    <div className="w-full  flex items-center justify-between py-6  border-b border-input">
      <div className="flex gap-2 items-center ">
        {/* {currentStep > 1 ? (
          <ArrowLeftFromLine
            onClick={() => setStep(1)}
            className="text-slate-400 hover:text-slate-600 transition duration-300 ease-in-out"
            size={22}
          />
        ) : null} */}
        <h2 className="font-semibold text-xl text-slate-950 dark:text-slate-200">
          Step <span className="primary-color">{currentStep}</span> of{" "}
          {totalSteps}
        </h2>
      </div>
      <Link href="/teacher/courses">
        <p className="font-bold  primary-color opacity-80 hover:opacity-100">
          <LogOutIcon className="md:hidden font-bold" size={18} />
          <p className="hidden md:block">Exit</p>
        </p>
      </Link>
    </div>
  );
};

const CourseCreationStep = ({
  setStep,
  currentStep,
  totalSteps,
  stepTitle,
  stepSubTitle,
  children,
}: Props) => {
  return (
    <div className="flex flex-col gap-6 ">
      <CourseCreationStepHeader
        setStep={setStep}
        currentStep={currentStep}
        totalSteps={totalSteps}
      />
      <div className="flex flex-col gap-12 items-center lg:px-8 lg:py-12 ">
        <div className="w-full flex flex-col gap-3 items-center">
          <h3 className="text-xl md:text-2xl text-center font-semibold text-slate-950 dark:text-slate-200">
            {stepTitle}
          </h3>
          <p className="text-slate-400  text-center"> {stepSubTitle} </p>
        </div>
        <div className="w-full mx-auto flex flex-col gap-2">{children}</div>
      </div>
    </div>
  );
};

export default CourseCreationStep;
