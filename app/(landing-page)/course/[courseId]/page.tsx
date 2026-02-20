import { getCourseById } from "@/lib/actions";

import { alreadyEnrolled, getUserByClerkId } from "@/lib/actions/user.action";
import { isCourseOwner } from "@/lib/actions/course.action";
import { TCourse } from "@/types/models.types";
import { TUser } from "../../../../types/models.types";
import { auth } from "@clerk/nextjs/server";
import { Spinner } from "@/components/shared";
import {
  CourseInfo,
  PurchaseCourseCard,
  PurchasePageHeader,
} from "./_components";

const PurchaseCoursePage = async ({
  params,
}: {
  params: { courseId: string };
}) => {
  const { userId } = auth();

  let user: TUser | null = null;
  let course: TCourse | null = null;
  let isEnrolled: boolean = false;
  let isOwner: boolean = false;

  try {
    // First, get the course
    course = await getCourseById({ courseId: params.courseId });
    
    // Then, if user is logged in, get user data
    if (userId) {
      try {
        user = await getUserByClerkId({ clerkId: userId! });
        
        if (user && user._id) {
          isOwner = await isCourseOwner(params.courseId, user._id);
          isEnrolled = await alreadyEnrolled(params.courseId, user._id);
          console.log("[course-detail] User enrollment status:", { 
            userId: user._id, 
            courseId: params.courseId, 
            isEnrolled, 
            isOwner,
            enrolledCourses: user.enrolledCourses,
          });
        }
      } catch (userError: any) {
        console.log("ERROR FETCHING USER DATA: ", userError.message);
        // Continue even if user fetch fails
      }
    }
  } catch (error: any) {
    console.log("ERROR FROM PURCHASE COURSE PAGE : ", error.message);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 pt-20">
      {course ? (
        <>
          {/* Hero Section with Background */}
          <div className="relative bg-gradient-to-r from-slate-900 via-brand-red-900 to-slate-900 dark:from-slate-950 dark:via-brand-red-950 dark:to-slate-950">
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
            <PurchasePageHeader course={course} />
          </div>

          {/* Main Content Grid */}
          <div className="container mx-auto px-4 py-8 lg:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Course Info */}
              <div className="lg:col-span-2 space-y-8">
                <CourseInfo course={course} />
              </div>

              {/* Right Column - Sticky Purchase Card */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-24">
                  <PurchaseCourseCard
                    course={course}
                    isEnrolled={isEnrolled}
                    isCourseOwner={isOwner}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="w-full h-[calc(100vh-200px)] flex items-center justify-center">
          <Spinner size={100} />
        </div>
      )}
    </div>
  );
};

export default PurchaseCoursePage;
