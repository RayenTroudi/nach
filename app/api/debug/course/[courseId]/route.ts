import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Course from "@/lib/models/course.model";

// Debug endpoint to check course data directly from DB
// Usage: GET /api/debug/course/[courseId]

export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    await connectToDatabase();
    
    const { courseId } = params;
    
    // Get raw course from database
    const course = await Course.findById(courseId).lean();
    
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Type assertion for the lean() result
    const courseData = course as any;

    return NextResponse.json({
      success: true,
      data: {
        _id: courseData._id,
        title: courseData.title,
        courseType: courseData.courseType,
        courseTypeType: typeof courseData.courseType,
        price: courseData.price,
        instructor: courseData.instructor,
        category: courseData.category,
        allFields: Object.keys(courseData),
        rawCourseType: JSON.stringify(courseData.courseType),
      },
      fullCourse: courseData,
    });
  } catch (error: any) {
    console.error("Debug course error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
