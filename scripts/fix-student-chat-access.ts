// Load environment variables
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { connectToDatabase } from "../lib/mongoose";
import CourseChatRoom from "../lib/models/course-chat-room.model";
import Course from "../lib/models/course.model";
import User from "../lib/models/user.model";

/**
 * This script ensures all enrolled students have access to group chats
 * by adding them to joinedChatRooms array and the chat room's students array
 */
async function fixStudentChatAccess() {
  try {
    console.log("🔄 Connecting to database...");
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

    console.log(`📊 Found ${allCourses.length} Regular courses with chat rooms\n`);

    for (const course of allCourses) {
      if (!course.chatRoom || !course.instructor) {
        continue;
      }

      coursesProcessed++;
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📚 COURSE: ${course.title}`);
      console.log(`   Course ID: ${course._id}`);
      console.log(`   Chat Room ID: ${course.chatRoom._id}`);
      console.log(`   Enrolled Students: ${course.students?.length || 0}`);

      const chatRoomId = course.chatRoom._id.toString();
      const chatRoom = await CourseChatRoom.findById(chatRoomId);

      if (!chatRoom) {
        console.log(`   ⚠️ WARNING: Chat room not found!`);
        continue;
      }

      const currentChatMembers = (chatRoom.students || []).map((id: any) => id.toString());
      console.log(`   Current chat members: ${currentChatMembers.length}`);

      // Process each enrolled student
      if (course.students && course.students.length > 0) {
        let studentsFixedInThisCourse = 0;

        for (const student of course.students) {
          const studentId = student._id.toString();
          const studentUser = await User.findById(studentId);

          if (!studentUser) {
            console.log(`   ⚠️ Student not found: ${studentId}`);
            continue;
          }

          const studentJoinedRooms = (studentUser.joinedChatRooms || []).map((id: any) => id.toString());
          const isInJoinedRooms = studentJoinedRooms.includes(chatRoomId);
          const isInChatMembers = currentChatMembers.includes(studentId);

          let needsFix = false;

          // Check if student needs to be added to joinedChatRooms
          if (!isInJoinedRooms) {
            console.log(`   🔧 Adding ${studentUser.username || studentUser.email} to joinedChatRooms`);
            await User.findByIdAndUpdate(studentId, {
              $addToSet: { joinedChatRooms: chatRoomId }
            });
            needsFix = true;
          }

          // Check if student needs to be added to chat room members
          if (!isInChatMembers) {
            console.log(`   🔧 Adding ${studentUser.username || studentUser.email} to chat members`);
            await CourseChatRoom.findByIdAndUpdate(chatRoomId, {
              $addToSet: { students: studentId }
            });
            needsFix = true;
          }

          if (needsFix) {
            studentsFixedInThisCourse++;
            totalStudentsFixed++;
          } else {
            console.log(`   ✅ ${studentUser.username || studentUser.email} - already has access`);
          }
        }

        if (studentsFixedInThisCourse > 0) {
          console.log(`   ✅ Fixed ${studentsFixedInThisCourse} students in this course`);
        } else {
          console.log(`   ✅ All students already have proper access`);
        }
      } else {
        console.log(`   ℹ️ No students enrolled in this course`);
      }
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log(`\n✅ FIX COMPLETE!`);
    console.log(`   Courses processed: ${coursesProcessed}`);
    console.log(`   Students fixed: ${totalStudentsFixed}`);

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run the script
fixStudentChatAccess();
