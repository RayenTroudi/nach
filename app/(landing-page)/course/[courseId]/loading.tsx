import { Container, Star } from "@/components/shared";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const Loading = () => {
  return (
    <div
      className="min-h-[calc(100vh-330px)] "
      style={{
        minHeight: "calc(100vh-330px)",
      }}
    >
      <div className="flex flex-col gap-y-6 lg:relative">
        <div className="w-full lg:w-[350px] min-h-[400px] lg:fixed lg:top-24 lg:right-24 flex flex-col gap-y-4 shadow-xl  z-50 p-2 lg:bg-slate-50 lg:dark:bg-slate-900 rounded-md">
          <Skeleton className="w-full h-[200px] rounded-t-md " />

          <div className="flex flex-col gap-y-2">
            <div className="w-full flex items-center justify-between">
              <Skeleton className="w-[100px] h-[50px] rounded-sm" />

              <Skeleton className="w-[120px] h-[20px]" />
            </div>
            <Separator />

            <div className="w-full flex flex-col gap-y-3">
              <h2 className="text-lg text-slate-800 dark:text-slate-200 font-bold mb-2">
                Videos For Preview
              </h2>
              {[1, 2, 3, 4, 5].map((_, key: number) => (
                <Skeleton
                  key={key}
                  className={` w-full px-3 py-2 h-[15px]}

              `}
                />
              ))}
            </div>
            <Separator />
            <div className="flex flex-col gap-y-2">
              <Skeleton className="w-full h-[50px]" />
              <Skeleton className="w-full h-[50px]" />
            </div>
          </div>
        </div>
        <div className="w-full bg-slate-200/30 dark:bg-slate-900/30 ">
          <Container className="px-16 py-6 w-full ">
            <div className="flex flex-col gap-y-4 w-full lg:w-[950px]">
              <div className="w-full flex flex-col gap-y-3">
                <Skeleton className="hover:bg-dark/80 rounded-full w-[150px] px-4 py-2 h-[25px] text-slate-50" />
                <Skeleton className="w-[300px] h-[20px] rounded-full" />
                <Skeleton className="w-full lg:w-[800px] h-[15px] " />
                <Skeleton className="w-full lg:w-[800px] h-[15px] " />
                <Skeleton className="w-[300px]  h-[15px]  text-wrap" />
              </div>
              <div className="flex flex-col items-start md:flex-row md:items-center gap-x-2">
                <div className="flex items-center gap-x-2">
                  <Skeleton className="w-[30px] h-[30px] rounded-full" />
                  {Array.from({ length: 5 }).map((_, key) => (
                    <Star
                      key={key}
                      index={key}
                      stars={0}
                      filled={Boolean(0 > key)}
                    />
                  ))}

                  <div className="flex items-center gap-x-1">
                    <Skeleton className="w-[30px] h-[30px] rounded-full" />
                    <Skeleton className="w-[75px] h-[10px] " />
                  </div>
                </div>

                <Separator
                  className="h-[20px] hidden md:block"
                  orientation="vertical"
                />
                <div className="flex items-center gap-x-1">
                  <Skeleton className="w-[30px] h-[30px] rounded-full" />
                  <Skeleton className="w-[75px] h-[10px] " />
                </div>
              </div>
              <div className="text-slate-500 flex gap-x-1 items-center">
                <Skeleton className="w-[250px] h-[15px]" />
              </div>
            </div>
          </Container>
        </div>
        <Container className="px-16 py-6 w-full ">
          <h2 className="text-xl lg:text-2xl font-semibold">
            All course sections
          </h2>
          <div className=" w-full lg:w-[950px]">
            {[1, 2, 3, 4].map((_, key: number) => (
              <Skeleton className="w-full h-[70px] mt-2" key={key} />
            ))}
          </div>
        </Container>
      </div>
    </div>
  );
};

export default Loading;
