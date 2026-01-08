"use client";
import { LeftSideBar } from "@/components/shared";
import React, { useEffect, useState } from "react";

import { TCategory, TCourse, TUser } from "@/types/models.types";
import { useAuth } from "@clerk/nextjs";
import { getUserByClerkId } from "@/lib/actions";
import Courses from "./_components/Courses";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const NoCoursesAnimation = dynamic(
  () => import("@/components/shared/animations/NoCourses"),
  { ssr: false }
);

const MyLearningPage = () => {
  const t = useTranslations("dashboard.student.myLearning");
  const { userId } = useAuth();
  const router = useRouter();
  const [student, setStudent] = useState<TUser>({} as TUser);
  const [studentEnrolledCoursesCategories, setStudentEnrolledCoursesCategories] = useState<TCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    const fetchStudent = async () => {
      try {
        const fetchedStudent = await getUserByClerkId({ clerkId: userId! });
        setStudent(fetchedStudent);
        
        const categories = fetchedStudent?.enrolledCourses
          ?.filter(
            (course: TCourse, index: number, self: TCourse[]) =>
              index ===
              self.findIndex(
                (c: TCourse) => c.category._id === course.category._id
              )
          )
          ?.map((course: TCourse) => course.category) ?? [];
        
        setStudentEnrolledCoursesCategories(categories);
      } catch (error: any) {
        console.error("Error fetching student:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudent();
  }, [userId, router]);

  if (isLoading) {
    return (
      <div className="flex gap-4">
        <LeftSideBar />
        <div className="p-6 w-full flex items-center justify-center">
          <div className="text-slate-950 dark:text-slate-200">Loading...</div>
        </div>
      </div>
    );
  }
  
  return (
    <ProtectedRoute user={student}>
      <div className="flex gap-4">
        <LeftSideBar />
        <div className="p-6 w-full">
          <div className="flex flex-col items-start gap-10 ">
            {student?.enrolledCourses?.length ? (
              <>
                <h2 className="text-3xl font-bold text-slate-950 dark:text-slate-200">
                  {t("title")}
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
                    {t("noCoursesYet")}
                  </h1>
                  <Link href={"/"} className="w-full ">
                    <Button className="w-full bg-brand-red-500 rounded-sm font-bold text-slate-50 mt-2 hover:opacity-90 hover:bg-brand-red-600 duration-300 transition-all ease-in-out">
                      {t("startBrowsing")}
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
