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
import { isCourseOwner } from "@/lib/actions/course.action";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { alreadyEnrolled } from "@/lib/actions/user.action";
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
    
    // Use alreadyEnrolled to match the logic in /course/[courseId]
    isPurchased = await alreadyEnrolled(params.courseId, user._id);
    courseOwner = await isCourseOwner(course._id, user._id);
    
    console.log("[my-learning] Access check:", {
      userId: user._id,
      courseId: params.courseId,
      isPurchased,
      courseOwner,
      enrolledCourses: user.enrolledCourses,
    });
  } catch (error: any) {
    console.error("[my-learning] Error loading course:", error);
    redirect(`/my-learning`);
  }

  if (!isPurchased && !courseOwner) {
    console.log("[my-learning] Access denied - redirecting to course page");
    redirect(`/course/${params.courseId}`);
  }

  return (
    <ProtectedRoute user={user}>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        {/* Video Player Section - Full Width, No Padding */}
        <div className="w-full bg-slate-950 dark:bg-black shadow-2xl">
          <WatchScreen
            user={user}
            course={course}
            isCourseOwner={user._id === course.instructor._id}
            userProgress={userProgress}
            userCourseCompletedVideos={userCourseCompletedVideos}
          />
        </div>

        {/* Course Community Section - Contained Width with Better Spacing */}
        <div className="w-full py-12 lg:py-16">
          <CourseCommunity
            course={course}
            user={user}
            userProgress={userProgress}
            isPurchased={isPurchased}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CourseIdPage;
