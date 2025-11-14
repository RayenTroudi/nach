"use client";
import React from "react";

import { TAttachment, TCourse, TSection, TVideo } from "@/types/models.types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "@/components/shared";
import { AlertTriangle, FileDown, Video, VideoOff } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Props {
  course: TCourse;
}

const CourseInfo = ({ course }: Props) => {
  const [selectedItem, setSelectedItem] = React.useState<string | null>(null);

  // Check if course has meaningful content
  const hasContent = course?.sections && course.sections.length > 0 && 
    course.sections.some((section: TSection) => 
      (section.videos && section.videos.length > 0) || 
      (section.attachments && section.attachments.length > 0)
    );

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-brand-red-500 rounded-full" />
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Course Content
          </h2>
        </div>
        
        {course?.sections && course.sections.length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-3">
            {course?.sections?.map((section: TSection, key: number) => (
              <AccordionItem
                value={`${key}`}
                key={key}
                className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950/50"
                onClick={() => setSelectedItem(section.title)}
              >
                <AccordionTrigger
                  className={`text-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-900 hover:no-underline px-6 py-4 transition-all duration-300 ${
                    selectedItem === section.title
                      ? "bg-slate-100 dark:bg-slate-900 text-brand-red-500"
                      : "text-slate-900 dark:text-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      selectedItem === section.title
                        ? "bg-brand-red-500 text-white"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}>
                      {key + 1}
                    </div>
                    <span>{section.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="bg-white dark:bg-slate-950 px-6 py-4">
                  {section?.videos?.length ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
                        <Video size={16} className="text-brand-red-500" />
                        <span>Lectures</span>
                      </div>

                      <div className="space-y-2">
                        {section?.videos?.map((video: TVideo) => (
                          <div
                            key={video._id}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                              video.isFree 
                                ? "bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30" 
                                : "bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              video.isFree 
                                ? "bg-green-500" 
                                : "bg-slate-300 dark:bg-slate-700"
                            }`}>
                              {video.isFree ? (
                                <Video size={16} className="text-white" />
                              ) : (
                                <VideoOff size={16} className="text-slate-500" />
                              )}
                            </div>

                            <p className={`flex-1 font-medium ${
                              video.isFree 
                                ? "text-slate-900 dark:text-slate-100" 
                                : "text-slate-500 dark:text-slate-400"
                            }`}>
                              {video.title}
                            </p>

                            {video.isFree && (
                              <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950/50 px-2 py-1 rounded-full">
                                FREE
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                        Content coming soon! We&apos;re working on adding videos and materials to this section.
                      </p>
                    </div>
                  )}

                  {section?.attachments?.length ? (
                    <>
                      <Separator className="my-4 bg-slate-200 dark:bg-slate-800" />
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
                          <FileDown size={16} className="text-brand-red-500" />
                          <span>Attachments</span>
                        </div>
                        <div className="space-y-2">
                          {section?.attachments?.map((attachment: TAttachment) => (
                            <div
                              key={attachment._id}
                              className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-all duration-200"
                            >
                              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                <FileDown size={16} className="text-white" />
                              </div>
                              <p className="flex-1 font-medium text-slate-900 dark:text-slate-100">
                                {attachment.title}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : null}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={24} className="text-slate-400" />
            </div>
            <p className="text-lg font-semibold text-slate-600 dark:text-slate-400">No sections available yet</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">The instructor is still building this course</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseInfo;
