import { LeftSideBar } from "@/components/shared";
import React from "react";

const TeacherCoursesLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex">
      <LeftSideBar />
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default TeacherCoursesLayout;
