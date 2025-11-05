import { auth } from "@clerk/nextjs";
import { connectToDatabase } from "@/lib/mongoose";
import Course from "@/lib/models/course.model";
import User from "@/lib/models/user.model";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { success: false, message: "Course ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find user by Clerk ID
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Find course
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    // Check if course is free
    if (course.price > 0) {
      return NextResponse.json(
        { success: false, message: "This is not a free course" },
        { status: 400 }
      );
    }

    // Check if user is already enrolled
    if (course.students.includes(user._id)) {
      return NextResponse.json(
        { success: false, message: "You are already enrolled in this course" },
        { status: 400 }
      );
    }

    // Enroll user in the course
    course.students.push(user._id);
    await course.save();

    // Add course to user's enrolled courses
    if (!user.enrolledCourses) {
      user.enrolledCourses = [];
    }
    user.enrolledCourses.push(course._id);
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Successfully enrolled in the course",
        courseId: course._id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Free enrollment error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to enroll in the course",
      },
      { status: 500 }
    );
  }
}
