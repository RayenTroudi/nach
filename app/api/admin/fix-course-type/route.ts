import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { connectToDatabase } from "@/lib/mongoose";
import Course from "@/lib/models/course.model";
import { getUserByClerkId } from "@/lib/actions/user.action";

// This route allows admins to manually set a course's type
// Usage: POST /api/admin/fix-course-type
// Body: { courseId: "xxx", courseType: "most_frequent_questions" }

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    const user = await getUserByClerkId({ clerkId: userId });
    if (!user.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { courseId, courseType } = await req.json();

    if (!courseId || !courseType) {
      return NextResponse.json(
        { error: "courseId and courseType are required" },
        { status: 400 }
      );
    }

    // First get the course
    const existingCourse = await Course.findById(courseId);
    if (!existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Update with proper price
    const updateData: any = { courseType };
    if (courseType === "most_frequent_questions") {
      updateData.price = 0;
    }

    const course = await Course.findByIdAndUpdate(
      courseId,
      updateData,
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: `Course type updated to ${courseType}`,
      course: {
        id: course._id,
        title: course.title,
        courseType: course.courseType,
        price: course.price,
      },
    });
  } catch (error: any) {
    console.error("Fix course type error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
