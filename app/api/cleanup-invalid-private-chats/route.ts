import { connectToDatabase } from "@/lib/mongoose";
import User from "@/lib/models/user.model";
import PrivateChatRoom from "@/lib/models/private-chat-room.model";
import { NextResponse } from "next/server";

/**
 * POST /api/cleanup-invalid-private-chats
 * Removes private chats that are not between instructor and student
 */
export async function POST() {
  try {
    await connectToDatabase();

    await User.find();
    await PrivateChatRoom.find();

    // Talel's clerk ID
    const INSTRUCTOR_CLERK_ID = "user_35hV3NV1RA4gd4NJQTWg7bSzYCJ";
    
    // Find Talel's MongoDB ID
    const talelUser = await User.findOne({ clerkId: INSTRUCTOR_CLERK_ID });
    
    if (!talelUser) {
      return NextResponse.json({
        success: false,
        error: "Instructor not found"
      }, { status: 404 });
    }

    const talelId = talelUser._id.toString();
    console.log("Talel's MongoDB ID:", talelId);

    // Find all private chats
    const allPrivateChats = await PrivateChatRoom.find({})
      .populate("student")
      .populate("instructor");

    let invalidChats = 0;
    let validChats = 0;
    const invalidChatDetails: any[] = [];

    for (const chat of allPrivateChats) {
      // Skip if instructor or student is null
      if (!chat.instructor || !chat.student) {
        console.log(`Skipping chat with null participant: ${chat._id}`);
        // Delete this broken chat
        await PrivateChatRoom.findByIdAndDelete(chat._id);
        invalidChats++;
        continue;
      }

      const instructor = chat.instructor as any;
      const student = chat.student as any;
      const instructorId = instructor._id.toString();
      const studentId = student._id.toString();

      // Check if this is a valid instructor-student chat
      const isValidChat = instructorId === talelId || studentId === talelId;

      if (!isValidChat) {
        // This is an invalid chat (student-to-student or wrong instructor)
        invalidChats++;
        invalidChatDetails.push({
          chatId: chat._id,
          student: student.username || student.email,
          instructor: instructor.username || instructor.email,
          studentIsAdmin: student.isAdmin,
          instructorIsAdmin: instructor.isAdmin
        });

        // Remove from both users' privateChatRooms arrays
        await User.findByIdAndUpdate(studentId, {
          $pull: { privateChatRooms: chat._id }
        });
        await User.findByIdAndUpdate(instructorId, {
          $pull: { privateChatRooms: chat._id }
        });

        // Delete the private chat room
        await PrivateChatRoom.findByIdAndDelete(chat._id);

        console.log(`Deleted invalid private chat: ${chat._id}`);
      } else {
        validChats++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Invalid private chats cleaned up",
      instructorName: talelUser.username || talelUser.email,
      totalPrivateChats: allPrivateChats.length,
      validChats,
      invalidChats,
      invalidChatDetails
    }, { status: 200 });

  } catch (error: any) {
    console.error("Cleanup invalid private chats error:", error);
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
 * GET /api/cleanup-invalid-private-chats
 * Checks for invalid private chats
 */
export async function GET() {
  try {
    await connectToDatabase();

    await User.find();
    await PrivateChatRoom.find();

    const INSTRUCTOR_CLERK_ID = "user_35hV3NV1RA4gd4NJQTWg7bSzYCJ";
    
    const talelUser = await User.findOne({ clerkId: INSTRUCTOR_CLERK_ID });
    
    if (!talelUser) {
      return NextResponse.json({
        success: false,
        error: "Instructor not found"
      }, { status: 404 });
    }

    const talelId = talelUser._id.toString();

    const allPrivateChats = await PrivateChatRoom.find({})
      .populate("student")
      .populate("instructor");

    let invalidChats = 0;
    let validChats = 0;
    const allChatsInfo: any[] = [];

    for (const chat of allPrivateChats) {
      // Skip if instructor or student is null
      if (!chat.instructor || !chat.student) {
        console.log(`Found chat with null participant: ${chat._id}`);
        invalidChats++;
        allChatsInfo.push({
          chatId: chat._id,
          student: "NULL/DELETED",
          instructor: "NULL/DELETED",
          isValid: false,
          studentIsAdmin: false,
          instructorIsAdmin: false
        });
        continue;
      }

      const instructor = chat.instructor as any;
      const student = chat.student as any;
      const instructorId = instructor._id.toString();
      const studentId = student._id.toString();

      const isValidChat = instructorId === talelId || studentId === talelId;

      allChatsInfo.push({
        chatId: chat._id,
        student: student.username || student.email,
        instructor: instructor.username || instructor.email,
        isValid: isValidChat,
        studentIsAdmin: student.isAdmin,
        instructorIsAdmin: instructor.isAdmin
      });

      if (!isValidChat) {
        invalidChats++;
      } else {
        validChats++;
      }
    }

    return NextResponse.json({
      success: true,
      instructorName: talelUser.username || talelUser.email,
      instructorClerkId: INSTRUCTOR_CLERK_ID,
      instructorMongoId: talelId,
      totalPrivateChats: allPrivateChats.length,
      validChats,
      invalidChats,
      hasInvalidChats: invalidChats > 0,
      allChatsInfo
    }, { status: 200 });

  } catch (error: any) {
    console.error("Check invalid private chats error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
