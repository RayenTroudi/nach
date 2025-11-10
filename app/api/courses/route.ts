import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Course from "@/lib/models/course.model";
import { CourseTypeEnum, CourseStatusEnum } from "@/lib/enums";

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    console.log("=== COURSES API DEBUG ===");
    console.log("Type param:", type);

    // Build query - show only published courses
    const query: any = {
      isPublished: true,
    };

    // Filter by course type if specified
    if (type === "regular") {
      query.courseType = CourseTypeEnum.Regular;
    } else if (type === "faq") {
      query.courseType = CourseTypeEnum.Most_Frequent_Questions;
    }

    console.log("Query:", JSON.stringify(query));
    console.log("CourseTypeEnum.Regular value:", CourseTypeEnum.Regular);

    const courses = await Course.find(query)
      .populate({
        path: "instructor",
        select: "firstName lastName email photo",
      })
      .populate({
        path: "category",
        select: "name",
      })
      .sort({ createdAt: -1 })
      .lean();

    console.log("Courses found:", courses.length);
    console.log("First course (if any):", courses[0] ? {
      title: courses[0].title,
      courseType: courses[0].courseType,
      isPublished: courses[0].isPublished
    } : "No courses");

    // Also check all courses without filters
    const allCourses = await Course.find({}).select('title courseType isPublished').lean();
    console.log("Total courses in DB:", allCourses.length);
    console.log("All courses:", allCourses);

    return NextResponse.json({
      success: true,
      courses,
      count: courses.length,
    });
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
