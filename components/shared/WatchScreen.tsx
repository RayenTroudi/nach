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

  const [videoToWatch, setVideoToWatch] = useState<TVideo>(
    course?.sections![0].videos![0]
  );
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

  return (
    <>
      {isMounted ? (
        <div className="w-full flex flex-col gap-y-1 md:gap-y-0">
          {isAdmin ? <ReviewBanner course={course} /> : null}
          {/* {isStudent && progress ? (
            <UserProgressBar progress={progress} />
          ) : null} */}

          <div
            className={`flex ${
              isStudent ? "flex-col-reverse" : "flex-col"
            }  lg:flex-row `}
          >
            {course!.sections!.length && course?.sections![0].videos?.length ? (
              <VideoPlayer
                video={videoToWatch}
                isLoading={isLoading}
                poster={course?.thumbnail!}
              />
            ) : null}
            {course!.sections!.length ? (
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
