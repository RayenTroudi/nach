"use client";
import React from "react";
import { TChatRoomMessage, TCourseChatRoom } from "../../types/models.types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { AnimatedTooltip } from "../ui/animated-tooltip";
import OnlineCircle from "./OnlineCircle";
import { UnreadMessagesType } from "./ChatRooms";

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
  return (
    <div
      className={`line-clamp-1 relative w-full min-h-[50px] rounded-sm flex items-center gap-x-4 px-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all duration-300 ease-in-out cursor-pointer
        ${
          selectedChatRoom
            ? selectedChatRoom._id === chatRoom._id
              ? "bg-slate-100 dark:bg-slate-900"
              : ""
            : ""
        }
      `}
      onClick={() => {
        onChangeSelectedChatRoomHandler(chatRoom);
        onReadAllUnreadMessagesHandler();
      }}
    >
      {chatRoomUnreadMessages.length && !selectedChatRoom ? (
        <div className="absolute text-xs bg-brand-red-500 w-5 h-5 rounded-full flex items-center justify-center text-slate-50 right-2 top-2">
          {" "}
          {chatRoomUnreadMessages.length}{" "}
        </div>
      ) : null}
      <Avatar className="w-[70px] h-[70px] ">
        <AvatarImage
          className="w-[70px] h-[70px]"
          src={
            chatRoom.courseId?.thumbnail! ||
            "/images/default-course-thumbnail.jpg"
          }
          alt="Course Thumbnail"
        />
        <AvatarFallback className="w-[70px] h-[70px]">
          <Skeleton className="w-[70px] h-[70px]" />
        </AvatarFallback>
      </Avatar>
      <div className="absolute bottom-4 left-[62px] w-4 h-4 z-50">
        <OnlineCircle />
      </div>

      <div className="flex-1 min-h-full flex flex-col gap-y-2 justify-around text-wrap">
        <h2 className="font-bold  line-clamp-1">{chatRoom.courseId.title}</h2>

        {chatRoomUnreadMessages.length ? (
          <p className="text-slate-950 dark:text-slate-50 font-bold truncate text-smw-full !line-clamp-1">
            {chatRoomUnreadMessages.at(-1)?.unreadMessage.senderId.username} :{" "}
            {chatRoomUnreadMessages.at(-1)?.unreadMessage.content}{" "}
          </p>
        ) : (
          <>
            {lastMessage ? (
              <p className="text-slate-500 font-normal truncate text-sm w-full line-clamp-1">
                {lastMessage.senderId.username} : {lastMessage.content}
              </p>
            ) : (
              <div className="flex items-center gap-x-2">
                <Avatar className="w-5 h-5 hidden md:block ">
                  <AvatarImage
                    className="w-5 h-5 "
                    src={chatRoom.instructorAdmin.picture || "/images/default_profile.avif"}
                    alt="Teacher Avatar"
                  />
                  <AvatarFallback className="w-5 h-5 ">
                    <Skeleton className="w-5 h-5 " />
                  </AvatarFallback>
                </Avatar>
                <p className="text-slate-500 font-bold text-xs">
                  {" "}
                  {chatRoom.instructorAdmin.username}{" "}
                </p>
                <div className="hidden md:block w-fit px-4 py-0.5 text-xs font-bold rounded-full bg-blue-700/20 text-center text-blue-700">
                  Instructor
                </div>
              </div>
            )}
          </>
        )}

        <div className="w-full flex flex-row ">
          <AnimatedTooltip
            items={
              chatRoom.students
                ? chatRoom?.students.length <= 6
                  ? chatRoom?.students
                  : chatRoom?.students?.slice(0, 5)
                : []
            }
            otherStyles="w-5 h-5"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatRoomCard;
