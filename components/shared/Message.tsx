import { TChatRoomMessage, TUser } from "@/types/models.types";
import React from "react";
import { Avatar } from "../ui/avatar";
import { AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { getTimeAgo } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

type Props = {
  loggedInUser: TUser;
  message: TChatRoomMessage;
  isLastMessage: boolean;
};

const Message = ({ loggedInUser, message, isLastMessage }: Props) => {
  return (
    <>
      {loggedInUser._id === message.senderId._id ? (
        <div
          id={isLastMessage ? "last-message" : ""}
          className="w-full flex items-center gap-x-2 justify-end text-ellipsis"
        >
          <HoverCard>
            <HoverCardTrigger asChild className="cursor-pointer">
              <div className=" max-w-[600px] p-2 bg-brand-red-500/90 rounded-t-lg rounded-bl-lg text-slate-50 ">
                {message.content}{" "}
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-fit h-fit py-1 px-2 rounded-full mt-2 bg-input">
              <p className="text-xs font-bold">
                {" "}
                {getTimeAgo(message.createdAt)}{" "}
              </p>
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild className="cursor-pointer">
              <Avatar>
                <AvatarImage src={message.senderId.picture!} />
                <AvatarFallback>
                  <Skeleton className="w-5 h-5 rounded-full" />
                </AvatarFallback>
              </Avatar>
            </HoverCardTrigger>
            <HoverCardContent className="w-fit h-fit py-1 px-2 rounded-full mt-2 bg-input">
              <p className="text-xs font-bold"> {message.senderId.username} </p>
            </HoverCardContent>
          </HoverCard>
        </div>
      ) : (
        <div
          id={isLastMessage ? "last-message" : ""}
          className="w-full  flex items-center gap-x-2"
        >
          <HoverCard>
            <HoverCardTrigger asChild className="cursor-pointer">
              <Avatar>
                <AvatarImage src={message.senderId.picture!} />
                <AvatarFallback></AvatarFallback>
              </Avatar>
            </HoverCardTrigger>
            <HoverCardContent className="w-fit h-fit py-1 px-2 rounded-full mt-2 bg-input">
              <p className="text-xs font-bold"> {message.senderId.username} </p>
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild className="cursor-pointer">
              <div className=" max-w-[600px] p-2 bg-slate-950 dark:bg-slate-50 text-slate-50 dark:text-slate-950 rounded-t-lg rounded-br-lg ">
                {message.content}
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-fit h-fit py-1 px-2 rounded-full mt-2 bg-input ">
              <p font-bold className="text-xs font-bold">
                {" "}
                {getTimeAgo(message.createdAt)}{" "}
              </p>
            </HoverCardContent>
          </HoverCard>
        </div>
      )}
    </>
  );
};

export default Message;
