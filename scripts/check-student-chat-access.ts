// Load environment variables
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { connectToDatabase } from "../lib/mongoose";
import CourseChatRoom from "../lib/models/course-chat-room.model";
import Course from "../lib/models/course.model";
import User from "../lib/models/user.model";

/**
 * This script checks if students have access to group chats
 */
async function checkStudentChatAccess() {
  try {
    console.log("🔄 Connecting to database...");
    await connectToDatabase();

    // Ensure all models are loaded
    await User.find();
    await Course.find();
    await CourseChatRoom.find();

    console.log("🔍 Finding all regular courses with students...");
    
    // Find a sample course with students
    const sampleCourse = await Course.findOne({
      courseType: { $in: ['regular', 'Regular'] },
      chatRoom: { $exists: true, $ne: null },
      students: { $exists: true, $ne: [] }
    }).populate("instructor").populate("students").populate("chatRoom");

    if (!sampleCourse) {
      console.log("❌ No courses with students found");
      process.exit(0);
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log(`📚 SAMPLE COURSE: ${sampleCourse.title}`);
    console.log(`   Course ID: ${sampleCourse._id}`);
    console.log(`   Enrolled Students: ${sampleCourse.students?.length || 0}`);
    console.log(`   Chat Room: ${sampleCourse.chatRoom ? '✅ Exists' : '❌ Missing'}`);

    if (!sampleCourse.chatRoom) {
      console.log("❌ Course has no chat room!");
      process.exit(0);
    }

    const chatRoomId = sampleCourse.chatRoom._id.toString();
    console.log(`   Chat Room ID: ${chatRoomId}`);

    const chatRoom = await CourseChatRoom.findById(chatRoomId);
    console.log(`   Chat members: ${chatRoom?.students?.length || 0}`);

    // Check first 3 students
    console.log(`\n👥 CHECKING STUDENTS:`);
    const studentsToCheck = sampleCourse.students.slice(0, 3);

    for (const student of studentsToCheck) {
      const studentId = student._id.toString();
      const studentUser = await User.findById(studentId);

      if (!studentUser) {
        console.log(`   ⚠️ Student not found: ${studentId}`);
        continue;
      }

      const joinedRooms = (studentUser.joinedChatRooms || []).map((id: any) => id.toString());
      const isInJoinedRooms = joinedRooms.includes(chatRoomId);
      
      const chatMembers = (chatRoom?.students || []).map((id: any) => id.toString());
      const isInChatMembers = chatMembers.includes(studentId);

      console.log(`\n   📝 Student: ${studentUser.username || studentUser.email}`);
      console.log(`      In joinedChatRooms: ${isInJoinedRooms ? '✅' : '❌'}`);
      console.log(`      In chat members: ${isInChatMembers ? '✅' : '❌'}`);
      console.log(`      Total joinedChatRooms: ${joinedRooms.length}`);
      
      if (!isInJoinedRooms || !isInChatMembers) {
        console.log(`      🔴 PROBLEM FOUND: Student cannot see group chat!`);
      } else {
        console.log(`      ✅ All good - student has full access`);
      }
    }

    console.log(`\n${'='.repeat(80)}`);

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run the script
checkStudentChatAccess();
