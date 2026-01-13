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

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  return (
    <>
      {isMounted ? (
        <div className="w-full">
          {isAdmin ? <ReviewBanner course={course} /> : null}

          {/* Modern Video Player + Collapsible Sidebar Layout */}
          <div className="relative flex flex-col lg:flex-row w-full bg-slate-950">
            {/* Video Player Section - Enhanced with Toggle Button */}
            <div className={`w-full transition-all duration-500 ease-in-out ${isSidebarOpen ? 'lg:flex-1' : 'lg:w-full'} relative`}>
              {videoToWatch && videoToWatch.videoUrl ? (
                <div className="relative bg-black">
                  <VideoPlayer
                    video={videoToWatch}
                    isLoading={isLoading}
                    poster={course?.thumbnail!}
                  />
                  
                  {/* Video Title Overlay - Modern Design */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 lg:p-8">
                    <div className="max-w-5xl">
                      <h1 className="text-xl lg:text-2xl font-bold text-white drop-shadow-lg">
                        {videoToWatch.title}
                      </h1>
                    </div>
                  </div>

                  {/* Modern Toggle Button - Floating on Video */}
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className={`absolute top-4 right-4 z-20 hidden lg:flex items-center justify-center w-12 h-12 rounded-xl backdrop-blur-md transition-all duration-300 shadow-xl group ${
                      isSidebarOpen 
                        ? 'bg-slate-900/80 hover:bg-slate-900/90 border border-slate-700/50' 
                        : 'bg-brand-red-500/90 hover:bg-brand-red-600/90 border border-red-400/50'
                    }`}
                    aria-label={isSidebarOpen ? 'Hide course content' : 'Show course content'}
                  >
                    <svg 
                      className={`w-6 h-6 transition-all duration-300 ${
                        isSidebarOpen ? 'text-white rotate-0' : 'text-white rotate-180'
                      }`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2.5} 
                        d="M11 19l-7-7 7-7m8 14l-7-7 7-7" 
                      />
                    </svg>
                    <span className={`absolute -bottom-10 right-0 px-3 py-1 bg-slate-900/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none ${
                      isSidebarOpen ? '' : 'hidden'
                    }`}>
                      {isSidebarOpen ? 'Hide content' : 'Show content'}
                    </span>
                  </button>
                </div>
              ) : (
                <div className="w-full aspect-video bg-gradient-to-br from-slate-900 via-slate-950 to-black flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
                      <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-lg font-semibold text-slate-400 mb-1">
                      Select a video to watch
                    </p>
                    <p className="text-sm text-slate-600">
                      Choose from the course content {isSidebarOpen ? 'on the right' : 'by clicking the button above'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Collapsible Sidebar - Course Content */}
            {course!.sections!.length && videoToWatch ? (
              <div className={`w-full lg:w-[420px] transform transition-all duration-500 ease-in-out ${
                isSidebarOpen 
                  ? 'lg:translate-x-0 opacity-100' 
                  : 'lg:translate-x-full lg:w-0 opacity-0 lg:absolute lg:right-0 lg:pointer-events-none'
              }`}>
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
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
};

export default WatchScreen;
