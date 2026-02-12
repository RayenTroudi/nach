import { connectToDatabase } from "@/lib/mongoose";
import Course from "@/lib/models/course.model";
import User from "@/lib/models/user.model";
import PrivateChatRoom from "@/lib/models/private-chat-room.model";
import { NextResponse } from "next/server";
import { CourseTypeEnum } from "@/lib/enums";

/**
 * POST /api/fix-private-chats
 * Creates missing private chat rooms for all enrolled students
 */
export async function POST() {
  try {
    await connectToDatabase();

    await User.find();
    await Course.find();
    await PrivateChatRoom.find();

    console.log("🔍 Finding all regular courses with students...");
    
    const allCourses = await Course.find({
      courseType: { $in: ['regular', 'Regular', CourseTypeEnum.Regular] },
      students: { $exists: true, $ne: [] }
    }).populate("instructor").populate("students");

    let totalPrivateChatsCreated = 0;
    let coursesProcessed = 0;
    const details: any[] = [];

    console.log(`📊 Found ${allCourses.length} Regular courses with students`);

    for (const course of allCourses) {
      if (!course.instructor) {
        continue;
      }

      coursesProcessed++;
      const courseDetails: any = {
        courseTitle: course.title,
        courseId: course._id,
        instructorId: course.instructor._id,
        enrolledStudents: course.students?.length || 0,
        privateChatsCreated: 0,
        privateChatsExisting: 0
      };

      const instructorId = course.instructor._id.toString();

      if (course.students && course.students.length > 0) {
        for (const student of course.students) {
          const studentId = student._id.toString();

          // Check if private chat already exists
          const existingPrivateChat = await PrivateChatRoom.findOne({
            courseId: course._id,
            student: studentId,
            instructor: instructorId,
          });

          if (existingPrivateChat) {
            courseDetails.privateChatsExisting++;
            
            // Verify both users have it in their privateChatRooms array
            const studentUser = await User.findById(studentId);
            const instructorUser = await User.findById(instructorId);
            
            const studentHasChat = studentUser?.privateChatRooms?.some(
              (id: any) => id.toString() === existingPrivateChat._id.toString()
            );
            const instructorHasChat = instructorUser?.privateChatRooms?.some(
              (id: any) => id.toString() === existingPrivateChat._id.toString()
            );

            // Add to arrays if missing
            if (!studentHasChat) {
              await User.findByIdAndUpdate(studentId, {
                $addToSet: { privateChatRooms: existingPrivateChat._id }
              });
              console.log(`  ✅ Added existing private chat to student: ${studentUser?.username}`);
            }
            if (!instructorHasChat) {
              await User.findByIdAndUpdate(instructorId, {
                $addToSet: { privateChatRooms: existingPrivateChat._id }
              });
              console.log(`  ✅ Added existing private chat to instructor`);
            }
            continue;
          }

          // Create new private chat room
          const privateChatRoom = await PrivateChatRoom.create({
            courseId: course._id,
            student: studentId,
            instructor: instructorId,
            isActive: true,
          });

          // Add to both users' privateChatRooms arrays
          await User.findByIdAndUpdate(studentId, {
            $addToSet: { privateChatRooms: privateChatRoom._id }
          });
          await User.findByIdAndUpdate(instructorId, {
            $addToSet: { privateChatRooms: privateChatRoom._id }
          });

          console.log(`  ✅ Created private chat: ${privateChatRoom._id}`);
          courseDetails.privateChatsCreated++;
          totalPrivateChatsCreated++;
        }
      }

      details.push(courseDetails);
    }

    return NextResponse.json({
      success: true,
      message: "Private chats fixed successfully",
      coursesProcessed,
      totalPrivateChatsCreated,
      details
    }, { status: 200 });

  } catch (error: any) {
    console.error("Fix private chats error:", error);
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
 * GET /api/fix-private-chats
 * Checks private chat status
 */
export async function GET() {
  try {
    await connectToDatabase();

    await User.find();
    await Course.find();
    await PrivateChatRoom.find();

    const sampleCourse = await Course.findOne({
      courseType: { $in: ['regular', 'Regular', CourseTypeEnum.Regular] },
      students: { $exists: true, $ne: [] }
    }).populate("instructor").populate("students");

    if (!sampleCourse) {
      return NextResponse.json({
        success: true,
        message: "No courses with students found"
      }, { status: 200 });
    }

    const instructorId = sampleCourse.instructor._id.toString();
    const privateChatsStatus: any[] = [];

    for (const student of sampleCourse.students.slice(0, 5)) {
      const studentId = student._id.toString();
      
      const privateChat = await PrivateChatRoom.findOne({
        courseId: sampleCourse._id,
        student: studentId,
        instructor: instructorId,
      });

      const studentUser = await User.findById(studentId);
      const instructorUser = await User.findById(instructorId);

      const studentHasInArray = studentUser?.privateChatRooms?.some(
        (id: any) => id.toString() === privateChat?._id?.toString()
      );
      const instructorHasInArray = instructorUser?.privateChatRooms?.some(
        (id: any) => id.toString() === privateChat?._id?.toString()
      );

      privateChatsStatus.push({
        studentUsername: studentUser?.username || studentUser?.email,
        privateChatExists: !!privateChat,
        privateChatId: privateChat?._id?.toString() || null,
        studentHasInArray: !!studentHasInArray,
        instructorHasInArray: !!instructorHasInArray,
        hasFullAccess: !!privateChat && studentHasInArray && instructorHasInArray
      });
    }

    return NextResponse.json({
      success: true,
      sampleCourse: {
        title: sampleCourse.title,
        id: sampleCourse._id,
        enrolledStudents: sampleCourse.students.length,
        instructorUsername: sampleCourse.instructor.username
      },
      privateChatsStatus,
      hasIssues: privateChatsStatus.some(s => !s.hasFullAccess)
    }, { status: 200 });

  } catch (error: any) {
    console.error("Check private chats error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
