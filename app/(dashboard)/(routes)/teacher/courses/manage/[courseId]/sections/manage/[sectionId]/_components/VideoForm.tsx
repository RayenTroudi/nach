"use client";
import { useState } from "react";

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
import { AlertTriangle, PlusCircle, XCircle } from "lucide-react";
import { updateCourseStatus } from "@/lib/actions/course.action";
import { usePathname, useRouter } from "next/navigation";
import { Spinner } from "@/components/shared";
import { scnToast } from "@/components/ui/use-toast";
import { pushVideoToSection } from "@/lib/actions/section.action";
import VideosList from "./VideosList";
import {
  createVideo,
  deleteVideo,
  reorderVideo,
} from "@/lib/actions/video.action";
import { CourseStatusEnum } from "@/lib/models/course.model";
import { TCourse, TVideo } from "@/types/models.types";

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title is required and must be at least 5 characters long.",
  }),
});

interface Props {
  section: {
    _id: string;
    course: TCourse;
    videos?: TVideo[];
  };
}

const VideoForm = ({ section }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const [adding, setAdding] = useState<boolean>(false);
  const [isReording, setIsReording] = useState<boolean>(false);
  const [deletedVideoId, setDeletedVideoId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  const onEditVideoHandler = (videoId: string) =>
    router.push(
      `/teacher/courses/manage/${section.course._id}/sections/manage/${section._id}/videos/manage/${videoId}`
    );

  const onReorderVideoHandler = (
    updateData: { id: string; position: number }[]
  ) => {
    try {
      if (updateData.length === 1) return;
      setIsReording(true);
      updateData.forEach(
        async (data) =>
          await reorderVideo({
            courseId: section.course._id,
            instructorId: section.course.instructor._id,
            videoId: data.id,
            newPosition: data.position,
            path: pathname,
          })
      );

      scnToast({
        variant: "success",
        title: "Congrats !",
        description: "Video Reordered Successfully.",
      });

      router.refresh();
    } catch (error: any) {
      setIsReording(false);
      return scnToast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsReording(false);
    }
  };

  const onDeleteVideoHandler = async (videoId: string) => {
    try {
      setDeletedVideoId(videoId);

      await deleteVideo({
        courseId: section.course._id,
        instructorId: section.course.instructor._id,
        sectionId: section._id,
        videoId,
        path: pathname,
      });

      scnToast({
        variant: "success",
        title: "Congrats !",
        description: "Video deleted successfully.",
      });
      router.refresh();
    } catch (error: any) {
      setDeletedVideoId(null);
      return scnToast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setDeletedVideoId(null);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const newVideo = await createVideo({
        title: values.title,
        sectionId: section._id,
        courseId: section.course._id,
        instructorId: section.course.instructor._id,
        path: pathname,
      });
      console.log(newVideo);

      await pushVideoToSection({
        sectionId: section._id,
        videoId: newVideo._id,
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

      scnToast({
        variant: "success",
        title: "Congrats !",
        description: "Video added successfully.",
      });

      form.reset();
      onToggleAddingHandler();
      router.refresh();
    } catch (error: any) {
      return scnToast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  }

  const { isValid, isSubmitting } = form.formState;

  const onToggleAddingHandler = () => setAdding((curr) => !curr);

  return (
    <div className="flex flex-col gap-2 bg-slate-200/50 shadow-md dark:bg-slate-900  p-6 rounded-md border border-input min-h-[150px]">
      <div className="w-full flex items-center justify-between">
        <h2 className="font-bold text-slate-500 dark:text-slate-300">
          Section Videos
        </h2>
        <Button variant="ghost" size="icon" onClick={onToggleAddingHandler}>
          {!adding && section?.videos?.length ? (
            <PlusCircle
              size={15}
              className="text-slate-600  dark:text-slate-300"
            />
          ) : (
            <XCircle size={15} className="text-slate-600 dark:text-slate-300" />
          )}
        </Button>
      </div>
      {!adding && section?.videos?.length ? (
        section?.videos?.length ? (
          <VideosList
            videos={section?.videos}
            deletedVideoId={deletedVideoId}
            isReording={isReording}
            onEdit={onEditVideoHandler}
            onReorder={onReorderVideoHandler}
            onDeleteVideo={onDeleteVideoHandler}
          />
        ) : (
          <Spinner />
        )
      ) : (
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 ">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="e.g simple exercises on react hooks"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-4 flex gap-x-2 justify-end">
                <Button
                  size="sm"
                  className="bg-brand-red-500 hover:bg-brand-red-600 text-slate-50"
                  disabled={!isValid || isSubmitting}
                >
                  {isSubmitting ? (
                    <Spinner size={20} className="text-slate-50" />
                  ) : (
                    "Add"
                  )}
                </Button>
              </div>
              <p className="w-full flex items-center gap-2 py-2">
                <AlertTriangle size={13} className="text-slate-500" />
                <span className="text-[12px] font-bold text-slate-500 ">
                  Video title must be unique in your course section.
                </span>
              </p>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
};

export default VideoForm;
