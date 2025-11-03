import { LeftSideBar } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { studentRoutes } from "@/lib/data";
import Image from "next/image";

const Loading = () => {
  return (
    <div className="flex gap-4">
      <LeftSideBar />
      <div className="p-6 w-full">
        <div className="flex flex-col items-start gap-10 ">
          <h2 className="text-3xl font-bold text-slate-950 dark:text-slate-200 ">
            My Learning
          </h2>
          <div
            className={`w-full h-[45px] bg-transparent relative 
      
      `}
          >
            <Input
              placeholder={"Search for your learnings"}
              className={`hidden md:block w-full  pl-[50px] h-full text-slate-950 font-semibold bg-slate-100 dark:text-slate-200 dark:bg-slate-900 border-none outline-none rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0`}
              value={""}
            />

            <Button className="bg-transparent hover:bg-transparent">
              <Image
                src="/icons/search.svg"
                alt="search"
                width={20}
                height={20}
                className="left-3/4 absolute top-1/2 transform -translate-y-1/2 md:left-4"
              />
            </Button>
          </div>

          <div className="w-full cursor-pointer flex-col lg:flex-row flex gap-4 ">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="w-[70px] h-[30px]" />
            ))}
          </div>
          <div className="flex gap-6 flex-wrap ">
            {Array.from({ length: 10 }).map((_, index) => (
              <Skeleton
                key={index}
                className="group relative flex flex-col gap-2 w-full md:w-[340px] h-[500px] border hover:scale-105 rounded-[16px] shadow-sm hover:shadow-md    hover:z-100  ease-in-out transition-all cursor-pointer"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
