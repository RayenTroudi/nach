"use client";
import { Button } from "@/components/ui/button";
import { scnToast } from "@/components/ui/use-toast";
import { updateCourseStatus } from "@/lib/actions/course.action";
import { CourseStatusEnum } from "@/lib/enums";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import toast from "react-hot-toast";

interface Props {
  course: {
    _id: string;
  };
}

const SubmitForReviewButton = ({ course }: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const onSubmitCourseToReviewHandler = async () => {
    try {
      await updateCourseStatus({
        courseId: course?._id,
        status: CourseStatusEnum.Pending,
        path: pathname,
      });
      scnToast({
        variant: "success",
        title: "Congrats !",
        description: "Course submitted for review",
      });
      router.refresh();
    } catch (error: any) {
      scnToast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };
  return (
    <Button
      onClick={onSubmitCourseToReviewHandler}
      className="w-full md:w-fit bg-brand-red-500 opacity-80 hover:bg-brand-red-600 hover:opacity-100 text-white"
    >
      Submit To Review
    </Button>
  );
};

export default SubmitForReviewButton;
