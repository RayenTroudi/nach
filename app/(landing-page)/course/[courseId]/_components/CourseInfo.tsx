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

  return (
    <Container className=" w-full ">
      <h2 className="text-xl lg:text-2xl font-semibold mb-2">
        All course sections
      </h2>
      <Accordion type="single" collapsible className="w-full lg:w-[950px]">
        {course?.sections?.map((section: TSection, key: number) => (
          <AccordionItem
            value={`${key}`}
            key={key}
            className=""
            onClick={() => setSelectedItem(section.title)}
          >
            <AccordionTrigger
              className={`text-lg hover:bg-slate-200/80 font-normal dark:hover:bg-slate-900 hover:no-underline px-3 rounded-t-md transition-all duration-300 ease-in-out ${
                selectedItem
                  ? selectedItem === section.title
                    ? "bg-slate-200/80 dark:bg-slate-900"
                    : ""
                  : ""
              } `}
            >
              {" "}
              {section.title}{" "}
            </AccordionTrigger>
            <AccordionContent className="bg-slate-200/80 dark:bg-slate-900 px-3 flex flex-col gap-y-3 ">
              {section?.videos?.length ? (
                <div className="flex flex-col gap-y-2">
                  <h3 className="text-md font-bold">Lectures</h3>

                  {section?.videos?.map((video: TVideo) => (
                    <div
                      key={video._id}
                      className="flex items-center gap-x-2 ml-2"
                    >
                      {video.isFree ? (
                        <Video size={17} />
                      ) : (
                        <VideoOff size={17} className="text-slate-500" />
                      )}

                      <Separator className="h-[20px] w-[2px] bg-slate-300 dark:bg-border" />

                      <p
                        className={`text-md font-normal ${
                          !video.isFree ? "text-slate-500" : ""
                        }`}
                      >
                        {" "}
                        {video.title}{" "}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="flex items-center gap-x-2 ml-2">
                  <AlertTriangle
                    size={17}
                    className="text-[#065f46] font-bold"
                  />
                  <p className="text-[#065f46] font-bold">
                    Videos and more content coming soon.
                  </p>
                </p>
              )}

              {section?.attachments?.length ? (
                <>
                  <Separator className="bg-slate-300 dark:bg-border" />
                  <div className="flex flex-col gap-y-2">
                    <h3 className="text-md font-bold">Attachments</h3>
                    {section?.attachments?.map(
                      (attachment: TAttachment, key: number) => (
                        <div
                          key={attachment._id}
                          className="flex items-center gap-x-2 ml-2"
                        >
                          <FileDown size={17} className="text-slate-500" />
                          <Separator className="h-[20px] w-[2px]  bg-slate-300 dark:bg-border" />

                          <p className="text-md font-normal text-slate-500">
                            {" "}
                            {attachment.title}{" "}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </>
              ) : null}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Container>
  );
};

export default CourseInfo;
