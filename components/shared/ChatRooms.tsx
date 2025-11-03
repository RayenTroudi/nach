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

import { MessageCircleIcon } from "lucide-react";
import Messages from "./Messages";
import MessageInput from "./MessageInput";
import { pusherClient } from "@/lib/pusher";

type Props = {
  chatRooms: TCourseChatRoom[];
  user: TUser;
};

export type UnreadMessagesType = {
  unreadMessage: TChatRoomMessage;
  roomId: string;
};

const ChatRooms = ({ chatRooms, user }: Props) => {
  console.log("Chat Rooms: ", chatRooms);
  const [unreadMessages, setUnreadMessages] = useState<UnreadMessagesType[]>(
    []
  );

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
          <div className="flex-1 h-full flex items-center flex-col">
            <NoChatAnimation className="h-[300px] md:h-[500px]" />
            <h1 className="text-slate-950 dark:text-slate-50 font-bold text-lg md:text-xl lg:text-2xl text-center">
              No Courses Purchased , No Rooms Available
            </h1>
            <p className="text-slate-500 text:sm md:text-md text-center">
              {" "}
              Once you purchase a course you&apos;ll bee joined automatically to
              that course&apos;s room{" "}
            </p>
          </div>
        </div>
      ) : (
        <div
          className="flex w-full relative overflow-y-auto"
          style={{
            height: "calc(100vh - 80px)",
          }}
        >
          <div
            className={`md:flex flex-col gap-y-4  w-full md:w-96 h-full
            ${selectedChatRoom ? "hidden md:block" : "block"}
          `}
          >
            <div className="p-4 w-full bg-slate-100 dark:bg-slate-900 h-[80px] flex items-center gap-x-2">
              <MessageCircleIcon size={30} />
              <h1 className="font-bold text-xl md:text-2xl">Learning Rooms</h1>
            </div>
            {chatRooms!.map((chatRoom: TCourseChatRoom) => (
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
            ))}
          </div>
          {/* <div
            className={`${
              selectedChatRoom ? "block" : "hidden"
            } md:hidden absolute right-2 top-6`}
          >
            <MobileChatRooms>
              <div className="flex flex-col gap-y-4  w-full h-full ">
                {chatRooms!.map((chatRoom: TCourseChatRoom) => (
                  <ChatRoomCard
                    key={chatRoom._id}
                    chatRoom={chatRoom}
                    selectedChatRoom={selectedChatRoom}
                    onChangeSelectedChatRoomHandler={
                      onChangeSelectedChatRoomHandler
                    }
                  />
                ))}
              </div>
            </MobileChatRooms>
          </div> */}
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
        </div>
      )}
    </>
  );
};

export default ChatRooms;
