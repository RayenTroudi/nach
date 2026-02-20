import { getCourseById, getUserByClerkId } from "@/lib/actions";
import { TCourse, TUserProgress, TUser } from "@/types/models.types";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CertificateInitialScreen from "./_components/CertificateInitialScreen";
import { getUserCourseProgress } from "@/lib/actions/user-progress.action";

const CertificatePage = async ({
  params,
}: {
  params: { courseId: string };
}) => {
  const { userId } = auth();

  if (!userId) return redirect("/sign-in");

  let user: TUser = {} as TUser;
  let course: TCourse = {} as TCourse;
  let userProgress: TUserProgress = {} as TUserProgress;

  try {
    user = await getUserByClerkId({ clerkId: userId! });
    course = await getCourseById({ courseId: params.courseId! });

    userProgress = await getUserCourseProgress({
      userId: user._id,
      courseId: course._id,
    });
  } catch (error: any) {
    console.log("Error: ", error.message);
  }

  return (
    <CertificateInitialScreen
      user={user}
      course={course}
      userProgress={userProgress}
    />
  );
};

export default CertificatePage;
