// Load environment variables
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { connectToDatabase } from "../lib/mongoose";
import CourseChatRoom from "../lib/models/course-chat-room.model";
import Course from "../lib/models/course.model";
import User from "../lib/models/user.model";

/**
 * This script adds instructors and all students to their course chat rooms' students array
 * so they appear as participants in the group chat
 */
async function addInstructorToChatRooms() {
  try {
    console.log("🔄 Connecting to database...");
    await connectToDatabase();

    // Ensure all models are loaded
    await User.find();
    await Course.find();
    await CourseChatRoom.find();

    console.log("🔍 Finding all courses and their chat rooms...");
    
    // Find all courses with chat rooms
    const allCourses = await Course.find({
      chatRoom: { $exists: true, $ne: null }
    }).populate("instructor").populate("students").populate("chatRoom");

    let fixedCount = 0;
    let skippedCount = 0;
    let studentsAdded = 0;

    for (const course of allCourses) {
      if (!course.chatRoom) continue;

      console.log(`\n🔍 Processing: ${course.title}`);
      
      const instructorId = course.instructor._id.toString();
      const courseStudents = course.students || [];
      const chatRoom = await CourseChatRoom.findById(course.chatRoom._id);
      
      if (!chatRoom) continue;

      const currentStudents = chatRoom.students || [];
      const currentStudentIds = currentStudents.map((id: any) => id.toString());
      
      // Build array of all participants (instructor + students)
      const allParticipantIds = [instructorId, ...courseStudents.map((s: any) => s._id.toString())];
      const uniqueParticipants = Array.from(new Set(allParticipantIds));
      
      // Find missing participants
      const missingParticipants = uniqueParticipants.filter(
        (id) => !currentStudentIds.includes(id)
      );

      if (missingParticipants.length > 0) {
        console.log(`  🔧 Adding ${missingParticipants.length} participants to chat room`);
        
        await CourseChatRoom.findByIdAndUpdate(chatRoom._id, {
          $addToSet: { students: { $each: missingParticipants } }
        });
        
        console.log(`  ✅ Added ${missingParticipants.length} participants`);
        fixedCount++;
        studentsAdded += missingParticipants.length;
      } else {
        console.log(`  ✓ All participants already present`);
        skippedCount++;
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`📊 Fixed: ${fixedCount} chat rooms`);
    console.log(`📊 Participants added: ${studentsAdded}`);
    console.log(`📊 Skipped: ${skippedCount} chat rooms (all participants already present)`);
    console.log(`📊 Total: ${allCourses.length} chat rooms processed`);

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run the script
addInstructorToChatRooms();
