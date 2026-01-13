"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  TAttachment,
  TSection,
  TUserProgress,
  TUserCourseVideoCompleted,
  TVideo,
} from "@/types/models.types";
import {
  CheckCircle,
  FileDown,
  FileQuestion,
  TrophyIcon,
  Video,
  VideoIcon,
  VideoOff,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Checkbox } from "../ui/checkbox";
import {
  addCompletedCourseVideo,
  deleteCompletedCourseVideo,
} from "@/lib/actions/user-course-video-completed.action";
import { scnToast } from "../ui/use-toast";
import Spinner from "./Spinner";
import Image from "next/image";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface Props {
  isCourseOwner?: boolean;
  courseId: string;
  courseTitle: string;
  sections: TSection[];
  selectedVideo: TVideo;
  userProgress?: TUserProgress;
  userCourseCompletedVideos?: TUserCourseVideoCompleted[];
  allVideos: TVideo[];
  isStudent: boolean;

  onChangeVideoToWatchHandler: (video: TVideo) => void;
}

const SectionsToWatch = ({
  isCourseOwner,
  courseId,
  courseTitle,
  sections,
  selectedVideo,
  userProgress,
  userCourseCompletedVideos,
  isStudent,
  allVideos,

  onChangeVideoToWatchHandler,
}: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = pathname?.includes("/admin");

  const [videoToComplete, setVideoToComplete] = useState<TVideo | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const toggleVideoCompleted = async (video: TVideo) => {
    const videoAlreadyCompleted = userCourseCompletedVideos?.some(
      (completedVideo) => completedVideo.videoId._id === video._id
    );
    try {
      setVideoToComplete(video);

      if (videoAlreadyCompleted) {
        await deleteCompletedCourseVideo({
          userId: userProgress?.userId._id!,
          courseId: userProgress?.courseId._id!,
          videoId: video._id,
          allVideos: allVideos.length,
        });
      } else {
        await addCompletedCourseVideo({
          userId: userProgress?.userId._id!,
          courseId: userProgress?.courseId._id!,
          videoId: video._id,
          allVideos: allVideos.length,
        });
      }

      router.refresh();
    } catch (error: any) {
      console.log("toggleVideoCompleted : ", error.message);
      scnToast({
        title: "Error",
        description: "Failed to mark video as completed.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setVideoToComplete(null);
        scnToast({
          title: "Success",
          description: `${video.title} marked as completed.`,
          variant: "success",
        });
        router.refresh();
      }, 500);
    }
  };

  useEffect(() => setIsMounted(true), []);

  return isMounted ? (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 ltr:border-l rtl:border-r border-slate-200 dark:border-slate-800 shadow-2xl">
      {/* Modern Header with Progress */}
      {isStudent && !isCourseOwner ? (
        <div className="w-full px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-red-500 animate-pulse"></div>
                <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Course Content
                </h2>
              </div>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                {courseTitle}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="!border-none flex-shrink-0">
                <button className="relative group">
                  <div className="relative size-[52px] rounded-xl bg-gradient-to-br from-brand-red-500 to-brand-red-600 shadow-lg shadow-brand-red-500/20 group-hover:shadow-xl group-hover:shadow-brand-red-500/30 transition-all duration-300 group-hover:scale-105">
                    <svg
                      width="52"
                      height="52"
                      viewBox="0 0 250 250"
                      className="circular-progress"
                      style={
                        {
                          "--progress": userProgress?.progress || 0,
                        } as React.CSSProperties
                      }
                    >
                      <circle className="bg"></circle>
                      <circle className="fg"></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <TrophyIcon
                        size={18}
                        className="text-white mb-0.5"
                      />
                      <span className="text-[10px] font-bold text-white">
                        {userProgress?.progress || 0}%
                      </span>
                    </div>
                  </div>
                </button>
              </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-4 shadow-xl">
              <DropdownMenuGroup className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-lg text-slate-900 dark:text-slate-100">Your Progress</span>
                  <span className="text-2xl font-bold text-brand-red-500">
                    {userProgress?.progress ?? 0}%
                  </span>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-950 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {userProgress?.isCompleted
                        ? "🎉 All videos completed!"
                        : `${allVideos.length - (userCourseCompletedVideos?.length ?? 0)} video(s) remaining`}
                    </span>
                    {userProgress?.isCompleted ? (
                      <CheckCircle size={18} className="text-green-500" />
                    ) : (
                      <VideoIcon size={18} className="text-slate-400" />
                    )}
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-brand-red-500 to-brand-red-600 transition-all duration-500"
                      style={{ width: `${userProgress?.progress ?? 0}%` }}
                    />
                  </div>
                </div>

                <Button
                  className="w-full h-11 bg-gradient-to-r from-brand-red-500 to-brand-red-600 hover:from-brand-red-600 hover:to-brand-red-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!userProgress?.isCompleted}
                  onClick={() => router.push(`/certificate/${courseId}`)}
                >
                  {userProgress?.isCompleted ? '🏆 Get Your Certificate' : '🔒 Complete Course to Get Certificate'}
                </Button>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>
      ) : null}
      
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        <Accordion type="single" collapsible className="px-4 py-2">
          {sections.map((section: TSection, index: number) => (
            <AccordionItem
              key={section._id}
              value={index + ""}
              className="border-none mb-2 rounded-xl overflow-hidden bg-white dark:bg-slate-900/50 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <AccordionTrigger className="hover:no-underline px-4 py-4 hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent dark:hover:from-slate-800/50 dark:hover:to-transparent transition-all duration-200">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-red-500 to-brand-red-600 text-white text-sm font-bold shadow-md shadow-brand-red-500/20">
                    {index + 1}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 text-left line-clamp-2 flex-1">
                    {section.title}
                  </h3>
                  {isAdmin && (
                    <Badge className={`ml-2 ${section?.isPublished ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-400 dark:bg-slate-700'} text-white text-xs shadow-sm`}>
                      {section?.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2 w-full px-2 pb-2">
              <div className="flex flex-col items-start gap-x-1 w-full">
                {section?.videos?.length ? (
                  <>
                    {section!.videos!.map((video: TVideo, index: number) => (
                      <div key={video._id} className="w-full">
                        {isStudent ? (
                          <div
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group cursor-pointer
                              ${
                                !video?.videoUrl 
                                  ? "pointer-events-none opacity-40" 
                                  : "hover:bg-gradient-to-r ltr:hover:from-slate-100 rtl:hover:from-transparent ltr:hover:to-transparent rtl:hover:to-slate-100 dark:ltr:hover:from-slate-800 dark:rtl:hover:from-transparent dark:ltr:hover:to-transparent dark:rtl:hover:to-slate-800"
                              } 
                              ${
                                video._id === selectedVideo._id
                                  ? "bg-gradient-to-r ltr:from-brand-red-50 rtl:from-transparent ltr:to-transparent rtl:to-brand-red-50 dark:ltr:from-brand-red-950/30 dark:rtl:from-transparent dark:ltr:to-transparent dark:rtl:to-brand-red-950/30 ltr:border-l-4 rtl:border-r-4 border-brand-red-500 shadow-sm"
                                  : "ltr:border-l-4 rtl:border-r-4 border-transparent"
                              }
                            `}
                          >
                            {isStudent && !isCourseOwner ? (
                              <div className="flex-shrink-0">
                                {videoToComplete && videoToComplete?._id === video._id ? (
                                  <Spinner size={18} />
                                ) : (
                                  <Checkbox
                                    checked={
                                      userCourseCompletedVideos
                                        ? userCourseCompletedVideos?.some(
                                            (completedVideo: TUserCourseVideoCompleted) =>
                                              completedVideo.videoId._id === video._id
                                          )
                                        : false
                                    }
                                    id={video._id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleVideoCompleted(video);
                                    }}
                                    className="w-5 h-5"
                                  />
                                )}
                              </div>
                            ) : null}
                            <div 
                              onClick={() => onChangeVideoToWatchHandler(video)}
                              className="flex items-center gap-3 flex-1 min-w-0"
                            >
                              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                                video._id === selectedVideo._id
                                  ? 'bg-brand-red-500 text-white'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                              }`}>
                                <Video size={16} />
                              </div>
                              <span className={`text-sm font-semibold flex-1 min-w-0 ${
                                video._id === selectedVideo._id
                                  ? 'text-brand-red-600 dark:text-brand-red-400'
                                  : 'text-slate-700 dark:text-slate-300'
                              }`}>
                                {video.title}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer
                              ${
                                !video?.videoUrl 
                                  ? "pointer-events-none opacity-40" 
                                  : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                              } 
                              ${
                                video._id === selectedVideo._id
                                  ? "bg-brand-red-50 dark:bg-brand-red-950/20 border-2 border-brand-red-500"
                                  : "border-2 border-transparent"
                              }
                            `}
                            onClick={() => onChangeVideoToWatchHandler(video)}
                          >
                            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                              video._id === selectedVideo._id
                                ? 'bg-brand-red-500 text-white'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                            }`}>
                              {video.videoUrl ? (
                                <Video size={16} />
                              ) : (
                                <VideoOff size={16} />
                              )}
                            </div>
                            <span className={`text-sm font-semibold flex-1 ${
                              video._id === selectedVideo._id
                                ? 'text-brand-red-600 dark:text-brand-red-400'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}>
                              {video.title}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                    <VideoOff size={16} className="text-yellow-600 dark:text-yellow-400" />
                    <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                      No videos available yet
                    </p>
                  </div>
                )}
              </div>
              {section?.attachments?.length ? (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-3 px-2">
                    <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <FileDown size={12} className="text-white" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                      Attachments & Resources
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {section?.attachments?.map(
                      (attachment: TAttachment, index: number) => (
                        <Link
                          href={attachment.url}
                          target="_blank"
                          key={index}
                          className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r ltr:from-blue-50 rtl:from-transparent ltr:to-transparent rtl:to-blue-50 dark:ltr:from-blue-950/20 dark:rtl:from-transparent dark:ltr:to-transparent dark:rtl:to-blue-950/20 hover:ltr:from-blue-100 hover:rtl:from-transparent hover:ltr:to-blue-50 hover:rtl:to-blue-100 dark:hover:ltr:from-blue-950/30 dark:hover:rtl:from-transparent dark:hover:ltr:to-blue-950/10 dark:hover:rtl:to-blue-950/30 ltr:border-l-4 rtl:border-r-4 border-blue-500 hover:border-blue-600 transition-all duration-200 group shadow-sm hover:shadow-md"
                        >
                          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-blue-500/20">
                            <FileDown size={16} />
                          </div>
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {attachment.title}
                          </span>
                          <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:ltr:translate-x-0.5 group-hover:rtl:-translate-x-0.5 group-hover:-translate-y-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      )
                    )}
                  </div>
                </div>
              ) : null}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      </div>
    </div>
  ) : null;
};

export default SectionsToWatch;
