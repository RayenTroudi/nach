"use client";
import ConfettiAnimation from "@/components/shared/ConfettiAnimation";
import { Button } from "@/components/ui/button";
import { scnToast } from "@/components/ui/use-toast";
import { publishCourse } from "@/lib/actions/course.action";
import { TUser } from "@/types/models.types";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";

interface Props {
  course: {
    _id: string;
    instructor: TUser;
  };
}

const PublishCourseButton = ({ course }: Props) => {
  const pathname = usePathname();
  const router = useRouter();

  const [showConfettiAnimation, setShowConfettiAnimation] =
    useState<boolean>(false);

  const onPublishCourseHandler = async () => {
    try {
      setShowConfettiAnimation(true);

      await publishCourse({
        courseId: course._id,
        instructorId: course.instructor._id,
      });

      scnToast({
        variant: "success",
        title: "Congrats !",
        description: "Course has been published successfully.",
      });

      setTimeout(() => {
        setShowConfettiAnimation(false);
        router.refresh();
      }, 4000);
    } catch (error: any) {
      setShowConfettiAnimation(false);
      scnToast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };
  return (
    <>
      {showConfettiAnimation ? <ConfettiAnimation /> : null}
      <Button
        disabled={showConfettiAnimation}
        className="w-full md:w-fit bg-[#FF782D] opacity-80 hover:bg-[#FF782D] hover:opacity-100 text-white"
        onClick={onPublishCourseHandler}
      >
        Publish Now
      </Button>
    </>
  );
};

export default PublishCourseButton;
