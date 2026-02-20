import Feedbacks from "@/app/(dashboard)/(routes)/(student)/my-learning/[courseId]/_components/Feedbacks";
import { getCourseById, getUserByClerkId } from "@/lib/actions";
import { TUser } from "@/types/models.types";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { StepBack } from "../../manage/[courseId]/sections/manage/[sectionId]/_components";

type Props = {
  params: {
    courseId: string;
  };
};

const CourseReviewPage = async ({ params }: Props) => {
  const { courseId } = params;
  const { userId } = auth();

  const course = await getCourseById({ courseId });
  const mongoUser = await getUserByClerkId({ clerkId: userId as string });

  if (!course) {
    return redirect("/404");
  }

  const feedbacks = course.feedbacks || [];

  if (!userId) {
    return redirect("/sign-in");
  }

  const isCourseOwner = course.instructor._id === mongoUser._id;
  const isAllowed = true;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-4">
        <StepBack />
        <h1 className="text-3xl font-bold ml-4">{course.title}</h1>
      </div>

      <Feedbacks
        isCourseOwner={isCourseOwner}
        course={course}
        feedbacks={feedbacks}
        user={mongoUser as TUser}
        isAllowed={isAllowed}
      />
    </div>
  );
};

export default CourseReviewPage;
