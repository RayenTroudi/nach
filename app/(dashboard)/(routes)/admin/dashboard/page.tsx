"use server";
import { getAllCourses, getPendingCourses } from "@/lib/actions/course.action";
import React from "react";
import { PendingCourses } from "./_components";
import { LeftSideBar } from "@/components/shared";
import NoCoursesAnimation from "@/components/shared/animations/NoCourses";
import { TCourse } from "@/types/models.types";

const AdminDashboardPage = async () => {
  let pendingCourses: TCourse[] = [];

  try {
    pendingCourses = await getPendingCourses();
  } catch (error: any) {}

  return (
    <div className="flex">
      <LeftSideBar />

      {!pendingCourses.length ? (
        <div className="w-full flex flex-col items-center  gap-y-2">
          <NoCoursesAnimation className="h-[300px] lg:h-[500px] " />
          <h1 className="text-xl md:text-3xl font-bold">
            No Pending Courses Yet .
          </h1>
        </div>
      ) : (
        <div className="p-6 flex flex-1 flex-col gap-4">
          <h1 className="text-3xl text-slate-950 dark:text-slate-200 font-bold">
            Pending Courses
          </h1>

          <PendingCourses courses={pendingCourses} />
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
