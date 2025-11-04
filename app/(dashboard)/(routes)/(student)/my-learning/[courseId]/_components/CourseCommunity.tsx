"use client";
import { TCourse, TUserProgress, TUser } from "@/types/models.types";

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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Tabs defaultValue="q&a" className="w-full">
        <TabsList className="w-full h-14 flex justify-start items-center rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 mb-6">
          <TabsTrigger
            id="comments"
            value="q&a"
            className="text-base font-semibold rounded-md px-6 h-full flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:dark:bg-slate-800 data-[state=active]:shadow-sm data-[state=active]:text-[#FF782D] text-slate-600 dark:text-slate-400 transition-all duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Q&A
          </TabsTrigger>
          <TabsTrigger
            id="feedbacks"
            value="feedbacks"
            className="text-base font-semibold rounded-md px-6 h-full flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:dark:bg-slate-800 data-[state=active]:shadow-sm data-[state=active]:text-[#FF782D] text-slate-600 dark:text-slate-400 transition-all duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
              <line x1="16" y1="8" x2="2" y2="22" />
              <line x1="17.5" y1="15" x2="9" y2="15" />
            </svg>
            Reviews
          </TabsTrigger>
        </TabsList>
        <TabsContent value="q&a" className="w-full mt-0">
          <Comments course={course} user={user} />
        </TabsContent>
        <TabsContent value="feedbacks" className="w-full mt-0">
          <Feedbacks
            isCourseOwner={isOwner}
            course={course}
            feedbacks={course.feedbacks}
            user={user}
            isAllowed={userProgress?.isCompleted ?? false}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseCommunity;
