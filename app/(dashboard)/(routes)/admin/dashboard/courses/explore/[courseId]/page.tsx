"use server";
import { getCourseById } from "@/lib/actions";
import React from "react";

import { TCourse } from "@/types/models.types";
import { WatchScreen } from "@/components/shared";

const CourseIdPage = async ({ params }: { params: { courseId: string } }) => {
  let course: TCourse = {} as TCourse;

  try {
    course = await getCourseById({ courseId: params.courseId });
  } catch (error: any) {
    console.log("CourseIdPage Error: ", error.message);
  }

  return (
    <div className="">
      <WatchScreen course={course} />
    </div>
  );
};

export default CourseIdPage;
