import { getTeacherCourses } from "@/lib/actions/user.action";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { TeacherCourses } from "./_components";
import { TUser } from "@/types/models.types";
import { EmptyCoursesState } from "./_components/EmptyCoursesState";

export const dynamic = "force-dynamic";

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
        <EmptyCoursesState username={instructor.username} />
      ) : (
        <TeacherCourses instructor={instructor} />
      )}
    </div>
  );
};

export default TeacherCoursesPage;
