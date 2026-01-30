import ChatRooms from "@/components/shared/ChatRooms";
import { getUserByClerkId } from "@/lib/actions";
import { TUser } from "@/types/models.types";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";
import { combineAndNormalizeChatRooms } from "@/lib/utils/chat-utils";

const StudentChatRoomsPage = async () => {
  const { userId } = auth();

  if (!userId) return redirect("/sign-in");

  let user: TUser = {} as TUser;

  try {
    user = await getUserByClerkId({ clerkId: userId! });
  } catch (error: any) {}
  
  // Combine and normalize group chat rooms and private chat rooms
  const allChatRooms = combineAndNormalizeChatRooms(
    user.joinedChatRooms ?? [],
    user.privateChatRooms ?? [],
    user._id
  );
  
  return <ChatRooms chatRooms={allChatRooms} user={user} />;
};

export default StudentChatRoomsPage;
