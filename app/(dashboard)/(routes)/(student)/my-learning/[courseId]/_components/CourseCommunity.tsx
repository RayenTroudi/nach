"use client";
import { TCourse, TQuiz, TUserProgress, TUser } from "@/types/models.types";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import Comments from "./Comments";
import Feedbacks from "./Feedbacks";

interface Props {
  user: TUser;
  course: TCourse;
  userProgress: TUserProgress;
}

const CourseCommunity = ({ user, course, userProgress }: Props) => {
  const isOwner = user._id === course.instructor._id;
  const allQuizzes: TQuiz[] = course.sections
    ?.map((section) => (section.quiz !== null ? section.quiz : null))
    .filter((quiz) => quiz !== null) as TQuiz[];

  const solvedQuizzes = allQuizzes.filter(
    (quiz) =>
      quiz?.passedUsers?.some((passedUser) => passedUser._id === user!._id) ??
      []
  );
  return (
    <Tabs defaultValue="q&a" className="w-full flex-1 ">
      <TabsList className="border-t border-b  w-full h-[80px] flex justify-start items-center  rounded-none  bg-transparent shadow-lg p-0 ">
        <TabsTrigger
          id="comments"
          value="q&a"
          className="text-lg rounded-none min-w-[200px]   h-full flex items-center justify-center data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:dark:border-white data-[state=active]:text-black  data-[state=active]:dark:text-white text-slate-500  transition-all duration-300   ease-in-out"
        >
          Q&A
        </TabsTrigger>
        <TabsTrigger
          id="feedbacks"
          value="feedbacks"
          className="rounded-none text-lg px-2 min-w-[200px] h-full flex items-center justify-center data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:dark:border-white data-[state=active]:text-black  data-[state=active]:dark:text-white text-slate-500  transition-all duration-300   ease-in-out"
        >
          Feedbacks
        </TabsTrigger>
      </TabsList>
      <TabsContent value="q&a" className="w-full  mb-11 p-0 ">
        <Comments course={course} user={user} />
      </TabsContent>
      <TabsContent value="feedbacks" className="w-full  mb-11 p-0 ">
        <Feedbacks
          isCourseOwner={isOwner}
          course={course}
          feedbacks={course.feedbacks}
          user={user}
          isAllowed={
            (solvedQuizzes.length === allQuizzes.length &&
              userProgress.isCompleted) ??
            false
          }
        />
      </TabsContent>
    </Tabs>
  );
};

export default CourseCommunity;
