import { connectToDatabase } from "@/lib/mongoose";
import User from "@/lib/models/user.model";
import Course from "@/lib/models/course.model";
import PrivateChatRoom from "@/lib/models/private-chat-room.model";
import CourseChatRoom from "@/lib/models/course-chat-room.model";
import { NextResponse } from "next/server";
import { CourseTypeEnum } from "@/lib/enums";

/**
 * GET /api/verify-chat-setup
 * Comprehensive verification of chat system setup
 */
export async function GET() {
  try {
    await connectToDatabase();

    await User.find();
    await Course.find();
    await PrivateChatRoom.find();
    await CourseChatRoom.find();

    const TALEL_CLERK_ID = "user_35hV3NV1RA4gd4NJQTWg7bSzYCJ";
    const talelUser = await User.findOne({ clerkId: TALEL_CLERK_ID });
    
    if (!talelUser) {
      return NextResponse.json({
        success: false,
        error: "Talel not found"
      }, { status: 404 });
    }

    // Get all regular courses with students
    const regularCourses = await Course.find({
      courseType: { $in: ['regular', 'Regular', CourseTypeEnum.Regular] },
      students: { $exists: true, $ne: [] }
    }).populate("instructor").populate("students").populate("chatRoom");

    const coursesSummary = [];

    for (const course of regularCourses) {
      const courseInfo: any = {
        courseTitle: course.title,
        courseId: course._id,
        instructor: course.instructor?.username || course.instructor?.email,
        studentsCount: course.students?.length || 0,
        hasGroupChat: !!course.chatRoom,
        groupChatId: course.chatRoom?._id || null,
        privateChats: []
      };

      // Check private chats for each student
      for (const student of course.students || []) {
        const studentId = student._id.toString();
        const instructorId = course.instructor._id.toString();

        const privateChat = await PrivateChatRoom.findOne({
          courseId: course._id,
          student: studentId,
          instructor: instructorId,
        });

        const studentUser = await User.findById(studentId);
        
        courseInfo.privateChats.push({
          studentUsername: studentUser?.username || studentUser?.email,
          hasPrivateChat: !!privateChat,
          privateChatId: privateChat?._id || null,
          instructorIsCorrect: instructorId === talelUser._id.toString()
        });
      }

      coursesSummary.push(courseInfo);
    }

    // Check Resume Service course
    const resumeServiceCourse = await Course.findOne({
      title: "Resume Service",
      instructor: talelUser._id
    });

    const resumeServiceInfo: any = {
      exists: !!resumeServiceCourse,
      courseId: resumeServiceCourse?._id || null,
      privateChatsCount: 0,
      privateChats: []
    };

    if (resumeServiceCourse) {
      const resumePrivateChats = await PrivateChatRoom.find({
        courseId: resumeServiceCourse._id,
        instructor: talelUser._id
      }).populate("student");

      resumeServiceInfo.privateChatsCount = resumePrivateChats.length;
      resumeServiceInfo.privateChats = resumePrivateChats.map(chat => ({
        chatId: chat._id,
        student: (chat.student as any)?.username || (chat.student as any)?.email || "Unknown"
      }));
    }

    // Overall statistics
    const totalGroupChats = regularCourses.filter(c => c.chatRoom).length;
    const totalPrivateChats = await PrivateChatRoom.countDocuments({
      instructor: talelUser._id
    });
    const totalStudentsEnrolled = regularCourses.reduce((sum, course) => sum + (course.students?.length || 0), 0);

    return NextResponse.json({
      success: true,
      instructor: {
        name: talelUser.username || talelUser.email,
        clerkId: TALEL_CLERK_ID,
        mongoId: talelUser._id
      },
      statistics: {
        totalRegularCourses: regularCourses.length,
        totalStudentsEnrolled,
        totalGroupChats,
        totalPrivateChats,
        coursesWithGroupChat: totalGroupChats,
        coursesMissingGroupChat: regularCourses.length - totalGroupChats
      },
      coursesSummary,
      resumeService: resumeServiceInfo,
      recommendations: {
        allCoursesHaveGroupChat: totalGroupChats === regularCourses.length,
        allStudentsHavePrivateChat: coursesSummary.every(c => 
          c.privateChats.every((p: any) => p.hasPrivateChat)
        )
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Verify chat setup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
