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
import { PencilLineIcon } from "lucide-react";
import { updateCourse } from "@/lib/actions/course.action";
import { usePathname, useRouter } from "next/navigation";
import { Spinner } from "@/components/shared";

import { scnToast } from "@/components/ui/use-toast";
import { TCourse } from "@/types/models.types";
import { useTheme } from "@/contexts/ThemeProvider";
import Preview from "@/components/shared/editor/Preview";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

const DynamicEditor = dynamic(
  () => import("@/components/shared/editor/Editor"),
  {
    loading: () => <Skeleton className="w-full h-[300px]" />,
  }
);

const formSchema = z.object({
  description: z.string().min(50, {
    message: "Description must be at least 100 characters long.",
  }),
});

interface Props {
  course: TCourse;
}

const DescriptionForm = ({ course }: Props) => {
  const { mode } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const [edit, setEdit] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: course?.description ? course.description : "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (values.description === course.description)
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
        description: "Course description updated successfully.",
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

  const onToggleEditHandler = () =>
    setEdit((curr) => {
      return !course.description ? false : !curr;
    });

  return (
    <div className=" flex flex-col gap-2 bg-slate-200/10 px-3 dark:bg-slate-800/10 rounded-sm">
      {!edit && course?.description ? (
        <div className="break-words">
          {course?.description ? (
            <div className="flex flex-col">
              <div className="flex justify-end">
                <Button
                  className=""
                  variant="ghost"
                  size="icon"
                  onClick={onToggleEditHandler}
                >
                  {edit ? null : (
                    <PencilLineIcon
                      size={15}
                      className="text-slate-600 dark:text-slate-50"
                    />
                  )}
                </Button>
              </div>
              <Preview data={course.description ?? ""} />
            </div>
          ) : (
            <Spinner />
          )}
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 ">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <DynamicEditor
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      initialValue={course?.description ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="w-full flex justify-between items-center gap-2">
              <p className="text-[13px] text-slate-500 font-bold">
                <span className="primary-color">
                  {form.getValues().description?.length ?? 0}
                </span>{" "}
                / 50 letters
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  disabled={!course?.description}
                  size="sm"
                  onClick={onToggleEditHandler}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-[#FF782D] hover:bg-[#FF782D] text-slate-50"
                  disabled={
                    !isValid || isSubmitting
                    // course?.description === form.getValues().description
                  }
                >
                  {isSubmitting ? (
                    <Spinner size={20} className="text-slate-500" />
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

export default DescriptionForm;
