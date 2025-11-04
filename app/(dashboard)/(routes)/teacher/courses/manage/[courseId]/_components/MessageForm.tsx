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
import { PencilLineIcon, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { updateCourse } from "@/lib/actions/course.action";
import { usePathname, useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { ShowMoreLess, Spinner } from "@/components/shared";
import { IUser } from "@/lib/models/user.model";
import { scnToast } from "@/components/ui/use-toast";
import { TCourse } from "@/types/models.types";

const formSchema = z.object({
  message: z.string().min(100, {
    message: "Description must be at least 100 characters long.",
  }),
});

interface Props {
  course: TCourse;
  type: string;
}

const MessageForm = ({ course, type }: Props) => {
  const pathname = usePathname();
  const [edit, setEdit] = useState<boolean>(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message:
        type === "welcome" && course?.welcomeMessage
          ? course?.welcomeMessage
          : course?.congratsMessage
          ? course?.congratsMessage
          : "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const data: any = {};
      if (type === "welcome") {
        if (values.message === course?.welcomeMessage)
          return scnToast({
            variant: "default",
            title: "Info",
            description: "No changes made.",
          });

        data.welcomeMessage = values.message;
      } else {
        if (values.message === course?.welcomeMessage)
          return scnToast({
            variant: "default",
            title: "Info",
            description: "No changes made.",
          });
        data.congratsMessage = values.message;
      }

      await updateCourse({
        courseId: course._id,
        instructorId: course.instructor._id,
        data,
        path: pathname,
      });
      scnToast({
        variant: "success",
        title: "Congrats !",
        description: `Course ${type[0].toUpperCase()}${type.slice(
          1
        )} message updated successfully.`,
      });
      onToggleEditHandler();
      router.refresh();
    } catch (error: any) {
      scnToast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  }

  const { isValid, isSubmitting } = form.formState;

  const onToggleEditHandler = () => {
    if (type === "welcome") {
      setEdit((curr) => {
        return !course.welcomeMessage ? false : !curr;
      });
    } else {
      setEdit((curr) => {
        return !course.congratsMessage ? false : !curr;
      });
    }
  };

  return (
    <div className=" flex flex-col gap-2 bg-slate-200/10 px-3 dark:bg-slate-800/10 rounded-sm">
      {!edit &&
      (type === "welcome"
        ? course.welcomeMessage !== ""
        : course.congratsMessage !== "") ? (
        <div>
          <div className="w-full flex items-center justify-end">
            <Button variant="ghost" size="icon" onClick={onToggleEditHandler}>
              <PencilLineIcon size={15} className="text-slate-600" />
            </Button>
          </div>
          <div className="break-words whitespace-pre-wrap">
            <p className="text-slate-700 dark:text-slate-300">
              {type === "welcome"
                ? course?.welcomeMessage ?? ""
                : course?.congratsMessage ?? ""}
            </p>
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 ">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter your message here..."
                      className="min-h-[300px] resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="w-full flex justify-between items-center gap-2">
              <p className="text-[13px] text-slate-500 font-bold">
                <span className="primary-color">
                  {form.getValues().message.length}
                </span>{" "}
                / 100 letters
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={onToggleEditHandler}
                  disabled={
                    type === "welcome"
                      ? !course?.welcomeMessage
                      : !course?.congratsMessage
                  }
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-[#FF782D] hover:bg-[#FF782D]"
                  disabled={!isValid || isSubmitting}
                >
                  {isSubmitting ? (
                    <Spinner size={15} className="text-slate-500" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default MessageForm;
