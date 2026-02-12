"use client";
import { TChatRoomMessage, TUser } from "@/types/models.types";
import React, { useEffect, useState } from "react";
import NoChatAnimation from "./animations/NoChat";
import Message from "./Message";
import { pusherClient } from "@/lib/pusher";
import { useRouter } from "next/navigation";

type Props = {
  roomId: string;
  messages: TChatRoomMessage[];
  loggedInUser: TUser;
};

const Messages = ({ roomId, messages, loggedInUser }: Props) => {
  const router = useRouter();
  const [chatRoomMessages, setChatRoomMessages] = useState<TChatRoomMessage[]>(
    messages ?? []
  );

  const uniqueMessages = chatRoomMessages.filter(
    (message, index, self) =>
      index ===
      self.findIndex(
        (m) =>
          m._id === message._id &&
          m.content === message.content &&
          m.senderId._id === message.senderId._id
      )
  );

  useEffect(() => {
    const el = document.getElementById("last-message");
    el?.scrollIntoView({ behavior: "smooth" });

    pusherClient.subscribe(roomId);

    pusherClient.bind("upcoming-message", (message: TChatRoomMessage) => {
      setChatRoomMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      pusherClient.unsubscribe(roomId);
    };
  }, [roomId]);

  useEffect(() => router.refresh(), [router, roomId]);

  return (
    <div className="flex-1 overflow-y-auto">
      {!uniqueMessages.length ? (
        <div className="w-full h-full flex flex-col items-center justify-start">
          <NoChatAnimation className="h-[200px] md:h-[300px]" />
          <h2 className="text-lg md:text-xl lf:text-2xl font-bold text-center">
            {" "}
            Luckily for you , no missed messages{" "}
          </h2>
          <p className="text-center text-slate-500 font-semibold text-sm md:text-md mt-1">
            Start a conversation right a way
          </p>
        </div>
      ) : (
        <div className="w-full h-full p-4 flex flex-col  gap-y-4 relative ">
          {uniqueMessages?.map((message: TChatRoomMessage, index: number) => (
            <Message
              message={message}
              loggedInUser={loggedInUser}
              key={message._id}
              isLastMessage={index === uniqueMessages.length - 1}
            />
          ))}
          {/* {unreadMessages ? (
            <Button
              onClick={() => {
                const el = document.getElementById("last-message");
                el?.scrollIntoView({ behavior: "smooth" });
                setUnreadMessages(0);
              }}
              className="flex items-center gap-x-2 absolute left-1/2 -translate-x-1/2 bottom-8 font-bold bg-slate-200 dark:bg-slate-900 shadow-lg text-slate-950 dark:text-slate-50 rounded-full animate-bounce"
            >
              <p>{unreadMessages - 1} Unread Messages</p>
              <ArrowDown
                size={20}
                className="text-slate-950 dark:text-slate-50 "
              />
            </Button>
          ) : null} */}
        </div>
      )}
    </div>
  );
};

export default Messages;
