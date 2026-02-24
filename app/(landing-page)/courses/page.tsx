import { Metadata } from "next";
import CoursesContent from "./_components";
import { getAllPublishedCourses } from "@/lib/actions/course.action";
import { CourseTypeEnum } from "@/lib/enums";
import { TCourse } from "@/types/models.types";

export const metadata: Metadata = {
  title: "All Courses | Germany Formation",
  description: "Explore all our courses to help you succeed in Germany. From language learning to career preparation.",
};

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  // Fetch courses server-side like the homepage does
  let courses: TCourse[] = [];
  
  try {
    const allCourses = await getAllPublishedCourses();
    
    // Filter for regular courses only
    courses = allCourses.filter(
      (course) => course.courseType === CourseTypeEnum.Regular
    );
  } catch (error: any) {
    console.error("Error fetching courses:", error);
  }

  return <CoursesContent initialCourses={courses} />;
}
