"use server";

import { CreateChatRoomParams } from "@/types/shared.types";
import { connectToDatabase } from "../mongoose";
import CourseChatRoom from "../models/course-chat-room.model";
import { addCourseChatRoom } from "./course.action";
import { pushOwnChatRoomToUser } from "./user.action";

export const createCourseChatRoom = async (params: CreateChatRoomParams) => {
  try {
    const { courseId, instructorId } = params;
    await connectToDatabase();

    // Create a course chat room with instructor as admin and first student
    const courseChatRoom = await CourseChatRoom.create({
      courseId,
      instructorAdmin: instructorId,
      students: [instructorId], // Add instructor to students array by default
    });

    await addCourseChatRoom({
      courseId,
      chatRoomId: courseChatRoom._id,
    });

    await pushOwnChatRoomToUser(instructorId, courseChatRoom._id);
    
    // IMPORTANT: Also add instructor to joinedChatRooms so they appear as participant
    const { joinChatRoom } = await import("./user.action");
    // Add to joinedChatRooms only (student already added above)
    await joinChatRoom(instructorId, courseChatRoom._id.toString(), true);
  } catch (error: any) {
    console.log("CREATE COURSE CHAT ROOM ERROR", error.message);
  }
};

export const pushStudentToChatRoom = async (params: {
  chatRoomId: string;
  studentId: string;
}) => {
  try {
    const { chatRoomId, studentId } = params;
    await connectToDatabase();

    // Use $addToSet to prevent duplicate students in chat room
    await CourseChatRoom.findByIdAndUpdate(chatRoomId, {
      $addToSet: { students: studentId },
    });
  } catch (error: any) {
    console.log("PUSH STUDENT TO COURSE CHAT ROOM ERROR", error.message);
    throw new Error(error.message);
  }
};

export const pushMessageToChatRoom = async (
  chatRoomId: string,
  massageId: string
) => {
  try {
    await connectToDatabase();
    // Push message to course chat room
    await CourseChatRoom.findByIdAndUpdate(chatRoomId, {
      $push: { messages: massageId },
    });
  } catch (error: any) {
    console.log("PUSH MESSAGE TO COURSE CHAT ROOM ERROR", error.message);
    throw new Error(error.message);
  }
};

export const deleteCourseChatRooms = async (courseId: string) => {
  try {
    await connectToDatabase();
    // Delete course chat rooms
    await CourseChatRoom.deleteMany({ courseId });
  } catch (error: any) {
    console.log("DELETE COURSE CHAT ROOMS ERROR", error.message);
    throw new Error(error.message);
  }
};
