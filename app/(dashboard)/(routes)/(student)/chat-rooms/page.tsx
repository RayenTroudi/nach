import ChatRooms from "@/components/shared/ChatRooms";
import { getUserByClerkId } from "@/lib/actions";
import { TUser } from "@/types/models.types";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";

const StudentChatRoomsPage = async () => {
  const { userId } = auth();

  if (!userId) return redirect("/sign-in");

  let user: TUser = {} as TUser;

  try {
    user = await getUserByClerkId({ clerkId: userId! });
  } catch (error: any) {}
  return <ChatRooms chatRooms={user.joinedChatRooms ?? []} user={user} />;
};

export default StudentChatRoomsPage;
