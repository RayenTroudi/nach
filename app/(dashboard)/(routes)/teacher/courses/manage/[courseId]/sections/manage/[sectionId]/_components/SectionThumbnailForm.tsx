"use client";
import React, { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PencilLineIcon, XCircle } from "lucide-react";
import { FileUpload, Spinner } from "@/components/shared";
import { scnToast } from "@/components/ui/use-toast";
import { updateSection } from "@/lib/actions/section.action";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { set } from "mongoose";
import { updateCourseStatus } from "@/lib/actions";
import { CourseStatusEnum } from "@/lib/enums";
import { TCourse } from "@/types/models.types";

const formSchema = z.object({
  sectionThumbnail: z.string().min(5).max(50),
});

interface Props {
  section: {
    _id: string;
    sectionThumbnail?: string;
    course: TCourse;
  };
}

const SectionThumbnailForm = ({ section }: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(() =>
    section.sectionThumbnail ? section.sectionThumbnail : ""
  );

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const updatedSection = await updateSection({
        sectionId: section._id,
        courseId: section.course._id,
        instructorId: section.course.instructor._id,
        data: values,
        path: pathname,
      });

      await updateCourseStatus({
        courseId: section.course._id,
        status:
          section.course.status !== CourseStatusEnum.Draft
            ? CourseStatusEnum.Pending
            : section.course.status,
        path: pathname,
      });

      setEdit(false);
      scnToast({
        variant: "success",
        title: "Success",
        description: "Section title updated successfully",
      });
      router.refresh();
    } catch (error: any) {
      scnToast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  }

  const onToggleEditHandler = () =>
    setEdit((curr) => {
      return !section.sectionThumbnail ? false : !curr;
    });

  const onHandleChangeUrl = (url?: string) => setImageUrl(url);
  const onEditThumbnail = () => setImageUrl("");

  return (
    <div className=" flex flex-col gap-2 bg-slate-200/50 dark:bg-slate-900 shadow-md p-6 rounded-md border border-input ">
      <div className="w-full flex items-center justify-between">
        <h2 className="font-bold text-slate-500 dark:text-slate-300">
          Section Thumbnail
        </h2>
        <Button variant="ghost" size="icon" onClick={onToggleEditHandler}>
          {!edit && section.sectionThumbnail ? (
            <PencilLineIcon
              size={15}
              className="text-slate-600  dark:text-slate-200"
            />
          ) : (
            <XCircle size={15} className="text-slate-600 dark:text-slate-200" />
          )}
        </Button>
      </div>
      {!edit && section.sectionThumbnail ? (
        <div className="w-full h-full relative aspect-video">
          <Image
            alt="thumbnail"
            src={section.sectionThumbnail}
            fill
            className="object-cover rounded-md"
          />
        </div>
      ) : (
        <>
          {imageUrl ? (
            <>
              {isSaving ? (
                <div className="w-full h-[300px] flex items-center justify-center">
                  <Spinner size={50} />
                </div>
              ) : (
                <div className="relative aspect-video">
                  <Image
                    alt="thumbnail"
                    src={imageUrl || ""}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
              )}
            </>
          ) : (
            <FileUpload
              className={`w-full ${imageUrl ? "" : "h-full"} `}
              endpoint="courseThumbnail"
              onChange={onHandleChangeUrl}
            />
          )}
          <div className="pt-4 flex gap-x-2 justify-between">
            <Button onClick={onEditThumbnail} disabled={!imageUrl}>
              Change thumbnail
            </Button>
            <Button
              size="sm"
              className="bg-brand-red-500 hover:bg-brand-red-600 text-slate-50"
              disabled={
                isSaving || !imageUrl || imageUrl === section.sectionThumbnail
              }
              onClick={() => onSubmit({ sectionThumbnail: imageUrl! })}
            >
              {isSaving ? (
                <Spinner size={20} className="text-slate-50" />
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default SectionThumbnailForm;
