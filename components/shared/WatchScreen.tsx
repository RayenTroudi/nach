"use client";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  TCourse,
  TSection,
  TUserProgress,
  TUser,
  TVideo,
} from "@/types/models.types";
import VideoPlayer from "@/components/shared/VideoPlayer";
import SectionsToWatch from "./SectionsToWatch";
import ReviewBanner from "./ReviewBanner";
import { TUserCourseVideoCompleted } from "../../types/models.types";

interface Props {
  user?: TUser;
  isCourseOwner?: boolean;
  course: TCourse;
  userProgress?: TUserProgress;
  userCourseCompletedVideos?: TUserCourseVideoCompleted[];
}

const WatchScreen = ({
  user,
  isCourseOwner,
  course,
  userProgress,
  userCourseCompletedVideos,
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  const [isMounted, setIsMounted] = useState<boolean>(false);

  const allVideos =
    course?.sections
      ?.flatMap((section: TSection) => section.videos)
      .filter((video) => video !== undefined) ?? [];

  const isStudent =
    !pathname.includes("/admin") && !pathname.includes("/teacher");
  const isAdmin = pathname.includes("/admin") || pathname.startsWith("/admin");

  // Find first available video
  const getFirstVideo = () => {
    if (!course?.sections || course.sections.length === 0) return null;
    
    for (const section of course.sections) {
      if (section.videos && section.videos.length > 0) {
        return section.videos[0];
      }
    }
    return null;
  };

  const [videoToWatch, setVideoToWatch] = useState<TVideo | null>(getFirstVideo());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onChangeVideoToWatchHandler = (video: TVideo) => {
    setIsLoading(true);
    setVideoToWatch(video);
    setTimeout(() => {
      setIsLoading(false);
      router.refresh();
    }, 1000);
  };

  useEffect(() => setIsMounted(true), []);

  // If no videos available, show message
  if (!course?.sections || course.sections.length === 0 || !getFirstVideo()) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            No Videos Available
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            The instructor hasn&apos;t uploaded any videos yet. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isMounted ? (
        <div className="w-full">
          {isAdmin ? <ReviewBanner course={course} /> : null}
          {/* {isStudent && progress ? (
            <UserProgressBar progress={progress} />
          ) : null} */}

          <div className="flex flex-col lg:flex-row w-full">
            {videoToWatch && videoToWatch.videoUrl ? (
              <VideoPlayer
                video={videoToWatch}
                isLoading={isLoading}
                poster={course?.thumbnail!}
              />
            ) : (
              <div className="w-full lg:flex-1 bg-slate-100 dark:bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-slate-600 dark:text-slate-400">
                      Select a video to watch
                    </p>
                  </div>
                </div>
              </div>
            )}
            {course!.sections!.length && videoToWatch ? (
              <SectionsToWatch
                isCourseOwner={isCourseOwner}
                courseId={course!._id!}
                courseTitle={course!.title!}
                sections={course!.sections!}
                selectedVideo={videoToWatch}
                userProgress={userProgress}
                userCourseCompletedVideos={userCourseCompletedVideos}
                isStudent={isStudent}
                onChangeVideoToWatchHandler={onChangeVideoToWatchHandler}
                allVideos={
                  allVideos
                    ? allVideos.filter((video): video is TVideo =>
                        Boolean(video)
                      )
                    : []
                }
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
};

export default WatchScreen;
