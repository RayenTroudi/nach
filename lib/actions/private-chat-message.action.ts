"use server";

import { connectToDatabase } from "../mongoose";
import PrivateChatMessage from "../models/private-chat-message.model";
import { pushMessageToPrivateChatRoom } from "./private-chat-room.action";
import { pusherServer } from "../pusher";

export const createPrivateMessage = async (params: {
  privateChatRoomId: string;
  senderId: string;
  content: string;
  path: string;
}) => {
  try {
    const { privateChatRoomId, senderId, content, path } = params;
    await connectToDatabase();

    console.log("🔒 Creating PRIVATE message:", {
      privateChatRoomId,
      senderId,
      contentPreview: content.substring(0, 30),
    });

    const newMessage = await PrivateChatMessage.create({
      privateChatRoomId,
      senderId,
      content,
    });

    console.log("✅ Private message created:", newMessage._id);

    const realTimeMessage = await PrivateChatMessage.findById(
      newMessage._id
    ).populate({
      path: "senderId",
      model: "User",
    });

    // Trigger Pusher events for real-time updates
    console.log("📡 Triggering Pusher for private chat:", privateChatRoomId);
    pusherServer.trigger(`chat-rooms-unread-messages`, "unread-messages", {
      unreadMessage: realTimeMessage,
      roomId: privateChatRoomId,
    });
    pusherServer.trigger(privateChatRoomId, "upcoming-message", realTimeMessage);

    await pushMessageToPrivateChatRoom(privateChatRoomId, newMessage._id.toString());

    console.log("✅ Private message sent successfully");
    return JSON.parse(JSON.stringify(newMessage));
  } catch (error: any) {
    console.log("❌ CREATE PRIVATE MESSAGE ERROR: ", error.message);
    throw new Error(error.message);
  }
};
