"use client";
import React from "react";
import { TCourseChatRoom, TUser } from "../../types/models.types";
import NoChatAnimation from "./animations/NoChat";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import OnlineCircle from "./OnlineCircle";

import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { ArrowLeft } from "lucide-react";
import { isPrivateChat } from "@/lib/utils/chat-utils";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("dashboard.student.chatRooms");
  const isPrivate = selectedChatRoom ? isPrivateChat(selectedChatRoom) : false;
  const otherUser = isPrivate && selectedChatRoom ? selectedChatRoom.students?.[0] : null;

  return (
    <div className={`w-full h-full flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden ${selectedChatRoom ? "block" : "hidden md:flex"}`}>
      {!selectedChatRoom ? (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <NoChatAnimation className="h-[250px] md:h-[350px]" />
          <h2 className="text-slate-900 dark:text-slate-100 font-bold text-xl md:text-2xl text-center mt-4">
            {t("selectConversation")}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm text-center mt-2 max-w-sm">
            {t("chooseChat")}
          </p>
        </div>
      ) : (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 md:px-6 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-x-3 flex-1 min-w-0">
              {/* Back Button for Mobile */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => onChangeSelectedChatRoomHandler(selectedChatRoom)}
              >
                <ArrowLeft size={20} />
              </Button>

              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <Avatar className="w-11 h-11 ring-2 ring-slate-200 dark:ring-slate-700">
                  <AvatarImage
                    className="w-11 h-11 object-cover"
                    src={
                      isPrivate
                        ? (otherUser?.picture || "/images/default_profile.avif")
                        : (selectedChatRoom.courseId.thumbnail! || "/images/default-course-thumbnail.jpg")
                    }
                    alt={isPrivate ? "User Avatar" : "Course Thumbnail"}
                  />
                  <AvatarFallback className="w-11 h-11">
                    <Skeleton className="w-11 h-11" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 z-10">
                  <OnlineCircle />
                </div>
              </div>

              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-base text-slate-900 dark:text-slate-100 truncate">
                  {isPrivate ? otherUser?.username : selectedChatRoom.courseId.title}
                </h2>
                <div className="flex items-center gap-x-2 mt-0.5">
                  {!isPrivate && (
                    <>
                      <Avatar className="w-4 h-4">
                        <AvatarImage
                          className="w-4 h-4"
                          src={selectedChatRoom.instructorAdmin.picture || "/images/default_profile.avif"}
                          alt="Instructor"
                        />
                        <AvatarFallback className="w-4 h-4">
                          <Skeleton className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {selectedChatRoom.instructorAdmin.username}
                      </p>
                      <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        {t("instructor")}
                      </span>
                    </>
                  )}
                  {isPrivate && (
                    <span className="text-xs text-green-500 dark:text-green-400 font-medium">
                      ● {t("online")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoomConversation;
