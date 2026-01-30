"use server";

import { connectToDatabase } from "../mongoose";
import PrivateChatRoom from "../models/private-chat-room.model";
import { pushPrivateChatRoomToUser } from "./user.action";

export const createPrivateChatRoom = async (params: {
  courseId: string;
  studentId: string;
  instructorId: string;
}) => {
  try {
    const { courseId, studentId, instructorId } = params;
    await connectToDatabase();

    // Check if private chat room already exists
    const existingRoom = await PrivateChatRoom.findOne({
      courseId,
      student: studentId,
      instructor: instructorId,
    });

    if (existingRoom) {
      console.log("Private chat room already exists:", existingRoom._id);
      return JSON.parse(JSON.stringify(existingRoom));
    }

    // Create a new private chat room
    const privateChatRoom = await PrivateChatRoom.create({
      courseId,
      student: studentId,
      instructor: instructorId,
      isActive: true,
    });

    // Add to both user's chat room arrays
    await pushPrivateChatRoomToUser(studentId, privateChatRoom._id.toString());
    await pushPrivateChatRoomToUser(instructorId, privateChatRoom._id.toString());

    console.log("Private chat room created:", privateChatRoom._id);
    return JSON.parse(JSON.stringify(privateChatRoom));
  } catch (error: any) {
    console.log("CREATE PRIVATE CHAT ROOM ERROR", error.message);
    throw new Error(error.message);
  }
};

export const pushMessageToPrivateChatRoom = async (
  privateChatRoomId: string,
  messageId: string
) => {
  try {
    await connectToDatabase();
    await PrivateChatRoom.findByIdAndUpdate(privateChatRoomId, {
      $push: { messages: messageId },
    });
  } catch (error: any) {
    console.log("PUSH MESSAGE TO PRIVATE CHAT ROOM ERROR", error.message);
    throw new Error(error.message);
  }
};

export const getPrivateChatRoom = async (privateChatRoomId: string) => {
  try {
    await connectToDatabase();
    const room = await PrivateChatRoom.findById(privateChatRoomId)
      .populate("student")
      .populate("instructor")
      .populate("courseId")
      .populate({
        path: "messages",
        populate: {
          path: "senderId",
          model: "User",
        },
      });
    return JSON.parse(JSON.stringify(room));
  } catch (error: any) {
    console.log("GET PRIVATE CHAT ROOM ERROR", error.message);
    throw new Error(error.message);
  }
};

export const deletePrivateChatRoom = async (courseId: string) => {
  try {
    await connectToDatabase();
    await PrivateChatRoom.deleteMany({ courseId });
  } catch (error: any) {
    console.log("DELETE PRIVATE CHAT ROOMS ERROR", error.message);
    throw new Error(error.message);
  }
};
