"use client";
import NoFeedbacks from "@/components/shared/animations/NoFeedbacks";
import { TCourse, TFeedback, TUser } from "@/types/models.types";
import { useEffect } from "react";

import FeedbackCard from "./FeedbackCard";
import FeedbackForm from "./FeedbackForm";
import { Separator } from "@/components/ui/separator";

type Props = {
  isCourseOwner: boolean;
  course: TCourse;
  feedbacks: TFeedback[];
  user: TUser;
  isAllowed: boolean;
};

const Feedbacks = ({
  isCourseOwner,
  course,
  feedbacks,
  user,
  isAllowed,
}: Props) => {
  console.log("feedbacks", feedbacks);
  const alreadyGivenFeedback = feedbacks.find(
    (feedback) => feedback.user?._id === user._id
  );

  useEffect(() => {
    const el = document.getElementById("feedbacks");
    el?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="w-[90%] mx-auto">
      {!feedbacks.length ? (
        <div className="w-[70%] md:w-1/2 mx-auto flex flex-col items-center justify-center gap-y-2">
          <NoFeedbacks className="md:h-[300px]" />
          {alreadyGivenFeedback ? (
            <p className="font-bold text-lg md:text-xl text-center">
              You have already given feedback for this course.
            </p>
          ) : (
            <div className="flex flex-col gap-y-2 ">
              {!isCourseOwner ? (
                <p className="font-bold text-lg md:text-xl text-center">
                  {isAllowed
                    ? "No feedbacks yet, and you can be the first one to give feedback."
                    : " No feedbacks yet. Once you have completed the course and the assignments, you can give a feedback."}
                </p>
              ) : (
                <p className="font-bold text-lg md:text-xl text-center">
                  None of the students have given feedback yet.
                </p>
              )}
              {isAllowed && !isCourseOwner ? (
                <FeedbackForm
                  user={user}
                  course={course}
                  buttonClassName="w-1/2 mx-auto"
                />
              ) : null}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full flex flex-col gap-y-6">
          <div className="w-full flex flex-col gap-y-2 md:flex-row items-center justify-between pt-6">
            <h1 className="text-center md:text-start text-2xl md:text-3xl lg:text-4xl line-clamp-1  font-bold">
              {isCourseOwner
                ? "All Your Students Feedbacks"
                : "All Students Feedbacks"}
            </h1>
            {!alreadyGivenFeedback && !isCourseOwner ? (
              <FeedbackForm user={user} course={course} />
            ) : null}
          </div>
          <Separator className="h-[2px]" />
          <div className="w-full flex flex-col">
            {alreadyGivenFeedback ? (
              <FeedbackCard feedback={alreadyGivenFeedback} isOwner={true} />
            ) : null}

            {feedbacks.map((feedback: TFeedback, index) =>
              feedback._id !== alreadyGivenFeedback?._id ? (
                <FeedbackCard key={feedback._id} feedback={feedback} />
              ) : null
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default Feedbacks;
