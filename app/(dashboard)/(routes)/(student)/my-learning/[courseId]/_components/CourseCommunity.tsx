"use client";
import { TCourse, TUserProgress, TUser } from "@/types/models.types";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import Comments from "./Comments";
import Feedbacks from "./Feedbacks";
import { useTranslations } from 'next-intl';

interface Props {
  user: TUser;
  course: TCourse;
  userProgress: TUserProgress;
}

const CourseCommunity = ({ user, course, userProgress }: Props) => {
  const isOwner = user._id === course.instructor._id;
  const t = useTranslations('dashboard.student.myLearning.courseCommunity');

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Modern Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {t('title')}
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          {t('subtitle')}
        </p>
      </div>

      <Tabs defaultValue="q&a" className="w-full">
        <TabsList className="w-full lg:w-auto inline-flex h-12 items-center justify-start gap-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 mb-8 shadow-sm">
          <TabsTrigger
            id="comments"
            value="q&a"
            className="inline-flex items-center justify-center gap-2 rounded-lg px-5 h-9 text-sm font-semibold transition-all duration-200 data-[state=active]:bg-white data-[state=active]:dark:bg-slate-800 data-[state=active]:shadow-md data-[state=active]:text-brand-red-500 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>{t('qna')}</span>
          </TabsTrigger>
          <TabsTrigger
            id="feedbacks"
            value="feedbacks"
            className="inline-flex items-center justify-center gap-2 rounded-lg px-5 h-9 text-sm font-semibold transition-all duration-200 data-[state=active]:bg-white data-[state=active]:dark:bg-slate-800 data-[state=active]:shadow-md data-[state=active]:text-brand-red-500 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>{t('reviews')}</span>
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
