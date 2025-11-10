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

    // Build query
    const query: any = {
      status: CourseStatusEnum.Approved, // Only approved courses
    };

    // Filter by course type if specified
    if (type === "regular") {
      query.courseType = CourseTypeEnum.Regular;
    } else if (type === "faq") {
      query.courseType = CourseTypeEnum.Most_Frequent_Questions;
    }

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
