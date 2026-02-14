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
import { PencilLineIcon } from "lucide-react";
import { ShowMoreLess, Spinner } from "@/components/shared";
import { scnToast } from "@/components/ui/use-toast";
import { updateSection } from "@/lib/actions/section.action";
import { usePathname, useRouter } from "next/navigation";
import { updateVideo } from "@/lib/actions/video.action";
import { updateCourseStatus } from "@/lib/actions";
import { CourseStatusEnum } from "@/lib/enums";
import { TSection } from "@/types/models.types";

const formSchema = z.object({
  title: z.string().min(5).max(200),
});

interface Props {
  video: {
    _id: string;
    title: string;
    sectionId: TSection;
  };
}

const VideoTitleForm = ({ video }: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const [editing, setIsEditing] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: video?.title ? video.title : "",
    },
  });

  const { isValid, isSubmitting } = form.formState;

  // Safety check for nested properties - AFTER hooks
  if (!video?.sectionId?.course) {
    return (
      <div className="bg-slate-200/50 dark:bg-slate-900 border-input shadow-md w-full border rounded-sm p-4">
        <p className="text-red-500">Error: Video data is incomplete</p>
      </div>
    );
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateVideo({
        videoId: video._id,
        courseId: video.sectionId.course._id,
        instructorId: video.sectionId.course.instructor._id,
        data: values,
        path: pathname,
      });
      await updateCourseStatus({
        courseId: video?.sectionId.course._id,
        status:
          video?.sectionId.course.status !== CourseStatusEnum.Draft
            ? CourseStatusEnum.Pending
            : video?.sectionId.course.status,
        path: pathname,
      });
      form.reset();
      setIsEditing(false);
      scnToast({
        variant: "success",
        title: "Success",
        description: "Video title updated successfully",
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

  const onChangeIsEditingHandler = (isEditing: boolean) =>
    setIsEditing(isEditing);
  return (
    <>
      <div className="bg-slate-200/50 shadow-md  w-full border border-input dark:bg-slate-900 rounded-sm p-4 flex flex-col gap-2 font-semibold justify-start">
        <h2 className="font-bold text-slate-500 dark:text-slate-300">
          Video Title
        </h2>
        {!editing && video.title ? (
          <div className="w-full flex items-center justify-between">
            <h3 className="font-semibold text-slate-700">
              {" "}
              <ShowMoreLess text={video.title} />{" "}
            </h3>
            <PencilLineIcon
              size={15}
              className="cursor-pointer text-slate-600 dark:text-slate-200"
              onClick={() => onChangeIsEditingHandler(true)}
            />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="e.g Introduction To Nextjs 14"
                        className="text-slate-700 dark:text-slate-200"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="w-full flex items-center gap-2  justify-end">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onChangeIsEditingHandler(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-brand-red-500 hover:bg-brand-red-600 dark:text-slate-50"
                  disabled={
                    !isValid ||
                    isSubmitting ||
                    form.getValues().title.toLowerCase() ===
                      video.title.toLowerCase()
                  }
                >
                  {isSubmitting ? (
                    <Spinner size={18} className="text-slate-50" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </>
  );
};

export default VideoTitleForm;
