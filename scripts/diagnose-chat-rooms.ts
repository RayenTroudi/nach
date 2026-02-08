// Load environment variables
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { connectToDatabase } from "../lib/mongoose";
import CourseChatRoom from "../lib/models/course-chat-room.model";
import Course from "../lib/models/course.model";
import User from "../lib/models/user.model";

/**
 * This script diagnoses chat room issues by showing detailed information
 * about courses, instructors, and chat room memberships
 */
async function diagnoseChatRooms() {
  try {
    console.log("🔄 Connecting to database...");
    await connectToDatabase();

    // Ensure all models are loaded
    await User.find();
    await Course.find();
    await CourseChatRoom.find();

    console.log("🔍 Finding all Regular courses with chat rooms...\n");
    
    // Find all regular courses with chat rooms
    const allCourses = await Course.find({
      courseType: 'regular',
    }).populate("instructor").populate("students").populate("chatRoom");

    console.log(`📊 Found ${allCourses.length} Regular courses\n`);
    console.log("=".repeat(80));

    for (const course of allCourses) {
      console.log(`\n📚 COURSE: ${course.title}`);
      console.log(`   ID: ${course._id}`);
      console.log(`   Type: ${course.courseType}`);
      console.log(`   Students enrolled: ${course.students?.length || 0}`);
      console.log(`   Chat Room Reference: ${course.chatRoom ? course.chatRoom._id || course.chatRoom : 'NULL/MISSING'}`);
      
      if (!course.instructor) {
        console.log(`   ⚠️ WARNING: No instructor found!`);
        continue;
      }

      const instructorId = course.instructor._id.toString();
      console.log(`\n   👨‍🏫 INSTRUCTOR: ${course.instructor.username || course.instructor.email}`);
      console.log(`      ID: ${instructorId}`);
      
      // Get full instructor data
      const instructor = await User.findById(instructorId);
      console.log(`      ownChatRooms: ${instructor?.ownChatRooms?.length || 0}`);
      console.log(`      joinedChatRooms: ${instructor?.joinedChatRooms?.length || 0}`);
      console.log(`      privateChatRooms: ${instructor?.privateChatRooms?.length || 0}`);

      if (!course.chatRoom) {
        console.log(`   🔧 This course needs a chat room created.`);
        console.log(`   💡 Run: npm run fix:chat-rooms`);
        console.log(`\n   ❌ WARNING: Course has NO chat room!`);
        continue;
      }

      const chatRoomId = course.chatRoom._id.toString();
      console.log(`\n   💬 CHAT ROOM: ${chatRoomId}`);
      
      // Get full chat room data
      const chatRoom = await CourseChatRoom.findById(chatRoomId);
      console.log(`      instructorAdmin: ${chatRoom?.instructorAdmin}`);
      console.log(`      students array: ${chatRoom?.students?.length || 0} members`);
      console.log(`      messages: ${chatRoom?.messages?.length || 0}`);

      // Check memberships
      const isInOwnRooms = instructor?.ownChatRooms?.some(
        (id: any) => id.toString() === chatRoomId
      );
      const isInJoinedRooms = instructor?.joinedChatRooms?.some(
        (id: any) => id.toString() === chatRoomId
      );
      const isInStudents = chatRoom?.students?.some(
        (id: any) => id.toString() === instructorId
      );

      console.log(`\n   🔍 INSTRUCTOR MEMBERSHIP CHECK:`);
      console.log(`      ${isInOwnRooms ? '✅' : '❌'} In ownChatRooms (needed for teacher UI)`);
      console.log(`      ${isInJoinedRooms ? '✅' : '❌'} In joinedChatRooms (needed as participant)`);
      console.log(`      ${isInStudents ? '✅' : '❌'} In students array (needed to send messages)`);

      // List all students in the chat room
      if (chatRoom?.students && chatRoom.students.length > 0) {
        console.log(`\n   👥 CHAT ROOM MEMBERS (${chatRoom.students.length}):`);
        for (let i = 0; i < Math.min(5, chatRoom.students.length); i++) {
          const studentId = chatRoom.students[i];
          const student = await User.findById(studentId);
          const isInstructor = studentId.toString() === instructorId;
          console.log(`      ${i + 1}. ${student?.username || student?.email} ${isInstructor ? '(INSTRUCTOR)' : ''}`);
        }
        if (chatRoom.students.length > 5) {
          console.log(`      ... and ${chatRoom.students.length - 5} more`);
        }
      } else {
        console.log(`\n   ⚠️ WARNING: Chat room has NO members!`);
      }

      // Diagnosis
      console.log(`\n   🩺 DIAGNOSIS:`);
      if (!isInOwnRooms) {
        console.log(`      ⚠️ ISSUE: Instructor not in ownChatRooms - chat won't appear in teacher UI`);
      }
      if (!isInJoinedRooms) {
        console.log(`      ⚠️ ISSUE: Instructor not in joinedChatRooms - not marked as participant`);
      }
      if (!isInStudents) {
        console.log(`      ⚠️ ISSUE: Instructor not in students array - can't send messages`);
      }
      if (isInOwnRooms && isInJoinedRooms && isInStudents) {
        console.log(`      ✅ All good - instructor has full access`);
      }

      console.log("\n" + "=".repeat(80));
    }

    console.log(`\n✅ Diagnosis complete! Processed ${allCourses.length} courses`);

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run the script
diagnoseChatRooms();
