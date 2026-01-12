"use client";
import React, { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";

import { PencilLineIcon, XCircle } from "lucide-react";
import { updateCourse } from "@/lib/actions/course.action";
import { usePathname, useRouter } from "next/navigation";
import { FileUpload, Spinner } from "@/components/shared";
import Image from "next/image";
import { IUser } from "@/lib/models/user.model";
import { scnToast } from "@/components/ui/use-toast";
import { TCourse } from "@/types/models.types";

const formSchema = z.object({
  thumbnail: z.string(),
});

interface Props {
  course: TCourse;
}

const ThumbnailForm = ({ course }: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(() =>
    course.thumbnail ? course.thumbnail : ""
  );
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      thumbnail: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSaving(true);
      await updateCourse({
        courseId: course._id,
        instructorId: course.instructor._id,
        data: values,
        path: pathname,
      });
      scnToast({
        variant: "success",
        title: "Congrats !",
        description: "Course thumbnail updated successfully.",
      });
      onToggleEditHandler();
      router.refresh();
    } catch (error: any) {
      setIsSaving(false);
      console.log(error.message);
      scnToast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  }

  const onToggleEditHandler = () =>
    setEdit((curr) => {
      return !course.thumbnail ? false : !curr;
    });

  const onHandleChangeUrl = (url?: string) => setImageUrl(url);
  const onEditThumbnail = () => setImageUrl("");

  return (
    <div className=" flex flex-col gap-2 bg-slate-200/10 px-3 dark:bg-slate-800/10 rounded-sm">
      <p className="text-xs text-slate-500 dark:text-slate-400 italic">Optional: Add a thumbnail to make your course more attractive</p>
      <div className="w-full flex items-center justify-end">
        <Button variant="ghost" size="icon" onClick={onToggleEditHandler}>
          {!edit && course.thumbnail ? (
            <PencilLineIcon size={15} className="text-slate-600" />
          ) : (
            <XCircle size={15} className="text-slate-600" />
          )}
        </Button>
      </div>
      {!edit && course.thumbnail ? (
        <div className="w-full h-full relative aspect-video">
          <Image
            alt="thumbnail"
            src={course.thumbnail}
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
            <>
              <FileUpload
                className={`w-full ${imageUrl ? "" : "h-full"}`}
                endpoint="courseThumbnail"
                onChange={onHandleChangeUrl}
              />
            </>
          )}
          <div className="pt-4 flex gap-x-2 justify-between">
            <Button onClick={onEditThumbnail} disabled={!imageUrl}>
              Change thumbnail
            </Button>
            <Button
              size="sm"
              className="bg-brand-red-500 hover:bg-brand-red-600"
              disabled={isSaving || !imageUrl || imageUrl === course.thumbnail}
              onClick={() => onSubmit({ thumbnail: imageUrl! })}
            >
              {isSaving ? (
                <Spinner size={20} className="text-slate-500" />
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

export default ThumbnailForm;
