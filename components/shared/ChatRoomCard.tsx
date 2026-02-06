"use client";
import React from "react";
import { TChatRoomMessage, TCourseChatRoom } from "../../types/models.types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { AnimatedTooltip } from "../ui/animated-tooltip";
import OnlineCircle from "./OnlineCircle";
import { UnreadMessagesType } from "./ChatRooms";
import { isPrivateChat, getChatRoomDisplayName } from "@/lib/utils/chat-utils";
import { Users, UserCircle } from "lucide-react";

type Props = {
  unreadMessages: UnreadMessagesType[];
  lastMessage: TChatRoomMessage | null;
  chatRoom: TCourseChatRoom;
  selectedChatRoom: TCourseChatRoom | null;
  onChangeSelectedChatRoomHandler: (chatRoom: TCourseChatRoom) => void;
  onReadAllUnreadMessagesHandler: () => void;
};

const ChatRoomCard = ({
  unreadMessages,
  lastMessage,
  chatRoom,
  selectedChatRoom,
  onChangeSelectedChatRoomHandler,
  onReadAllUnreadMessagesHandler,
}: Props) => {
  const chatRoomUnreadMessages = unreadMessages.filter(
    (message) => message.roomId === chatRoom._id
  );
  
  const isPrivate = isPrivateChat(chatRoom);
  const otherUser = isPrivate ? chatRoom.students?.[0] : null;
  
  return (
    <div
      className={`
        relative w-full rounded-lg px-3 py-3 
        hover:bg-slate-50 dark:hover:bg-slate-800 
        transition-all duration-200 ease-in-out cursor-pointer
        group
        ${
          selectedChatRoom && selectedChatRoom._id === chatRoom._id
            ? "bg-brand-red-50 dark:bg-brand-red-950/20 border-l-4 border-brand-red-500"
            : "border-l-4 border-transparent"
        }
      `}
      onClick={() => {
        onChangeSelectedChatRoomHandler(chatRoom);
        onReadAllUnreadMessagesHandler();
      }}
    >
      {chatRoomUnreadMessages.length && !selectedChatRoom ? (
        <div className="absolute text-xs bg-brand-red-500 w-6 h-6 rounded-full flex items-center justify-center text-white font-semibold right-3 top-3 shadow-lg animate-pulse">
          {chatRoomUnreadMessages.length}
        </div>
      ) : null}
      <div className="flex items-start gap-x-3">
        <div className="relative flex-shrink-0">
          <Avatar className="w-14 h-14 ring-2 ring-slate-200 dark:ring-slate-700">
            <AvatarImage
              className="w-14 h-14 object-cover"
              src={
                isPrivate 
                  ? (otherUser?.picture || "/images/default_profile.avif")
                  : (chatRoom.courseId?.thumbnail! || "/images/default-course-thumbnail.jpg")
              }
              alt={isPrivate ? "User Profile" : "Course Thumbnail"}
            />
            <AvatarFallback className="w-14 h-14">
              <Skeleton className="w-14 h-14" />
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 z-10">
            <OnlineCircle />
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-y-1">
          <div className="flex items-center gap-x-2">
            <h2 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate flex-1">
              {isPrivate ? otherUser?.username : chatRoom.courseId.title}
            </h2>
            {isPrivate && (
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex-shrink-0">
                Private
              </span>
            )}
            {!isPrivate && (
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex-shrink-0">
                Group
              </span>
            )}
          </div>

        {chatRoomUnreadMessages.length ? (
          <p className="text-slate-900 dark:text-slate-100 font-semibold truncate text-xs">
            {chatRoomUnreadMessages.at(-1)?.unreadMessage.senderId?.username || "Unknown user"}: {chatRoomUnreadMessages.at(-1)?.unreadMessage.content}
          </p>
        ) : (
          <>
            {lastMessage ? (
              <p className="text-slate-500 dark:text-slate-400 font-normal truncate text-xs">
                {lastMessage.senderId?.username || "Unknown user"}: {lastMessage.content}
              </p>
            ) : isPrivate ? (
              <p className="text-slate-400 dark:text-slate-500 font-normal text-xs italic">
                Start a private conversation
              </p>
            ) : (
              <div className="flex items-center gap-x-2">
                <Avatar className="w-4 h-4">
                  <AvatarImage
                    className="w-4 h-4"
                    src={chatRoom.instructorAdmin.picture || "/images/default_profile.avif"}
                    alt="Instructor Avatar"
                  />
                  <AvatarFallback className="w-4 h-4">
                    <Skeleton className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-xs">
                  {chatRoom.instructorAdmin.username}
                </p>
                <span className="hidden lg:inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  Instructor
                </span>
              </div>
            )}
          </>
        )}

        {!isPrivate && chatRoom.students && chatRoom.students.length > 0 && (
          <div className="flex items-center gap-x-1 mt-1">
            <AnimatedTooltip
              items={chatRoom.students.slice(0, 5)}
              otherStyles="w-5 h-5 text-[10px]"
            />
            {chatRoom.students.length > 5 && (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium ml-1">
                +{chatRoom.students.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default ChatRoomCard;
