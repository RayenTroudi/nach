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
    <div className="w-full lg:w-96 flex flex-col gap-2 max-h-[480px] overflow-y-auto bg-slate-50 dark:bg-slate-950">
      {isStudent && !isCourseOwner ? (
        <div className="w-full h-fit px-2 py-3 flex items-center justify-between bg-black text-white dark:bg-white dark:text-black ">
          <p className="text-lg font-bold line-clamp-1">{courseTitle}</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="!border-none">
              <div className="relative size-[45px] rounded-full border cursor-pointer">
                <svg
                  width="45"
                  height="45"
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
                <TrophyIcon
                  size={20}
                  className="text-primaryColor absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 pointer-events-none p-0">
              <DropdownMenuGroup className="p-0">
                <DropdownMenuItem className="pointer-events-none font-semibold text-md bg-transparent hover:bg-transparent">
                  Your Progress
                  <DropdownMenuShortcut>
                    {userProgress?.progress ?? 0}%{" "}
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="pointer-events-none font-normal text-xs">
                  <p
                    className={`${
                      userProgress?.isCompleted ? "text-green-600" : ""
                    }`}
                  >
                    {userProgress?.isCompleted
                      ? "All video completed"
                      : `${
                          allVideos.length -
                          (userCourseCompletedVideos?.length ?? 0)
                        } video(s) left`}
                  </p>
                  <DropdownMenuShortcut>
                    {userProgress?.isCompleted ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : (
                      <VideoIcon size={20} />
                    )}
                  </DropdownMenuShortcut>
                </DropdownMenuItem>

                <Button
                  className="rounded-none w-full mt-4"
                  disabled={!userProgress?.isCompleted}
                  onClick={() => router.push(`/certificate/${courseId}`)}
                >
                  Get Certificate
                </Button>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null}
      <Accordion type="single" collapsible className="">
        {sections.map((section: TSection, index: number) => (
          <AccordionItem
            key={section._id}
            value={index + ""}
            className="group  px-2 rounded-sm group-hover:border-none "
          >
            <AccordionTrigger className="group-hover:no-underline w-full  relative">
              <h2 className="font-bold text-slate-900 dark:text-slate-300">
                {" "}
                {section.title.length > 25
                  ? `${section.title.slice(0, 26)} ...`
                  : section.title}{" "}
              </h2>
              {isAdmin ? (
                <>
                  {section?.isPublished ? (
                    <Badge className="bg-[#065f46] hover:bg-[#065f46] text-slate-200 font-bold absolute right-5 top-5">
                      Published
                    </Badge>
                  ) : (
                    <Badge className=" text-slate-200 dark:bg-slate-700 dark:text-slate-200 font-bold absolute right-5 top-5">
                      Draft
                    </Badge>
                  )}{" "}
                </>
              ) : null}
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 w-full">
              <div className="flex flex-col items-start gap-x-1 w-full">
                {section?.videos?.length ? (
                  <>
                    {section!.videos!.map((video: TVideo, index: number) => (
                      <div key={video._id} className="w-full">
                        {isStudent ? (
                          <div
                            className={`w-full flex items-center rounded-sm gap-x-2 hover:bg-slate-200/50 dark:hover:bg-slate-900 duration-300 ease-in-out cursor-pointer p-2
                      ${
                        !video?.videoUrl ? "pointer-events-none opacity-50" : ""
                      } ${
                              video._id === selectedVideo._id
                                ? "bg-slate-200/80 dark:bg-slate-900"
                                : ""
                            }
                    `}
                          >
                            {isStudent && !isCourseOwner ? (
                              <>
                                {videoToComplete &&
                                videoToComplete?._id === video._id ? (
                                  <Spinner size={18} />
                                ) : (
                                  <Checkbox
                                    checked={
                                      userCourseCompletedVideos
                                        ? userCourseCompletedVideos?.some(
                                            (
                                              completedVideo: TUserCourseVideoCompleted
                                            ) =>
                                              completedVideo.videoId._id ===
                                              video._id
                                          )
                                        : false
                                    }
                                    id={video._id}
                                    onClick={() => toggleVideoCompleted(video)}
                                  />
                                )}
                              </>
                            ) : null}
                            <label
                              onClick={() => onChangeVideoToWatchHandler(video)}
                              className="cursor-pointer text-[13px] font-bold text-slate-500 dark:text-slate-300 pl-2 border-l-2"
                            >
                              {video.title}
                            </label>
                          </div>
                        ) : (
                          <div
                            className={`w-full flex items-center rounded-sm gap-x-2 hover:bg-slate-200/50 dark:hover:bg-slate-900 duration-300 ease-in-out cursor-pointer p-2
                      ${
                        !video?.videoUrl ? "pointer-events-none opacity-50" : ""
                      } ${
                              video._id === selectedVideo._id
                                ? "bg-slate-200/80 dark:bg-slate-900"
                                : ""
                            }
                    `}
                            onClick={() => onChangeVideoToWatchHandler(video)}
                          >
                            {video.videoUrl ? (
                              <Video
                                size={18}
                                className="text-slate-500 dark:text-slate-300  "
                              />
                            ) : (
                              <VideoOff
                                size={18}
                                className="text-slate-500  "
                              />
                            )}
                            <p className="text-[13px] font-bold text-slate-500 dark:text-slate-300 pl-2 border-l-2">
                              {video.title}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-[#065f46] text-[13px] font-bold">
                    No Videos yet.
                  </p>
                )}
              </div>
              {section?.attachments?.length ? (
                <div className="flex flex-col items-start gap-x-1 w-full ml-2">
                  <p className="text-brand-red-500 font-bold">
                    Attachments & Resources
                  </p>
                  {section?.attachments?.map(
                    (attachment: TAttachment, index: number) => (
                      <Link
                        href={attachment.url}
                        target="_blank"
                        key={index}
                        className="w-full flex items-center gap-x-2 hover:bg-slate-200/80 dark:hover:bg-slate-950/80 duration-300 ease-in-out cursor-pointer p-2"
                      >
                        <FileDown
                          size={18}
                          className="text-slate-500 dark:text-slate-300 "
                        />
                        <p className="text-[13px] font-bold text-slate-500 dark:text-slate-300 pl-2 border-l-2">
                          {attachment.title}
                        </p>
                      </Link>
                    )
                  )}
                </div>
              ) : null}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ) : null;
};

export default SectionsToWatch;
