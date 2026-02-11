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
import { Textarea } from "@/components/ui/textarea";
import { PencilLineIcon } from "lucide-react";
import { ShowMoreLess, Spinner } from "@/components/shared";
import { scnToast } from "@/components/ui/use-toast";
import { usePathname, useRouter } from "next/navigation";
import { updateVideo } from "@/lib/actions/video.action";
import { updateCourseStatus } from "@/lib/actions";
import { CourseStatusEnum } from "@/lib/enums";
import { TSection } from "@/types/models.types";

const formSchema = z.object({
  description: z.string().max(3000).optional(),
});

const MAX_CHARACTERS = 3000;

interface Props {
  video: {
    _id: string;
    description?: string;
    sectionId: TSection;
  };
}

const VideoDescriptionForm = ({ video }: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const [editing, setIsEditing] = useState<boolean>(false);
  const [charCount, setCharCount] = useState<number>(
    video?.description?.length || 0
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: video?.description ? video.description : "",
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
      form.reset({ description: values.description });
      setIsEditing(false);
      scnToast({
        variant: "success",
        title: "Success",
        description: "Video description updated successfully",
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
      <div className="bg-slate-200/50 shadow-md w-full border border-input dark:bg-slate-900 rounded-sm p-4 flex flex-col gap-2 font-semibold justify-start">
        <h2 className="font-bold text-slate-500 dark:text-slate-300">
          Video Description (Optional)
        </h2>
        {!editing ? (
          <div className="w-full flex items-center justify-between">
            <div className="flex-1">
              {video.description ? (
                <p className="font-normal text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  <ShowMoreLess text={video.description} />
                </p>
              ) : (
                <p className="font-normal text-slate-400 dark:text-slate-500 italic">
                  No description added yet
                </p>
              )}
            </div>
            <PencilLineIcon
              size={15}
              className="cursor-pointer text-slate-600 dark:text-slate-200 flex-shrink-0 ml-2"
              onClick={() => onChangeIsEditingHandler(true)}
            />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Add a description for this video (optional)..."
                        className="text-slate-700 dark:text-slate-200 min-h-[120px]"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setCharCount(e.target.value.length);
                        }}
                      />
                    </FormControl>
                    <div className="flex justify-between items-center mt-1">
                      <FormMessage />
                      <p
                        className={`text-xs font-medium ${
                          charCount > MAX_CHARACTERS
                            ? "text-red-500"
                            : charCount > MAX_CHARACTERS * 0.9
                            ? "text-amber-500"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {charCount} / {MAX_CHARACTERS} characters
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              <div className="w-full flex items-center gap-2 justify-end">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    form.reset({ description: video.description || "" });
                    onChangeIsEditingHandler(false);
                  }}
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
                    form.getValues().description === video.description
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

export default VideoDescriptionForm;
