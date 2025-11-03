"use server";
import React from "react";
import { CourseCommunity } from "./_components";
import { getCourseById, getUserByClerkId } from "@/lib/actions";
import {
  TCourse,
  TUserProgress,
  TUser,
  TUserCourseVideoCompleted,
} from "@/types/models.types";
import { WatchScreen } from "@/components/shared";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { studentCourseExists } from "@/lib/actions/purchase.action";
import { isCourseOwner } from "@/lib/actions/course.action";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { getUserCourseProgress } from "@/lib/actions/user-progress.action";
import { getUserCourseCompletedVideos } from "@/lib/actions/user-course-video-completed.action";

const CourseIdPage = async ({ params }: { params: { courseId: string } }) => {
  const { userId } = auth();

  if (!userId) redirect("/sign-in");

  let course: TCourse = {} as TCourse;
  let user: TUser = {} as TUser;
  let userProgress: TUserProgress = {} as TUserProgress;
  let userCourseCompletedVideos: TUserCourseVideoCompleted[] =
    [] as TUserCourseVideoCompleted[];
  let isPurchased: boolean = false;
  let courseOwner: boolean = false;

  try {
    user = await getUserByClerkId({ clerkId: userId! });
    course = await getCourseById({ courseId: params.courseId });
    userProgress = await getUserCourseProgress({
      userId: user._id,
      courseId: course._id,
    });
    userCourseCompletedVideos = await getUserCourseCompletedVideos({
      userId: user._id,
      courseId: course._id,
    });
    isPurchased = await studentCourseExists(params.courseId);
    courseOwner = await isCourseOwner(course._id, user._id);
  } catch (error: any) {}

  if (!isPurchased && !courseOwner) redirect(`/course/${course._id}`);

  return (
    <ProtectedRoute user={user}>
      <div className="flex flex-col ">
        <WatchScreen
          user={user}
          course={course}
          isCourseOwner={user._id === course.instructor._id}
          userProgress={userProgress}
          userCourseCompletedVideos={userCourseCompletedVideos}
        />
        <CourseCommunity
          course={course}
          user={user}
          userProgress={userProgress}
        />
      </div>
    </ProtectedRoute>
  );
};

export default CourseIdPage;
