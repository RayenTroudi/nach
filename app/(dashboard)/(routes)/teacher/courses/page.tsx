import { Button } from "@/components/ui/button";
import Link from "next/link";

import { getTeacherCourses } from "@/lib/actions/user.action";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { TeacherCourses } from "./_components";
import NoCoursesAnimation from "@/components/shared/animations/NoCourses";
import { PlusCircle } from "lucide-react";
import { TUser } from "@/types/models.types";

const TeacherCoursesPage = async () => {
  const { userId } = auth();

  if (!userId) return redirect("/sign-in");

  let instructor: TUser = {} as TUser;
  try {
    instructor = await getTeacherCourses({
      clerkId: userId,
    });
  } catch (error: any) {
    console.log(error);
  }

  return (
    <div className="flex items-center justify-between  flex-col gap-4 p-6">
      {!instructor?.createdCourses?.length ? (
        <div className="w-full flex flex-col gap-6">
          <div className="w-full p-4 border border-input rounded-md flex justify-center items-center">
            <div className="flex flex-col justify-center items-center gap-y-3">
              <h1 className="text-3xl font-bold text-slate-950 dark:text-slate-200 text-center">
                Hey{" "}
                <span className="text-[#FF782D]"> {instructor.username} </span>
              </h1>
              <p className="text-md lg:text-lg text-slate-700 dark:text-slate-300 text-center">
                Start creating your courses now and share your knowledge with
                the world
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-y-2">
            <NoCoursesAnimation />
            <Link
              href="/teacher/courses/manage"
              className="w-full flex items-center justify-center"
            >
              <Button className="w-full  md:w-[400px] flex items-center gap-x-2 h-[48px] bg-[#FF782D] font-semibold hover:bg-[#FF782D] opacity-90 hover:opacity-100 text-slate-50">
                <PlusCircle size={20} className="text-slate-50" />
                <p className="">Create New Course Now </p>
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <TeacherCourses instructor={instructor} />
      )}
    </div>
  );
};

export default TeacherCoursesPage;
