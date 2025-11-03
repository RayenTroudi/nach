"use server";
import { connectToDatabase } from "../mongoose";
import { pushMessageToChatRoom } from "./course-chat-room";
import ChatRoomMessage from "../models/chat-room-message.model";
import { pusherServer } from "../pusher";

export const createMessage = async (params: {
  chatRoomId: string;
  senderId: string;
  content: string;
  path: string;
}) => {
  try {
    const { chatRoomId, senderId, content, path } = params;
    await connectToDatabase();

    const newMessage = await ChatRoomMessage.create({
      chatRoomId,
      senderId,
      content,
    });

    const realTimeMessage = await ChatRoomMessage.findById(
      newMessage._id
    ).populate({
      path: "senderId",
      model: "User",
    });

    pusherServer.trigger(`chat-rooms-unread-messages`, "unread-messages", {
      unreadMessage: realTimeMessage,
      roomId: chatRoomId,
    });
    pusherServer.trigger(chatRoomId, "upcoming-message", realTimeMessage);

    await pushMessageToChatRoom(chatRoomId, newMessage._id);

    return JSON.parse(JSON.stringify(newMessage));
  } catch (error: any) {
    console.log("CREATE MESSAGE ERROR: ", error.message);
    throw new Error(error.message);
  }
};
