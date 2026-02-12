import { connectToDatabase } from "@/lib/mongoose";
import CourseChatRoom from "@/lib/models/course-chat-room.model";
import Course from "@/lib/models/course.model";
import User from "@/lib/models/user.model";
import { NextResponse } from "next/server";

/**
 * POST /api/fix-student-chat-access
 * Ensures all enrolled students have access to group chats
 */
export async function POST() {
  try {
    await connectToDatabase();

    // Ensure all models are loaded
    await User.find();
    await Course.find();
    await CourseChatRoom.find();

    console.log("🔍 Finding all regular courses with chat rooms...");
    
    // Find all regular courses with chat rooms
    const allCourses = await Course.find({
      courseType: { $in: ['regular', 'Regular'] },
      chatRoom: { $exists: true, $ne: null }
    }).populate("instructor").populate("students").populate("chatRoom");

    let totalStudentsFixed = 0;
    let coursesProcessed = 0;
    const details: any[] = [];

    console.log(`📊 Found ${allCourses.length} Regular courses with chat rooms`);

    for (const course of allCourses) {
      if (!course.chatRoom || !course.instructor) {
        continue;
      }

      coursesProcessed++;
      const courseDetails: any = {
        courseTitle: course.title,
        courseId: course._id,
        chatRoomId: course.chatRoom._id,
        enrolledStudents: course.students?.length || 0,
        studentsFixed: 0
      };

      const chatRoomId = course.chatRoom._id.toString();
      const chatRoom = await CourseChatRoom.findById(chatRoomId);

      if (!chatRoom) {
        courseDetails.error = "Chat room not found";
        details.push(courseDetails);
        continue;
      }

      const currentChatMembers = (chatRoom.students || []).map((id: any) => id.toString());

      // Process each enrolled student
      if (course.students && course.students.length > 0) {
        for (const student of course.students) {
          const studentId = student._id.toString();
          const studentUser = await User.findById(studentId);

          if (!studentUser) {
            continue;
          }

          const studentJoinedRooms = (studentUser.joinedChatRooms || []).map((id: any) => id.toString());
          const isInJoinedRooms = studentJoinedRooms.includes(chatRoomId);
          const isInChatMembers = currentChatMembers.includes(studentId);

          let needsFix = false;

          // Check if student needs to be added to joinedChatRooms
          if (!isInJoinedRooms) {
            await User.findByIdAndUpdate(studentId, {
              $addToSet: { joinedChatRooms: chatRoomId }
            });
            needsFix = true;
          }

          // Check if student needs to be added to chat room members
          if (!isInChatMembers) {
            await CourseChatRoom.findByIdAndUpdate(chatRoomId, {
              $addToSet: { students: studentId }
            });
            needsFix = true;
          }

          if (needsFix) {
            courseDetails.studentsFixed++;
            totalStudentsFixed++;
          }
        }
      }

      details.push(courseDetails);
    }

    return NextResponse.json({
      success: true,
      message: "Student chat access fixed successfully",
      coursesProcessed,
      totalStudentsFixed,
      details
    }, { status: 200 });

  } catch (error: any) {
    console.error("Fix student chat access error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/fix-student-chat-access
 * Checks student chat access status
 */
export async function GET() {
  try {
    await connectToDatabase();

    await User.find();
    await Course.find();
    await CourseChatRoom.find();

    // Find a sample course with students
    const sampleCourse = await Course.findOne({
      courseType: { $in: ['regular', 'Regular'] },
      chatRoom: { $exists: true, $ne: null },
      students: { $exists: true, $ne: [] }
    }).populate("instructor").populate("students").populate("chatRoom");

    if (!sampleCourse) {
      return NextResponse.json({
        success: true,
        message: "No courses with students found"
      }, { status: 200 });
    }

    const chatRoomId = sampleCourse.chatRoom._id.toString();
    const chatRoom = await CourseChatRoom.findById(chatRoomId);

    const studentsStatus: any[] = [];

    // Check first 5 students
    const studentsToCheck = sampleCourse.students.slice(0, 5);

    for (const student of studentsToCheck) {
      const studentId = student._id.toString();
      const studentUser = await User.findById(studentId);

      if (!studentUser) continue;

      const joinedRooms = (studentUser.joinedChatRooms || []).map((id: any) => id.toString());
      const isInJoinedRooms = joinedRooms.includes(chatRoomId);
      
      const chatMembers = (chatRoom?.students || []).map((id: any) => id.toString());
      const isInChatMembers = chatMembers.includes(studentId);

      studentsStatus.push({
        username: studentUser.username || studentUser.email,
        hasAccess: isInJoinedRooms && isInChatMembers,
        inJoinedChatRooms: isInJoinedRooms,
        inChatMembers: isInChatMembers,
        totalJoinedRooms: joinedRooms.length
      });
    }

    return NextResponse.json({
      success: true,
      sampleCourse: {
        title: sampleCourse.title,
        id: sampleCourse._id,
        enrolledStudents: sampleCourse.students.length,
        chatRoomId
      },
      studentsStatus,
      hasIssues: studentsStatus.some(s => !s.hasAccess)
    }, { status: 200 });

  } catch (error: any) {
    console.error("Check student chat access error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
