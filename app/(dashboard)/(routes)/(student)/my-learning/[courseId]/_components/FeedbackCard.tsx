"use client";
import { Star } from "@/components/shared";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo } from "@/lib/utils";
import { TFeedback } from "@/types/models.types";
import React, { useState } from "react";

type Props = {
  feedback: TFeedback;
  isOwner?: boolean;
};

const FeedbackCard = ({ feedback, isOwner = false }: Props) => {
  const [showMore, setShowMore] = useState<boolean>(false);
  return (
    <div className="w-full flex gap-x-6  py-6 border-b-2">
      <Avatar className="size-20 border">
        <AvatarImage src={feedback.user?.picture!} alt="user profile picture" />
        <AvatarFallback>
          <Skeleton />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 w-full flex flex-col gap-y-2">
        <div className="w-full flex items-center gap-x-2">
          <h2 className="text-lg font-bold line-clamp-1">
            {" "}
            {feedback.user?.username ||
              `${feedback.user?.firstName} ${feedback.user?.lastName}`}{" "}
          </h2>
          {isOwner ? (
            <div className="w-fit h-fit text-xs px-4 py-1 flex items-center justify-center rounded-full font-bold  text-slate-50 bg-primaryColor">
              Your feedback
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-x-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              index={index}
              size={20}
              filled={feedback.rating > index}
              stars={feedback.rating}
            />
          ))}
          <p className="line-clamp-1 font-semibold text-sm text-slate-600 dark:text-slate-400">
            {" "}
            {timeAgo(feedback.createdAt)}{" "}
          </p>
        </div>
        <div
          className={`w-full md:w-[70%] leading-loose relative transition-all duration-200 ease-linear font-thin ${
            !showMore ? "line-clamp-4" : ""
          }`}
        >
          {feedback.comment}
          {!showMore ? (
            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-slate-50 via-transparent to-transparent dark:from-slate-950"></div>
          ) : null}
        </div>

        <Button
          variant={"link"}
          className="w-fit p-0 text-blue-700"
          onClick={() => setShowMore((prev) => !prev)}
        >
          {showMore ? "Show less" : "Show more"}
        </Button>
      </div>
    </div>
  );
};

export default FeedbackCard;
