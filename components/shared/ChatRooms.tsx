"use client";
import { useEffect, useState } from "react";
import ChatRoomCard from "./ChatRoomCard";
import ChatRoomConversation from "./ChatRoomConversation";
import {
  TChatRoomMessage,
  TCourseChatRoom,
  TUser,
} from "../../types/models.types";
import NoChatAnimation from "./animations/NoChat";
import LeftSideBar from "./LeftSideBar";

import { MessageCircleIcon, Search, Filter } from "lucide-react";
import Messages from "./Messages";
import MessageInput from "./MessageInput";
import { pusherClient } from "@/lib/pusher";
import { useTranslations } from "next-intl";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

type Props = {
  chatRooms: TCourseChatRoom[];
  user: TUser;
};

export type UnreadMessagesType = {
  unreadMessage: TChatRoomMessage;
  roomId: string;
};

const ChatRooms = ({ chatRooms, user }: Props) => {
  const t = useTranslations("dashboard.student.chatRooms");
  console.log("Chat Rooms: ", chatRooms);
  const [unreadMessages, setUnreadMessages] = useState<UnreadMessagesType[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "private" | "group">("all");

  const [selectedChatRoom, setSelectedChatRoom] =
    useState<TCourseChatRoom | null>(null);

  const onSetUnreadMessagesHandler = (data: UnreadMessagesType) =>
    setUnreadMessages((prev: UnreadMessagesType[]) => [...prev, data]);

  const onChangeSelectedChatRoomHandler = (chatRoom: TCourseChatRoom) => {
    setSelectedChatRoom((currChatRoom: TCourseChatRoom | null) => {
      if (!currChatRoom) return chatRoom;

      return chatRoom._id === currChatRoom._id ? null : chatRoom;
    });
  };

  const uniqueUnreadMessages = unreadMessages.filter(
    (message, index, self) =>
      index ===
      self.findIndex(
        (m) =>
          m.unreadMessage._id === message.unreadMessage._id &&
          m.roomId === message.roomId
      )
  );

  // Filter chat rooms based on search and filter type
  const filteredChatRooms = chatRooms.filter((room) => {
    const matchesSearch = room.courseId.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.instructorAdmin.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    const isPrivate = room.students?.length === 1;
    const matchesFilter = 
      filterType === "all" || 
      (filterType === "private" && isPrivate) ||
      (filterType === "group" && !isPrivate);

    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    pusherClient.subscribe(`chat-rooms-unread-messages`);

    pusherClient.bind("unread-messages", (data: UnreadMessagesType) => {
      console.log("Unread Message Data: ", data);
      onSetUnreadMessagesHandler(data);
    });

    return () => {
      pusherClient.unsubscribe(`chat-rooms-unread-messages`);
    };
  }, []);

  return (
    <>
      {!chatRooms.length ? (
        <div className="h-full w-full flex">
          <LeftSideBar />
          <div className="flex-1 h-full flex items-center flex-col justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <NoChatAnimation className="h-[300px] md:h-[500px]" />
            <h1 className="text-slate-950 dark:text-slate-50 font-bold text-lg md:text-xl lg:text-2xl text-center">
              {t("noChatRooms")}
            </h1>
            <p className="text-slate-500 text:sm md:text-md text-center mt-2">
              {t("enrollInCourse")}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex h-full w-full">
          <LeftSideBar />
          <div className="flex flex-1 h-screen bg-slate-50 dark:bg-slate-950">
          {/* Fixed Sidebar */}
          <aside className={`
            fixed top-[80px] left-0 bottom-0 
            w-full md:w-[380px] lg:w-[420px]
            bg-white dark:bg-slate-900 
            border-r border-slate-200 dark:border-slate-800
            flex flex-col
            z-20
            transition-transform duration-300
            ${selectedChatRoom ? "-translate-x-full md:translate-x-0" : "translate-x-0"}
          `}>
            {/* Header */}
            <div className="flex-shrink-0 p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/60 rounded-lg backdrop-blur-sm">
                  <MessageCircleIcon className="text-rose-600" size={24} />
                </div>
                <div>
                  <h1 className="font-bold text-xl text-slate-800">{t("title")}</h1>
                  <p className="text-sm text-slate-600">{chatRooms.length} {t("conversations")}</p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <Input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-slate-300 focus:ring-2 focus:ring-rose-300"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant={filterType === "all" ? "secondary" : "ghost"}
                  onClick={() => setFilterType("all")}
                  className={`flex-1 ${filterType === "all" ? "bg-white text-rose-600" : "text-slate-700 hover:bg-white/50"}`}
                >
                  {t("filterAll")}
                </Button>
                <Button
                  size="sm"
                  variant={filterType === "private" ? "secondary" : "ghost"}
                  onClick={() => setFilterType("private")}
                  className={`flex-1 ${filterType === "private" ? "bg-white text-rose-600" : "text-slate-700 hover:bg-white/50"}`}
                >
                  {t("filterPrivate")}
                </Button>
                <Button
                  size="sm"
                  variant={filterType === "group" ? "secondary" : "ghost"}
                  onClick={() => setFilterType("group")}
                  className={`flex-1 ${filterType === "group" ? "bg-white text-rose-600" : "text-slate-700 hover:bg-white/50"}`}
                >
                  {t("filterGroup")}
                </Button>
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-2 space-y-1">
                {filteredChatRooms.length > 0 ? (
                  filteredChatRooms.map((chatRoom: TCourseChatRoom) => (
                    <ChatRoomCard
                      unreadMessages={uniqueUnreadMessages}
                      lastMessage={chatRoom?.messages?.at(-1) ?? null}
                      key={chatRoom._id}
                      chatRoom={chatRoom}
                      selectedChatRoom={selectedChatRoom}
                      onChangeSelectedChatRoomHandler={
                        onChangeSelectedChatRoomHandler
                      }
                      onReadAllUnreadMessagesHandler={() => setUnreadMessages([])}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-slate-500 text-sm">{t("noConversations")}</p>
                    <p className="text-slate-400 text-xs mt-1">{t("tryAdjustingFilters")}</p>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 md:ml-[380px] lg:ml-[420px] h-screen">
            <ChatRoomConversation
              selectedChatRoom={selectedChatRoom}
              user={user}
              onChangeSelectedChatRoomHandler={onChangeSelectedChatRoomHandler}
            >
              <Messages
                roomId={selectedChatRoom?._id!}
                messages={selectedChatRoom?.messages ?? []}
                loggedInUser={user}
              />

              <div className="w-full h-[70px]">
                <MessageInput selectedChatRoom={selectedChatRoom!} user={user} />
              </div>
            </ChatRoomConversation>
          </main>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatRooms;
