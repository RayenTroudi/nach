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
import { AlertTriangle, PlusCircle, XCircle } from "lucide-react";
import {
  pullSectionFromCourse,
  pushSectionToCourse,
} from "@/lib/actions/course.action";
import { usePathname, useRouter } from "next/navigation";
import { Spinner } from "@/components/shared";
import { scnToast } from "@/components/ui/use-toast";
import {
  createSection,
  deleteSectionById,
  reorderSection,
} from "@/lib/actions/section.action";

import SectionList from "./SectionList";
import { TCourse } from "@/types/models.types";

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title is required and must be at least 5 characters long.",
  }),
});

interface Props {
  course: TCourse;
}

const SectionForm = ({ course }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const [adding, setAdding] = useState<boolean>(false);
  const [isReording, setIsReording] = useState<boolean>(false);
  const [deletedSectionId, setDeletedSectionId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  const onEditSectionHandler = (sectionId: string) =>
    router.push(
      `/teacher/courses/manage/${course._id}/sections/manage/${sectionId}`
    );

  const onReorderSectionHandler = (
    updateData: { id: string; position: number }[]
  ) => {
    try {
      if (updateData.length === 1) return;
      setIsReording(true);

      updateData.forEach(
        async (data) =>
          await reorderSection({
            courseId: course._id,
            instructorId: course.instructor._id,
            sectionId: data.id,
            newPosition: data.position,
            path: pathname,
          })
      );

      scnToast({
        variant: "success",
        title: "Congrats !",
        description: "Section Reordered Successfully.",
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

  const onDeleteSectionIdHandler = async (sectionId: string) => {
    try {
      setDeletedSectionId(sectionId);
      const deletedSection = await deleteSectionById(sectionId);
      const updatedCourse = await pullSectionFromCourse({
        courseId: course._id,
        instructorId: course.instructor._id,
        sectionId,
        path: pathname,
      });

      scnToast({
        variant: "success",
        title: "Congrats !",
        description: "Section deleted successfully.",
      });
      router.refresh();
    } catch (error: any) {
      setDeletedSectionId(null);
      return scnToast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setDeletedSectionId(null);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const newSection = await createSection({
        title: values.title,
        courseId: course._id,
        instructorId: course.instructor._id,
        path: pathname,
      });

      const updatedCourse = await pushSectionToCourse({
        courseId: course._id,
        instructorId: course.instructor._id,
        sectionId: newSection._id,
        path: pathname,
      });

      scnToast({
        variant: "success",
        title: "Congrats !",
        description: "Section added successfully.",
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
    <div className="flex flex-col gap-2 bg-slate-200/10 px-3 dark:bg-slate-800/10 rounded-sm">
      <div className="w-full flex items-center justify-between">
        <h2 className="font-bold text-slate-500">Course Sections</h2>
        <Button variant="ghost" size="icon" onClick={onToggleAddingHandler}>
          {!adding && course?.sections?.length ? (
            <PlusCircle size={15} className="text-slate-600" />
          ) : (
            <XCircle size={15} className="text-slate-600" />
          )}
        </Button>
      </div>
      {!adding && course?.sections?.length ? (
        course?.sections.length ? (
          <SectionList
            sections={course.sections}
            deletedSectionId={deletedSectionId}
            isReording={isReording}
            onEdit={onEditSectionHandler}
            onReorder={onReorderSectionHandler}
            onDeleteSection={onDeleteSectionIdHandler}
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
                  className="bg-[#FF782D] hover:bg-[#FF782D]"
                  disabled={!isValid || isSubmitting}
                >
                  {isSubmitting ? (
                    <Spinner size={20} className="text-slate-500" />
                  ) : (
                    "Add"
                  )}
                </Button>
              </div>
              <p className="w-full flex items-center gap-2 py-2">
                <AlertTriangle size={13} className="text-slate-500" />
                <span className="text-[12px] font-bold text-slate-500 ">
                  Section title must be unique in your course sections.
                </span>
              </p>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
};

export default SectionForm;
