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
import { updateCourseStatus } from "@/lib/actions";
import { CourseStatusEnum } from "@/lib/models/course.model";
import { TCourse } from "@/types/models.types";

const formSchema = z.object({
  title: z.string().min(5).max(50),
});

interface Props {
  section: {
    _id: string;
    title: string;
    course: TCourse;
  };
}

const SectionTitleForm = ({ section }: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const [editing, setIsEditing] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: section?.title ? section.title : "",
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

  const onChangeIsEditingHandler = (isEditing: boolean) =>
    setIsEditing(isEditing);
  return (
    <>
      <div className="bg-slate-200/50 shadow-md  w-full border dark:bg-slate-900  border-input rounded-sm p-4 flex flex-col gap-2 font-semibold justify-start">
        <h2 className="font-bold text-slate-500 dark:text-slate-300">
          Section Title
        </h2>
        {!editing && section.title ? (
          <div className="w-full flex items-center justify-between">
            <h3 className="font-semibold text-slate-700">
              {" "}
              <ShowMoreLess text={section.title} />{" "}
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
                        className="text-slate-700"
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
                  className="bg-[#FF782D] hover:bg-[#FF782D]"
                  disabled={
                    !isValid ||
                    isSubmitting ||
                    form.getValues().title.toLowerCase() ===
                      section.title.toLowerCase()
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
        )}
      </div>
    </>
  );
};

export default SectionTitleForm;
