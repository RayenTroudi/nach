import { connectToDatabase } from "../lib/mongoose";
import Course from "../lib/models/course.model";
import CourseChatRoom from "../lib/models/course-chat-room.model";
import { CourseTypeEnum } from "../lib/enums";

/**
 * This script fixes courses that don't have chat rooms by creating them
 * and adding all existing students to the chat room
 */
async function fixMissingChatRooms() {
  try {
    console.log("🔄 Connecting to database...");
    await connectToDatabase();

    console.log("🔍 Finding courses without chat rooms...");
    
    // Find all regular courses without chat rooms
    const coursesWithoutChatRooms = await Course.find({
      courseType: CourseTypeEnum.Regular,
      $or: [
        { chatRoom: null },
        { chatRoom: { $exists: false } }
      ]
    }).populate("instructor").populate("students");

    console.log(`📊 Found ${coursesWithoutChatRooms.length} courses without chat rooms`);

    if (coursesWithoutChatRooms.length === 0) {
      console.log("✅ All regular courses have chat rooms!");
      return;
    }

    // Fix each course
    for (const course of coursesWithoutChatRooms) {
      console.log(`\n🔧 Fixing course: ${course.title} (ID: ${course._id})`);
      
      try {
        // Create chat room with instructor and existing students
        const studentsArray = course.students || [];
        const allParticipants = [course.instructor._id, ...studentsArray];
        
        const chatRoom = await CourseChatRoom.create({
          courseId: course._id,
          instructorAdmin: course.instructor._id,
          students: allParticipants, // Add instructor and all existing students
        });

        console.log(`  ✅ Created chat room: ${chatRoom._id}`);

        // Update course with chat room reference
        await Course.findByIdAndUpdate(course._id, {
          chatRoom: chatRoom._id,
        });

        console.log(`  ✅ Updated course with chat room reference`);

        // Update instructor's ownChatRooms AND joinedChatRooms
        const User = (await import("../lib/models/user.model")).default;
        await User.findByIdAndUpdate(course.instructor._id, {
          $addToSet: { 
            ownChatRooms: chatRoom._id,
            joinedChatRooms: chatRoom._id  // IMPORTANT: Instructor must also join
          }
        });

        console.log(`  ✅ Added chat room to instructor's owned and joined rooms`);

        // Update each student's joinedChatRooms
        if (course.students && course.students.length > 0) {
          for (const student of course.students) {
            await User.findByIdAndUpdate(student._id || student, {
              $addToSet: { joinedChatRooms: chatRoom._id }
            });
          }
          console.log(`  ✅ Added ${course.students.length} students to chat room`);
        }

      } catch (error: any) {
        console.error(`  ❌ Error fixing course ${course._id}:`, error.message);
      }
    }

    console.log("\n✅ Chat room fix completed!");

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

// Run the script
fixMissingChatRooms()
  .then(() => {
    console.log("\n🎉 Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Script failed:", error);
    process.exit(1);
  });
