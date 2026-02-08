import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Course from "@/lib/models/course.model";
import CourseChatRoom from "@/lib/models/course-chat-room.model";
import { CourseTypeEnum } from "@/lib/enums";
import User from "@/lib/models/user.model";

/**
 * GET /api/fix-chat-rooms
 * Checks and fixes courses without chat rooms
 */
export async function GET() {
  try {
    await connectToDatabase();

    // Find all regular courses without chat rooms
    const coursesWithoutChatRooms = await Course.find({
      courseType: CourseTypeEnum.Regular,
      $or: [
        { chatRoom: null },
        { chatRoom: { $exists: false } }
      ]
    }).populate("instructor").populate("students");

    const totalRegularCourses = await Course.countDocuments({
      courseType: CourseTypeEnum.Regular
    });

    const coursesWithChatRooms = await Course.countDocuments({
      courseType: CourseTypeEnum.Regular,
      chatRoom: { $exists: true, $ne: null }
    });

    const report = {
      totalRegularCourses,
      coursesWithChatRooms,
      coursesWithoutChatRooms: coursesWithoutChatRooms.length,
      missingChatRoomCourses: coursesWithoutChatRooms.map(course => ({
        id: course._id,
        title: course.title,
        instructor: course.instructor?.username || course.instructor?._id,
        studentCount: course.students?.length || 0,
      }))
    };

    return NextResponse.json(report);
  } catch (error: any) {
    console.error("Error checking chat rooms:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/fix-chat-rooms
 * Fixes courses without chat rooms by creating them
 */
export async function POST() {
  try {
    await connectToDatabase();

    // Find all regular courses without chat rooms
    const coursesWithoutChatRooms = await Course.find({
      courseType: CourseTypeEnum.Regular,
      $or: [
        { chatRoom: null },
        { chatRoom: { $exists: false } }
      ]
    }).populate("instructor").populate("students");

    if (coursesWithoutChatRooms.length === 0) {
      return NextResponse.json({
        message: "All regular courses have chat rooms!",
        fixed: 0
      });
    }

    const fixed = [];
    const errors = [];

    // Fix each course
    for (const course of coursesWithoutChatRooms) {
      try {
        // Create chat room with instructor and all existing students
        const studentsArray = course.students || [];
        const allParticipants = [course.instructor._id, ...studentsArray];
        
        const chatRoom = await CourseChatRoom.create({
          courseId: course._id,
          instructorAdmin: course.instructor._id,
          students: allParticipants, // Add instructor and all existing students
        });

        // Update course with chat room reference
        await Course.findByIdAndUpdate(course._id, {
          chatRoom: chatRoom._id,
        });

        // Update instructor's ownChatRooms AND joinedChatRooms
        await User.findByIdAndUpdate(course.instructor._id, {
          $addToSet: { 
            ownChatRooms: chatRoom._id,
            joinedChatRooms: chatRoom._id  // IMPORTANT: Instructor must also join
          }
        });

        // Update each student's joinedChatRooms
        if (course.students && course.students.length > 0) {
          for (const student of course.students) {
            await User.findByIdAndUpdate(student._id || student, {
              $addToSet: { joinedChatRooms: chatRoom._id }
            });
          }
        }

        fixed.push({
          courseId: course._id,
          title: course.title,
          chatRoomId: chatRoom._id,
          studentsAdded: course.students?.length || 0
        });

      } catch (error: any) {
        errors.push({
          courseId: course._id,
          title: course.title,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      message: "Chat rooms fix completed",
      fixed: fixed.length,
      errors: errors.length,
      details: { fixed, errors }
    });

  } catch (error: any) {
    console.error("Error fixing chat rooms:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
