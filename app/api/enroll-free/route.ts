import { auth } from "@clerk/nextjs";
import { connectToDatabase } from "@/lib/mongoose";
import Course from "@/lib/models/course.model";
import User from "@/lib/models/user.model";
import { NextResponse } from "next/server";
import { createPrivateChatRoom } from "@/lib/actions/private-chat-room.action";
import { CourseTypeEnum } from "@/lib/enums";

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

    // For regular courses, add student to group chat and create private chat
    if (course.courseType === CourseTypeEnum.Regular) {
      // Add student to group chat room
      try {
        const courseWithChatRoom = await Course.findById(courseId).populate("chatRoom");
        if (courseWithChatRoom?.chatRoom?._id) {
          // Import the functions we need
          const { pushStudentToChatRoom } = await import("@/lib/actions/course-chat-room");
          const { joinChatRoom } = await import("@/lib/actions/user.action");
          
          // Add chat room to user's joinedChatRooms array
          await joinChatRoom(user._id.toString(), courseWithChatRoom.chatRoom._id.toString());
          
          // Add student to chat room's students array
          await pushStudentToChatRoom({
            chatRoomId: courseWithChatRoom.chatRoom._id.toString(),
            studentId: user._id.toString(),
          });
          
          console.log("Student added to group chat room successfully");
        } else {
          console.log("Warning: Regular course has no group chat room");
        }
      } catch (groupChatError: any) {
        console.log("Warning: Failed to add student to group chat:", groupChatError.message);
        // Don't fail the enrollment if group chat enrollment fails
      }

      // Create private chat room with instructor
      try {
        await createPrivateChatRoom({
          courseId: course._id.toString(),
          studentId: user._id.toString(),
          instructorId: course.instructor.toString(),
        });
        console.log("Private chat room created for free course enrollment");
      } catch (chatError: any) {
        console.log("Warning: Failed to create private chat room:", chatError.message);
        // Don't fail the enrollment if chat room creation fails
      }
    }

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
