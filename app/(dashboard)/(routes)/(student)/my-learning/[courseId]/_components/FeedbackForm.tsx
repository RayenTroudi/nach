"use client";
import { Star } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { scnToast } from "@/components/ui/use-toast";
import { usePageLoader } from "@/contexts/PageLoaderProvider";
import { createFeedback } from "@/lib/actions/feedback.action";
import { cn } from "@/lib/utils";
import { TCourse, TUser } from "@/types/models.types";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

type Props = {
  user: TUser;
  course: TCourse;
  buttonClassName?: string;
};

const FeedbackForm = ({
  user,
  course,
  buttonClassName = "w-fit h-fit",
}: Props) => {
  const { setIsLoading } = usePageLoader();
  const router = useRouter();
  const [tempRating, setTempRating] = useState<number>(0);
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");

  const submitFeedback = async () => {
    try {
      if (!feedback || feedback.length < 50) return;

      setIsLoading(true);

      const newFeedback = await createFeedback({
        user: user._id,
        course: course._id,
        rating: feedbackRating,
        comment: feedback,
      });

      console.log("newFeedback", newFeedback);
    } catch (error: any) {
      scnToast({
        title: "Error",
        description: "Something went wrong, please try again later.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        router.refresh();

        scnToast({
          title: "Success",
          description: "Feedback submitted successfully.",
          variant: "success",
        });
      }, 500);
    }
  };
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          onClick={() => {}}
          className={cn(
            ` bg-[#FF782D] hover:bg-[#FF782D]  px-4 py-2  hover:opacity-90 transition-all duration-300 ease-in-out rounded-sm  font-bold text-slate-50 text-sm`,
            buttonClassName
          )}
        >
          Give Feedback
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="w-[90%] md:w-1/2 mx-auto">
          <DrawerHeader className="w-full flex flex-col gap-y-2 ">
            <DrawerTitle className="text-4xl ">
              What do you think about the course?
            </DrawerTitle>
            <DrawerDescription>
              Your feedback will help the instructor improve the course.
            </DrawerDescription>
          </DrawerHeader>

          <div className="w-full flex flex-col gap-y-8 pl-4">
            <div className="w-full  flex  justify-between">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  index={index}
                  size={50}
                  filled={(tempRating || feedbackRating) > index}
                  stars={tempRating || feedbackRating || 0}
                  onMouseEnter={() => setTempRating(index + 1)}
                  onMouseLeave={() => setTempRating(0)}
                  onClick={() =>
                    setFeedbackRating((prev) =>
                      prev === index + 1 ? 0 : index + 1
                    )
                  }
                />
              ))}

              <p className="text-5xl font-bold">
                {tempRating || feedbackRating || 0}
              </p>
            </div>

            <div className="w-ful flex flex-col gap-y-1">
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Please provide us with a detailed feedback about the course here ..."
                className="w-full h-[200px] leading-loose"
              />
              <div className="w-full flex items-center justify-between">
                <p className="flex items-center gap-x-1.5 text-slate-500 font-bold">
                  <span className="text-primaryColor">{feedback.length}</span> /
                  50
                </p>
              </div>
            </div>
          </div>

          <DrawerFooter className="mt-10">
            <Button
              disabled={!feedback || feedback.length < 50}
              onClick={submitFeedback}
            >
              Submit
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default FeedbackForm;
