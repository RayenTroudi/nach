"use client";
import React from "react";
import { TCourse } from "@/types/models.types";
import { CourseTypeEnum } from "@/lib/enums";

interface Props {
  course: TCourse;
}

const CourseTypeForm = ({ course }: Props) => {
  const displayCourseType = course?.courseType === CourseTypeEnum.Most_Frequent_Questions
    ? "Most Frequent Questions (FAQ Reel)"
    : "Regular Course";

  return (
    <div className="flex flex-col gap-2 bg-slate-200/10 px-3 dark:bg-slate-800/10 rounded-sm py-3">
      <div className="text-sm text-slate-700 dark:text-slate-300">
        <strong>Course Type:</strong> {displayCourseType}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Course type cannot be changed after creation. Create a new course to use a different type.
      </p>
    </div>
  );
};

export default CourseTypeForm;
