"use server";
import { LeftSideBar } from "@/components/shared";
import React from "react";

import { TCategory, TCourse, TUser } from "@/types/models.types";
import { auth } from "@clerk/nextjs";
import { getUserByClerkId } from "@/lib/actions";
import Courses from "./_components/Courses";
import NoCoursesAnimation from "@/components/shared/animations/NoCourses";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { redirect } from "next/navigation";

const MyLearningPage = async () => {
  const { userId } = auth();
  if (!userId) return redirect("/sign-in");
  let student: TUser = {} as TUser;
  let studentEnrolledCoursesCategories: TCategory[] = [] as TCategory[];

  try {
    student = await getUserByClerkId({ clerkId: userId! });
    studentEnrolledCoursesCategories =
      student?.enrolledCourses
        ?.filter(
          (course: TCourse, index: number, self: TCourse[]) =>
            index ===
            self.findIndex(
              (c: TCourse) => c.category._id === course.category._id
            )
        )
        ?.map((course: TCourse) => course.category) ?? [];
  } catch (error: any) {}
  return (
    <ProtectedRoute user={student}>
      <div className="flex gap-4">
        <LeftSideBar />
        <div className="p-6 w-full">
          <div className="flex flex-col items-start gap-10 ">
            {student?.enrolledCourses?.length ? (
              <>
                <h2 className="text-3xl font-bold text-slate-950 dark:text-slate-200">
                  My Learning
                </h2>
                <Courses
                  enrolledCourses={student?.enrolledCourses!}
                  enrolledCoursesCategories={studentEnrolledCoursesCategories}
                />
              </>
            ) : (
              <div className="w-full  flex flex-col gap-y-1 items-center px-6">
                <NoCoursesAnimation className="h-[300px] md:h-[500px]" />
                <div className="w-full md:w-[600px] mx-auto flex flex-col gap-y-1">
                  <h1 className="w-full text-center text-xl md:text-3xl text-slate-950 dark:text-slate-50 font-bold">
                    No Enrolled Courses Yet .
                  </h1>
                  <Link href={"/"} className="w-full ">
                    <Button className="w-full bg-brand-red-500 rounded-sm font-bold text-slate-50 mt-2 hover:opacity-90 hover:bg-brand-red-600 duration-300 transition-all ease-in-out">
                      Start Browsing
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default MyLearningPage;
