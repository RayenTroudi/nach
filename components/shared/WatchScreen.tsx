"use client";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

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
import LinkifiedText from "@/components/shared/LinkifiedText";
import FilePacksDisplay from "@/components/shared/FilePacksDisplay";
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
  const t = useTranslations("video");

  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState<boolean>(false);

  const allVideos =
    course?.sections
      ?.flatMap((section: TSection) => section.videos)
      .filter((video) => video !== undefined) ?? [];

  const isStudent =
    !pathname.includes("/admin") && !pathname.includes("/teacher");
  const isAdmin = pathname.includes("/admin") || pathname.startsWith("/admin");
  
  const MAX_DESCRIPTION_LENGTH = 300;

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
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
    
  const onChangeVideoToWatchHandler = (video: TVideo) => {
    setIsLoading(true);
    setVideoToWatch(video);
    setIsDescriptionExpanded(false); // Reset description state when changing videos
    // Remove video immediately without unnecessary delay
    setIsLoading(false);
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

          {/* Modern Video Player + Collapsible Sidebar Layout */}
          <div className="relative flex flex-col lg:flex-row w-full bg-white dark:bg-slate-950">
            {/* Video Player Section - Enhanced with Toggle Button */}
            <div className={`w-full transition-all duration-500 ease-in-out ${isSidebarOpen ? 'lg:flex-1' : 'lg:w-full'} relative`}>
              {videoToWatch && videoToWatch.videoUrl ? (
                <div className="relative bg-black">
                  <VideoPlayer
                    video={videoToWatch}
                    isLoading={isLoading}
                    poster={course?.thumbnail!}
                  />
                  
                  {/* Video Title Overlay - Modern Design - Moved up to avoid controls */}
                  <div className="absolute bottom-16 left-0 right-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent p-4 lg:p-6 pointer-events-none z-10">
                    <div className="max-w-5xl">
                      <h1 className="text-xl lg:text-2xl font-bold text-white drop-shadow-lg">
                        {videoToWatch.title}
                      </h1>
                    </div>
                  </div>

                  {/* Modern Toggle Button - Floating on Video - RTL Support */}
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className={`absolute top-4 ltr:right-4 rtl:left-4 z-20 hidden lg:flex items-center justify-center w-12 h-12 rounded-xl backdrop-blur-md transition-all duration-300 shadow-xl group ${
                      isSidebarOpen 
                        ? 'bg-slate-900/80 hover:bg-slate-900/90 border border-slate-700/50' 
                        : 'bg-brand-red-500/90 hover:bg-brand-red-600/90 border border-red-400/50'
                    }`}
                    aria-label={isSidebarOpen ? 'Hide course content' : 'Show course content'}
                  >
                    <svg 
                      className={`w-6 h-6 transition-all duration-300 ${
                        isSidebarOpen ? 'text-white ltr:rotate-0 rtl:rotate-180' : 'text-white ltr:rotate-180 rtl:rotate-0'
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
                    <span className={`absolute -bottom-10 ltr:right-0 rtl:left-0 px-3 py-1 bg-slate-900/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none ${
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

              {/* Video Description Section */}
              {videoToWatch && videoToWatch.description && (
                <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                  <div className="max-w-5xl mx-auto px-6 lg:px-8 py-6">
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      {t("description")}
                    </h3>
                    <div className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                      {videoToWatch.description.length > MAX_DESCRIPTION_LENGTH && !isDescriptionExpanded ? (
                        <>
                          <LinkifiedText 
                            text={videoToWatch.description.substring(0, MAX_DESCRIPTION_LENGTH) + "..."}
                            className="whitespace-pre-wrap"
                          />
                          <button
                            onClick={() => setIsDescriptionExpanded(true)}
                            className="block mt-2 text-brand-red-500 hover:text-brand-red-600 font-medium text-sm transition-colors duration-200"
                          >
                            {t("showMore")}
                          </button>
                        </>
                      ) : (
                        <>
                          <LinkifiedText 
                            text={videoToWatch.description}
                            className="whitespace-pre-wrap"
                          />
                          {videoToWatch.description.length > MAX_DESCRIPTION_LENGTH && (
                            <button
                              onClick={() => setIsDescriptionExpanded(false)}
                              className="block mt-2 text-brand-red-500 hover:text-brand-red-600 font-medium text-sm transition-colors duration-200"
                            >
                              {t("showLess")}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* File Packs Display - Show purchasable file packs */}
              {videoToWatch && videoToWatch.filePacks && videoToWatch.filePacks.length > 0 && (
                <FilePacksDisplay 
                  filePacks={videoToWatch.filePacks as any[]}
                  userId={user?._id}
                  purchasedBundleIds={user?.purchasedDocumentBundles?.map((bundle: any) => 
                    typeof bundle === 'string' ? bundle : bundle._id
                  ) || []}
                />
              )}
            </div>

            {/* Collapsible Sidebar - Course Content - RTL Support */}
            {course!.sections!.length && videoToWatch ? (
              <div className={`w-full lg:w-[420px] transform transition-all duration-500 ease-in-out ${
                isSidebarOpen 
                  ? 'ltr:lg:translate-x-0 rtl:lg:translate-x-0 opacity-100' 
                  : 'ltr:lg:translate-x-full rtl:lg:-translate-x-full lg:w-0 opacity-0 ltr:lg:absolute rtl:lg:absolute ltr:lg:right-0 rtl:lg:left-0 lg:pointer-events-none'
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
