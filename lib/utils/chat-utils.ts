import { TCourseChatRoom, TPrivateChatRoom, TPrivateChatMessage, TChatRoomMessage, TUser } from "@/types/models.types";

/**
 * Converts a private chat room to the common course chat room format for UI compatibility
 */
export function convertPrivateChatToGroupFormat(
  privateChat: TPrivateChatRoom,
  currentUserId: string
): TCourseChatRoom {
  // Determine who is the "instructor" from the current user's perspective
  const isUserTheInstructor = privateChat.instructor._id === currentUserId;
  const otherUser = isUserTheInstructor ? privateChat.student : privateChat.instructor;
  
  // Convert private messages to group message format
  const messages: TChatRoomMessage[] = (privateChat.messages || []).map((msg: TPrivateChatMessage) => ({
    _id: msg._id,
    chatRoomId: null as any, // Not used in UI
    senderId: msg.senderId,
    content: msg.content,
    createdAt: msg.createdAt,
  }));

  // Create a pseudo group chat room structure
  return {
    _id: privateChat._id,
    courseId: privateChat.courseId,
    students: [otherUser], // Show the other person as the only "student"
    instructorAdmin: isUserTheInstructor ? privateChat.instructor : privateChat.instructor,
    messages: messages,
    cratedAt: privateChat.createdAt,
  };
}

/**
 * Combines group chat rooms and private chat rooms into a unified array
 */
export function combineAndNormalizeChatRooms(
  groupChats: TCourseChatRoom[],
  privateChats: TPrivateChatRoom[],
  currentUserId: string
): TCourseChatRoom[] {
  const normalizedPrivateChats = privateChats.map(chat => 
    convertPrivateChatToGroupFormat(chat, currentUserId)
  );
  
  return [...groupChats, ...normalizedPrivateChats];
}

/**
 * Check if a chat room is a private chat (1-on-1) or group chat
 */
export function isPrivateChat(chatRoom: TCourseChatRoom): boolean {
  return chatRoom.students?.length === 1;
}

/**
 * Get the display name for a chat room (course title or private chat name)
 */
export function getChatRoomDisplayName(chatRoom: TCourseChatRoom, currentUserId: string): string {
  if (isPrivateChat(chatRoom)) {
    // For private chat, show the other person's name
    const otherUser = chatRoom.students?.[0];
    return otherUser ? `${otherUser.username} (Private)` : chatRoom.courseId.title;
  }
  return chatRoom.courseId.title;
}
