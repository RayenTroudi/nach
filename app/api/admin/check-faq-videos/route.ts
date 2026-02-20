import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAllCourses } from "@/lib/actions/course.action";
import { getUserByClerkId } from "@/lib/actions/user.action";
import { CourseTypeEnum } from "@/lib/enums";

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByClerkId({ clerkId: userId });
    if (!user.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const allCourses = await getAllCourses();

    const coursesWithFaqVideo = allCourses.filter(
      (course: any) => course.faqVideo && course.faqVideo.trim() !== ""
    );

    const faqTypeCourses = allCourses.filter(
      (course: any) => course.courseType === CourseTypeEnum.Most_Frequent_Questions
    );

    const faqTypeWithoutVideo = faqTypeCourses.filter(
      (course: any) => !course.faqVideo || course.faqVideo.trim() === ""
    );

    const data = {
      summary: {
        totalCourses: allCourses.length,
        coursesWithFaqVideo: coursesWithFaqVideo.length,
        faqTypeCourses: faqTypeCourses.length,
        faqTypeMissingVideo: faqTypeWithoutVideo.length,
      },
      coursesWithFaqVideo: coursesWithFaqVideo.map((course: any) => ({
        id: course._id,
        title: course.title,
        faqVideo: course.faqVideo,
        courseType: course.courseType,
        isPublished: course.isPublished,
        hasThumbnail: !!course.thumbnail,
        videoSource: course.faqVideo.includes("utfs.io")
          ? "UploadThing"
          : course.faqVideo.includes("youtube") || course.faqVideo.includes("youtu.be")
          ? "YouTube"
          : "Unknown",
        fileKey: course.faqVideo.includes("utfs.io")
          ? course.faqVideo.split("/f/")[1] || null
          : null,
      })),
      faqTypeMissingVideo: faqTypeWithoutVideo.map((course: any) => ({
        id: course._id,
        title: course.title,
        isPublished: course.isPublished,
      })),
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
