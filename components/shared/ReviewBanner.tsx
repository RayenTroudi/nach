"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CheckCheckIcon, CheckCircleIcon, XCircle } from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { scnToast } from "@/components/ui/use-toast";
import { updateCourseStatus } from "@/lib/actions";
import { CourseStatusEnum } from "@/lib/models/course.model";
import { usePathname, useRouter } from "next/navigation";
import { Spinner } from "@/components/shared";
import { readSync } from "fs";
import { useTheme } from "@/contexts/ThemeProvider";
import { TCourse } from "@/types/models.types";
import { usePageLoader } from "@/contexts/PageLoaderProvider";

const formSchema = z.object({
  reason: z.string().min(25).max(100),
});

interface Props {
  course: TCourse;
}

const ReviewBanner = ({ course }: Props) => {
  const { setIsLoading } = usePageLoader();
  const { mode } = useTheme();

  const pathname = usePathname();
  const router = useRouter();

  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isRejecting, setIsRejecting] = useState<boolean>(false);
  const [showBanner, setShowBanner] = useState<boolean>(true);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsRejecting(true);
      setIsLoading(true);
      const res = await fetch(
        "/api/review",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            course,
            status: CourseStatusEnum.Rejected,
            message: values.reason,
            mode,
          }),
        }
      );
      await updateCourseStatus({
        courseId: course._id,
        status: CourseStatusEnum.Rejected,
        path: pathname,
      });
    } catch (error: any) {
      scnToast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setTimeout(() => {
        scnToast({
          variant: "success",
          title: "Success",
          description: "Course has been rejected successfully",
        });
        setIsLoading(false);
        setShowBanner(false);
        router.push("/admin/dashboard");
        setIsRejecting(false);
      }, 500);
    }
  }

  const approveCourseHandler = async () => {
    try {
      setIsApproving(true);
      setIsLoading(true);
      await updateCourseStatus({
        courseId: course._id,
        status: CourseStatusEnum.Approved,
        path: pathname,
      });
      const res = await fetch(
        "/api/review",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            course,
            status: CourseStatusEnum.Approved,
            message:
              "Congratulations! Your course has been approved by the admin and it follows all the terms and guidelines. You can now publish it and share your knowledge with others.",
            mode,
          }),
        }
      );
    } catch (error: any) {
      scnToast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setTimeout(() => {
        scnToast({
          variant: "success",
          title: "Success",
          description: "Course has been approved successfully",
        });
        setShowBanner(false);
        setIsLoading(false);
        router.push("/admin/dashboard");
        setIsApproving(false);
      }, 500);
    }
  };
  return (
    <>
      {showBanner ? (
        <div className="w-full   border-b border-input flex items-center justify-between flex-row gap-y-0 p-4 mb-2 shadow-sm ">
          <h2 className="text-xl font-bold flex items-center gap-x-2 ">
            <Image
              src={course?.thumbnail!}
              alt="course-thumbnail"
              width={100}
              height={40}
              className=" rounded-md"
            />
            <span className="hidden line-clamp-1 md:block text-slate-950 dark:text-slate-200">
              {course?.title.slice(0, 50)}
              {" ..."}
            </span>
            <span className="text-sm text-slate-400 font-semibold hidden lg:block">
              by {course.instructor.username}{" "}
            </span>
          </h2>
          <div className="flex items-center gap-x-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant={"success"}
                  className="w-fit lg:w-[220px] flex gap-x-2 items-center font-bold"
                >
                  {isApproving ? (
                    <Spinner className="text-slate-200" />
                  ) : (
                    <>
                      <CheckCircleIcon size={20} className="flex-shrink-0" />
                      <span className="hidden md:block">
                        Approve This Course
                      </span>
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    After approving this course, it will be available to
                    students.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={approveCourseHandler}
                    className="bg-brand-red-500 opacity-95 text-slate-200 hover:bg-brand-red-600 hover:opacity-100 duration-300 ease-in-out"
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant={"destructive"}
                  className="w-fit lg:w-[220px] flex gap-x-2 items-center font-bold"
                >
                  {isRejecting ? (
                    <Spinner className="text-slate-200" />
                  ) : (
                    <>
                      <XCircle size={20} className="flex-shrink-0" />
                      <span className="hidden md:block">
                        Reject This Course
                      </span>
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    <Form {...form}>
                      <form className="space-y-8">
                        <FormField
                          control={form.control}
                          name="reason"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="More Info about the reason ..."
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription className="">
                                More Info about the reason why you rejected this
                                course
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </form>
                    </Form>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="w-full  flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-400">
                    {" "}
                    <span className="text-brand-red-500">
                      {form.getValues().reason.length}
                    </span>{" "}
                    / 50
                  </p>
                  <div className="flex items-center gap-x-2">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-brand-red-500 opacity-95 text-slate-200 hover:bg-brand-red-600 hover:opacity-100 duration-300 ease-in-out"
                      onClick={() =>
                        onSubmit({ reason: form.getValues().reason })
                      }
                    >
                      Continue
                    </AlertDialogAction>
                  </div>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default ReviewBanner;
