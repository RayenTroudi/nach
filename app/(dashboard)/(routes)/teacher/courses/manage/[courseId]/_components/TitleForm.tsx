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
import { updateCourse } from "@/lib/actions/course.action";
import { usePathname, useRouter } from "next/navigation";
import { ShowMoreLess, Spinner } from "@/components/shared";
import { IUser } from "@/lib/models/user.model";
import { scnToast } from "@/components/ui/use-toast";
import { TCourse } from "@/types/models.types";

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title is required and must be at least 5 characters long.",
  }),
});

interface Props {
  course: TCourse;
}

const TitleForm = ({ course }: Props) => {
  const pathname = usePathname();
  const [edit, setEdit] = useState<boolean>(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: course?.title ? course.title : "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (values.title === course.title)
        return scnToast({
          variant: "default",
          title: "Info",
          description: "No changes made.",
        });
      await updateCourse({
        courseId: course._id,
        instructorId: course.instructor._id,
        data: values,
        path: pathname,
      });
      scnToast({
        variant: "success",
        title: "Congrats !",
        description: "Course title updated successfully.",
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

  const onToggleEditHandler = () => setEdit((curr) => !curr);

  return (
    <div className="flex flex-col gap-2 bg-slate-200/10 dark:bg-slate-800/10 rounded-sm px-3 ">
      {!edit ? (
        <div className="w-full flex items-center justify-between">
          <div className="">
            {course?.title ? <ShowMoreLess text={course.title} /> : <Spinner />}
          </div>

          <Button variant="ghost" size="icon" onClick={onToggleEditHandler}>
            <PencilLineIcon
              size={15}
              className="text-slate-600 dark:text-slate-50"
            />
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 ">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="e.g. Learn web design with figma ..."
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="w-full flex justify-end items-center gap-2">
              <Button
                disabled={!course?.title}
                size="sm"
                onClick={onToggleEditHandler}
              >
                cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-brand-red-500 hover:bg-brand-red-600 text-slate-50"
                disabled={
                  !isValid ||
                  isSubmitting ||
                  form.getValues().title === course.title
                }
              >
                {isSubmitting ? (
                  <Spinner size={20} className="text-slate-50" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default TitleForm;
