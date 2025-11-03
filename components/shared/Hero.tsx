"use client";
import { cn } from "@/lib/utils";
import AnimatedGradientText from "../magicui/animated-gradient-text";
import { ChevronRight } from "lucide-react";
import NumberTicker from "../magicui/number-ticker";
import GridPattern from "../magicui/grid-pattern";
import AnimatedGridPattern from "../magicui/animated-grid-pattern";
import Image from "next/image";
import { useTheme } from "@/contexts/ThemeProvider";
import { Button } from "../ui/button";
import { Spotlight } from "../ui/Spotlight";
import { useRouter } from "next/navigation";
import { TCourse, TUser } from "../../types/models.types";

const Hero = ({ courses, users }: { courses: TCourse[]; users: TUser[] }) => {
  const instructors = users.filter(
    (user) => user.createdCourses && user.createdCourses.length > 0
  );
  const { mode } = useTheme();
  const router = useRouter();
  return (
    <div className=" bg-slate-100/80 dark:bg-slate-950 w-full rounded-md relative  overflow-clip py-16">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill={
          mode === "dark" ? "rgba(247, 250, 252, 0.5)" : "rgba(2, 6, 23, 0.5)"
        }
      />
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.2}
        duration={3}
        repeatDelay={1}
        className={cn(
          "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)] cursor-pointer",
          "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
        )}
      />
      <div className="w-[90%] mx-auto flex flex-col gap-y-12">
        <AnimatedGradientText className="">
          🇩🇪 <hr className="mx-2 h-4 w-[1px] shrink-0 bg-gray-300 " />
          <span
            className={cn(
              `inline animate-gradient bg-gradient-to-r from-[#DD0000] via-[#000000] to-[#FFCE00] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`
            )}
          >
            Your Gateway to Life in Germany
          </span>
          <ChevronRight className="ml-1 size-5 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
        </AnimatedGradientText>
        <div className="w-full flex flex-col gap-y-4">
          <p className=" text-4xl md:text-7xl font-bold   text-center bg-clip-text text-transparent bg-gradient-to-b  from-slate-950 to-slate-500 dark:from-slate-50 dark:to-slate-500">
            Start Your Journey to Germany Today
          </p>
          <p className="w-[75%]  text-lg md:text-4xl font-semibold  bg-clip-text text-transparent bg-gradient-to-b  from-slate-950 to-slate-500 dark:from-slate-50 dark:to-slate-500 text-center  mx-auto">
            Learn German, navigate visa processes, and prepare for your new life in Germany - all in one place.
          </p>
        </div>
        <div className="w-[60%]  mx-auto flex flex-col gap-y-6 md:flex-row md:items-center md:justify-between gap-x-4 flex-wrap">
          <div className="flex items-center flex-col gap-y-2 ">
            <p className="whitespace-pre-wrap text-8xl font-medium tracking-tighter bg-clip-text text-transparent bg-gradient-to-b  from-slate-950 to-slate-500 dark:from-slate-50 dark:to-slate-500">
              <NumberTicker value={users.length} />
            </p>
            <div className="flex items-center gap-x-4 ">
              <span className="capitalize text-2xl text-center bg-clip-text text-transparent bg-gradient-to-b  from-slate-950 to-slate-500 dark:from-slate-50 dark:to-slate-500">
                {" "}
                Future Germans
              </span>
            </div>
          </div>
          <div className="flex items-center flex-col gap-y-2 ">
            <p className="whitespace-pre-wrap text-8xl font-medium tracking-tighter bg-clip-text text-transparent bg-gradient-to-b  from-slate-950 to-slate-500 dark:from-slate-50 dark:to-slate-500">
              <NumberTicker value={instructors.length} />
            </p>
            <div className="flex items-center gap-x-4 ">
              <span className="capitalize text-2xl text-center bg-clip-text text-transparent bg-gradient-to-b  from-slate-950 to-slate-500 dark:from-slate-50 dark:to-slate-500">
                {" "}
                Expert Guides
              </span>
            </div>
          </div>
          <div className="flex items-center flex-col gap-y-2 ">
            <p className="whitespace-pre-wrap text-8xl font-medium tracking-tighter bg-clip-text text-transparent bg-gradient-to-b  from-slate-950 to-slate-500 dark:from-slate-50 dark:to-slate-500">
              <NumberTicker value={courses.length} />
            </p>
            <div className="flex items-center gap-x-4 ">
              <span className="capitalize text-2xl text-center bg-clip-text text-transparent bg-gradient-to-b  from-slate-950 to-slate-500 dark:from-slate-50 dark:to-slate-500">
                {" "}
                Preparation Courses
              </span>
            </div>
          </div>
        </div>

        <div className="w-[60%] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => router.push("/instructor/courses")}
            className="w-full py-6 rounded-full flex items-center gap-x-1 bg-gradient-to-r from-primaryColor/90  to-primaryColor text-white  font-bold text-lg  shadow-[inset_0_-8px_10px_#8fdfff1f] backdrop-blur-sm transition-shadow duration-500 ease-out [--bg-size:300%] hover:shadow-[inset_0_-5px_10px_#8fdfff3f] dark:bg-black/40"
          >
            <span className="hidden md:block">Become a</span>{" "}
            <span> Guide</span>
          </Button>

          <Button
            onClick={() => router.push("/my-learning")}
            className="w-full py-6 rounded-full bg-transparent  hover:bg-transparent  border-2 border-primaryColor text-primaryColor    font-bold text-lg shadow-[inset_0_-8px_10px_#8fdfff1f] backdrop-blur-sm transition-shadow duration-500 ease-out [--bg-size:300%] hover:shadow-[inset_0_-5px_10px_#8fdfff3f] dark:bg-black/40"
          >
            My Journey
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
