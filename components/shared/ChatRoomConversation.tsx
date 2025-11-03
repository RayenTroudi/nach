"use client";
import React from "react";
import { TCourseChatRoom, TUser } from "../../types/models.types";
import NoChatAnimation from "./animations/NoChat";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import OnlineCircle from "./OnlineCircle";

import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { Button } from "@react-email/components";
import { Separator } from "../ui/separator";
import { ExitIcon } from "@radix-ui/react-icons";

type Props = {
  selectedChatRoom: TCourseChatRoom | null;
  user: TUser;
  onChangeSelectedChatRoomHandler: (chatRoom: TCourseChatRoom) => void;
  children: React.ReactNode;
};

const ChatRoomConversation = ({
  selectedChatRoom,
  user,
  onChangeSelectedChatRoomHandler,
  children,
}: Props) => {
  return (
    <div
      className={`
        w-full md:flex-1 h-full border-l 
      ${selectedChatRoom ? "block" : "hidden md:block"}`}
    >
      {!selectedChatRoom ? (
        <div className="w-full h-full flex flex-col items-center">
          <NoChatAnimation className="h-[300px] md:h-[500px] " />
          <h2 className="text-slate-950 dark:text-slate-50 font-bold text-lg md:text-xl lg:text-2xl text-center">
            No Chat Chat Room Selected
          </h2>
        </div>
      ) : (
        <div className="flex flex-col gap-y-2">
          <div className="relative flex items-center justify-between px-4 bg-slate-100 dark:bg-slate-900 w-full h-[80px]">
            <div className="absolute bottom-3 left-[62px] w-4 h-4 z-50">
              <OnlineCircle />
            </div>
            <div className="flex items-center gap-x-2">
              <Avatar className="w-16 h-16">
                <AvatarImage
                  className="w-16 h-16"
                  src={selectedChatRoom.courseId.thumbnail!}
                  alt="Course Thumbnail"
                />

                <AvatarFallback className="w-16 h-16 ">
                  <Skeleton className="w-16 h-16 " />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 h-full flex flex-col gap-y-2 justify-between ">
                <h2 className="hidden md:block font-bold text-lg md:text-xl">
                  {selectedChatRoom.courseId.title}{" "}
                </h2>

                <h2 className="md:hidden font-bold text-lg md:text-xl">
                  {selectedChatRoom.courseId.title.slice(0, 16)}
                  {"..."}
                </h2>

                <div className="flex items-center gap-x-2">
                  <Avatar className="w-5 h-5  ">
                    <AvatarImage
                      className="w-5 h-5 "
                      src={selectedChatRoom.instructorAdmin.picture || "/images/default_profile.avif"}
                      alt="Teacher Avatar"
                    />
                    <AvatarFallback className="w-5 h-5 ">
                      <Skeleton className="w-5 h-5 " />
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-slate-500 font-bold text-xs ">
                    {" "}
                    {selectedChatRoom.instructorAdmin.username}{" "}
                  </p>
                  <div className=" hidden md:block w-fit px-4 py-0.5 text-xs font-bold rounded-full bg-blue-700/20 text-center text-blue-700">
                    Instructor
                  </div>
                  <Separator className="h-[20px] w-[2px] md:hidden" />
                  <Button
                    className="cursor-pointer font-bold text-md text-slate-700 dark:text-slate-300 md:hidden"
                    onClick={() =>
                      onChangeSelectedChatRoomHandler(selectedChatRoom)
                    }
                  >
                    <ExitIcon className="md:hidden" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          {children}
        </div>
      )}
    </div>
  );
};

export default ChatRoomConversation;
