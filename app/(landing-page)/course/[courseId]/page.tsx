"use server";
import { getCourseById } from "@/lib/actions";

import { alreadyEnrolled, getUserByClerkId } from "@/lib/actions/user.action";
import { isCourseOwner } from "@/lib/actions/course.action";
import { TCourse } from "@/types/models.types";
import { TUser } from "../../../../types/models.types";
import { auth } from "@clerk/nextjs";
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

  let user: TUser = {} as TUser;
  let course: TCourse = {} as TCourse;
  let isEnrolled: boolean = false;
  let isOwner: boolean = false;

  try {
    if (userId) {
      user = await getUserByClerkId({ clerkId: userId! });
      isOwner = await isCourseOwner(params.courseId, user._id);
      isEnrolled = await alreadyEnrolled(params.courseId, user._id);
    }

    course = await getCourseById({ courseId: params.courseId });
  } catch (error: any) {
    console.log("ERROR FROM PURCHASE COURSE PAGE : ", error.message);
  }

  return (
    <div
      className="min-h-[calc(100vh-330px)] "
      style={{
        minHeight: "calc(100vh-330px)",
      }}
    >
      {course ? (
        <>
          <PurchaseCourseCard
            course={course}
            isEnrolled={isEnrolled}
            isCourseOwner={isOwner}
          />
          <PurchasePageHeader course={course} />
          <CourseInfo course={course} />
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Spinner size={100} />
        </div>
      )}
    </div>
  );
};

export default PurchaseCoursePage;
