"use client";
import React, { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PencilLineIcon, XCircle } from "lucide-react";
import { ShowMoreLess, Spinner } from "@/components/shared";
import { scnToast } from "@/components/ui/use-toast";
import { updateSection } from "@/lib/actions/section.action";
import { usePathname, useRouter } from "next/navigation";
import { updateVideo } from "@/lib/actions/video.action";
import { updateCourseStatus } from "@/lib/actions";
import { CourseStatusEnum } from "@/lib/models/course.model";
import { Checkbox } from "@/components/ui/checkbox";
import { TCourse } from "@/types/models.types";

const formSchema = z.object({
  isPublished: z.boolean(),
});

interface Props {
  section: {
    _id: string;
    isPublished?: boolean;
    course: TCourse;
  };
}

const SectionVisibilityForm = ({ section }: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const [editing, setIsEditing] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isPublished: !!section?.isPublished,
    },
  });

  const { isValid, isSubmitting } = form.formState;

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
      form.reset();
      setIsEditing(false);
      scnToast({
        variant: "success",
        title: "Success",
        description: `Your Section now is ${
          values.isPublished ? "published and visible" : "in the draft mode "
        }`,
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
      <div className="bg-slate-200/50 dark:bg-slate-900  border-input  shadow-md  w-full border  rounded-sm p-4 flex flex-col gap-2 font-semibold justify-start">
        <div className="w-full flex items-center justify-between">
          <h2 className="font-bold text-slate-500 dark:text-slate-200">
            {section.isPublished ? "Visible For Enrolled Student" : "In Draft"}
          </h2>

          {!editing ? (
            <PencilLineIcon
              size={15}
              className="cursor-pointer text-slate-600 dark:text-slate-200"
              onClick={() => onChangeIsEditingHandler(true)}
            />
          ) : (
            <XCircle
              size={15}
              className="cursor-pointer text-slate-600 dark:text-slate-200"
              onClick={() => onChangeIsEditingHandler(false)}
            />
          )}
        </div>

        {editing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="">
                    <div className="flex items-center gap-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>
                        Check this box if u want to make this section visible
                        for enrolled students
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="w-full flex items-center gap-2  justify-end">
                <Button
                  type="submit"
                  size="sm"
                  className="bg-brand-red-500 hover:bg-brand-red-600"
                  disabled={
                    !isValid ||
                    isSubmitting ||
                    section.isPublished === form.getValues().isPublished
                  }
                >
                  {isSubmitting ? (
                    <Spinner size={18} className="text-slate-700" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        ) : null}
      </div>
    </>
  );
};

export default SectionVisibilityForm;
