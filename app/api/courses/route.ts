import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Course from "@/lib/models/course.model";
import User from "@/lib/models/user.model";
import Category from "@/lib/models/category.model";
import { CourseTypeEnum, CourseStatusEnum } from "@/lib/enums";

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Connect to database
    try {
      await connectToDatabase();
    } catch (dbError: any) {
      console.error("Database connection error:", dbError);
      return NextResponse.json(
        { success: false, error: "Database connection failed", message: dbError.message },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

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

    // Fetch courses with error handling for populate
    let courses;
    try {
      courses = await Course.find(query)
        .populate({
          path: "instructor",
          select: "firstName lastName email photo picture username",
        })
        .populate({
          path: "category",
          select: "name",
        })
        .sort({ createdAt: -1 })
        .lean();
    } catch (queryError: any) {
      console.error("Query error:", queryError);
      // Try without populate if it fails
      try {
        courses = await Course.find(query)
          .sort({ createdAt: -1 })
          .lean();
      } catch (fallbackError: any) {
        console.error("Fallback query error:", fallbackError);
        return NextResponse.json(
          { success: false, error: "Failed to fetch courses", message: fallbackError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      courses,
      count: courses.length,
    });
  } catch (error: any) {
    console.error("Unexpected error fetching courses:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch courses", message: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
