// Load environment variables
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { connectToDatabase } from "../lib/mongoose";
import CourseChatRoom from "../lib/models/course-chat-room.model";
import Course from "../lib/models/course.model";
import User from "../lib/models/user.model";

/**
 * This script ensures instructors are in their own course group chats
 * by adding them to joinedChatRooms array (they're already in ownChatRooms)
 */
async function fixInstructorJoinedChatRooms() {
  try {
    console.log("🔄 Connecting to database...");
    await connectToDatabase();

    // Ensure all models are loaded
    await User.find();
    await Course.find();
    await CourseChatRoom.find();

    console.log("🔍 Finding all courses with chat rooms...");
    
    // Find all courses (not just those with chat rooms)
    const allCourses = await Course.find({
      courseType: { $in: ['regular', 'Regular'] }
    }).populate("instructor").populate("students").populate("chatRoom");

    let fixedCount = 0;
    let skippedCount = 0;
    let createdCount = 0;

    console.log(`📊 Found ${allCourses.length} Regular courses\n`);

    for (const course of allCourses) {
      if (!course.instructor) {
        console.log(`\n⚠️ Skipping course (no instructor): ${course.title}`);
        continue;
      }

      console.log(`\n🔍 Processing: ${course.title}`);
      console.log(`   Course ID: ${course._id}`);
      console.log(`   Course Type: ${course.courseType}`);
      
      const instructorId = course.instructor._id.toString();
      
      console.log(`   Instructor ID: ${instructorId}`);
      console.log(`   Instructor Name: ${course.instructor.username || course.instructor.email}`);
      
      // Check if chat room exists
      if (!course.chatRoom || !course.chatRoom._id) {
        console.log(`\n   ❌ Course has no chat room - creating one now...`);
        
        try {
          // Import the createCourseChatRoom function
          const { createCourseChatRoom } = await import("../lib/actions/course-chat-room");
          
          await createCourseChatRoom({
            courseId: course._id.toString(),
            instructorId: instructorId,
          });
          
          console.log(`   ✅ Created new chat room for this course`);
          createdCount++;
          
          // Re-fetch the course to get the new chat room
          const updatedCourse = await Course.findById(course._id).populate("chatRoom");
          if (!updatedCourse?.chatRoom) {
            console.log(`   ⚠️ Warning: Chat room created but not found on re-fetch`);
            continue;
          }
          
          course.chatRoom = updatedCourse.chatRoom;
          
          // Add all enrolled students to the chat room
          if (course.students && course.students.length > 0) {
            console.log(`   📝 Adding ${course.students.length} enrolled students to chat room...`);
            
            for (const student of course.students) {
              const studentId = student._id || student;
              
              // Add to chat room's students array
              await CourseChatRoom.findByIdAndUpdate(course.chatRoom._id, {
                $addToSet: { students: studentId }
              });
              
              // Add to student's joinedChatRooms
              await User.findByIdAndUpdate(studentId, {
                $addToSet: { joinedChatRooms: course.chatRoom._id }
              });
            }
            
            console.log(`   ✅ Added students to chat room`);
          }
        } catch (createError: any) {
          console.error(`   ❌ Failed to create chat room:`, createError.message);
          continue;
        }
      }
      
      const chatRoomId = course.chatRoom._id.toString();
      console.log(`   Chat Room ID: ${chatRoomId}`);
      
      // Get full instructor and chat room data
      const instructor = await User.findById(instructorId);
      const chatRoom = await CourseChatRoom.findById(chatRoomId);
      
      // Debug current state
      console.log(`\n   📋 Current State:`);
      console.log(`      ownChatRooms: ${instructor?.ownChatRooms?.length || 0} rooms`);
      console.log(`      joinedChatRooms: ${instructor?.joinedChatRooms?.length || 0} rooms`);
      console.log(`      chatRoom.students: ${chatRoom?.students?.length || 0} students`);
      
      const isInOwnRooms = instructor?.ownChatRooms?.some(
        (id: any) => id.toString() === chatRoomId
      );
      const isInJoinedRooms = instructor?.joinedChatRooms?.some(
        (id: any) => id.toString() === chatRoomId
      );
      const isInStudents = chatRoom?.students?.some(
        (id: any) => id.toString() === instructorId
      );
      
      console.log(`      In ownChatRooms: ${isInOwnRooms ? '✅' : '❌'}`);
      console.log(`      In joinedChatRooms: ${isInJoinedRooms ? '✅' : '❌'}`);
      console.log(`      In students array: ${isInStudents ? '✅' : '❌'}`);

      let needsFix = false;

      if (!isInJoinedRooms) {
        console.log(`\n   🔧 Adding instructor to joinedChatRooms`);
        await User.findByIdAndUpdate(instructorId, {
          $addToSet: { joinedChatRooms: chatRoomId }
        });
        needsFix = true;
      }

      if (!isInStudents) {
        console.log(`   🔧 Adding instructor to chat room students array`);
        await CourseChatRoom.findByIdAndUpdate(chatRoomId, {
          $addToSet: { students: instructorId }
        });
        needsFix = true;
      }
      
      if (!isInOwnRooms) {
        console.log(`   🔧 Adding chat room to instructor's ownChatRooms`);
        await User.findByIdAndUpdate(instructorId, {
          $addToSet: { ownChatRooms: chatRoomId }
        });
        needsFix = true;
      }

      if (needsFix) {
        console.log(`   ✅ Fixed instructor access for this course`);
        fixedCount++;
      } else {
        console.log(`   ✓ Instructor already has full access`);
        skippedCount++;
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`📊 Created: ${createdCount} new chat rooms`);
    console.log(`📊 Fixed: ${fixedCount} instructors`);
    console.log(`📊 Skipped: ${skippedCount} instructors (already had access)`);
    console.log(`📊 Total: ${allCourses.length} courses processed`);

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run the script
fixInstructorJoinedChatRooms();
