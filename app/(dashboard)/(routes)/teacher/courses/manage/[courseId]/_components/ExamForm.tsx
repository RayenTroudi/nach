"use client";
import React, { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { isValid, z } from "zod";

import { Button } from "@/components/ui/button";

import {
  AlertTriangle,
  File,
  FileDown,
  FileImage,
  PencilLineIcon,
  PlusCircle,
  XCircle,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { FileUpload, Spinner } from "@/components/shared";
import { IUser } from "@/lib/models/user.model";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { scnToast } from "@/components/ui/use-toast";

import { IExam } from "@/lib/models/exam.model";
import { editExam, removeExam } from "@/lib/actions/exam.action";
import { TCourse } from "@/types/models.types";

const formSchema = z.object({
  title: z.string().min(10),
  examUrl: z.string(),
});

interface Props {
  course: TCourse;
}

const ExamForm = ({ course }: Props) => {
  const pathname = usePathname();
  const [edit, setEdit] = useState<boolean>(false);
  const [url, setUrl] = useState<string | undefined>("");
  const [isEditingFilePDF, setIsEditingFilePDF] = useState<boolean>(false);
  const [deletedExamId, setDeletedExamId] = useState<string | null>(null);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: course?.exam?.title ? course.exam.title : "",
      examUrl: "",
    },
  });

  const { isValid, isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const data: any = Object.entries(values).reduce(
        (acc: any, [key, value]: any) => {
          if (value !== "") {
            acc[key] = value;
          }
          return acc;
        },
        {}
      );

      console.log("VALUES : ", data);

      await editExam({
        courseId: course._id,
        instructorId: course.instructor._id,
        examId: course?.exam ? course.exam._id : undefined,
        data,
        path: pathname,
      });
      scnToast({
        variant: "success",
        title: "Congrats !",
        description: "Exam added successfully.",
      });
      onToggleEditHandler();
      onEditExam();
      router.refresh();
    } catch (error: any) {
      scnToast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  }

  const onToggleEditHandler = () =>
    setEdit((curr) => {
      return !course.exam ? false : !curr;
    });

  const onHandleChangeUrl = (url?: string) => setUrl(url);
  const onEditExam = () => {
    setUrl("");
    setIsEditingFilePDF(true);
  };
  const onDeleteExamHandler = async (id: string) => {
    try {
      if (!id) return;
      setDeletedExamId(id);
      await removeExam({
        courseId: course._id,
        instructorId: course.instructor._id,
        examId: deletedExamId!,
        path: pathname,
      });
      scnToast({
        variant: "success",
        title: "Congrats !",
        description: "Exam removed successfully.",
      });
      form.reset();
      router.refresh();
    } catch (error: any) {
      scnToast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setDeletedExamId(null);
    }
  };

  return (
    <div className="flex flex-col gap-2 bg-slate-200/10 px-3 min-h-[150px] dark:bg-slate-800/10 rounded-sm">
      <div className="w-full flex items-center justify-between">
        <h2 className="font-bold text-slate-600 dark:text-slate-200 break-words">
          {course?.exam ? course?.exam?.title : "Certificate's Exam"}
        </h2>
        <Button variant="ghost" size="icon" onClick={onToggleEditHandler}>
          {!edit && course.exam ? (
            <PencilLineIcon
              size={15}
              className="text-slate-600 dark:text-slate-200"
            />
          ) : (
            <XCircle size={15} className="text-slate-600 dark:text-slate-200" />
          )}
        </Button>
      </div>
      {!edit && course?.exam ? (
        course?.exam ? (
          <div className="flex flex-col gap-y-2">
            <iframe
              src={course.exam.examUrl}
              className="w-full h-[300px] border border-input mt-2 rounded-md "
            />

            <Button
              className="w-fit"
              size={"sm"}
              variant="destructive"
              onClick={() => onDeleteExamHandler(course?.exam?._id ?? "")}
            >
              {deletedExamId ? <Spinner /> : "Delete"}
            </Button>
          </div>
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
                        placeholder="e.g Final Exam To Get Certificate From This Course"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          {!url ? (
            course?.exam && !isEditingFilePDF ? (
              <iframe
                src={course.exam.examUrl}
                className="w-full h-[300px] border border-input mt-2 rounded-md "
              />
            ) : (
              <FileUpload
                className={`w-full`}
                endpoint="courseAttachments"
                onChange={onHandleChangeUrl}
              />
            )
          ) : (
            <iframe
              src={url}
              className="w-full h-[300px] border border-input mt-2 rounded-md "
            />
          )}

          <div className="pt-4 flex gap-x-2 justify-between">
            <Button onClick={onEditExam} size={"sm"}>
              Change PDF
            </Button>
            <Button
              size="sm"
              className="bg-[#FF782D] hover:bg-[#FF782D]"
              disabled={
                course?.exam
                  ? course?.exam.title.trim().toLowerCase() ===
                      form.getValues().title.trim().toLowerCase() ||
                    isSubmitting ||
                    isEditingFilePDF
                    ? !url
                    : false
                  : !isValid || isSubmitting || !url
              }
              onClick={() => {
                let data: { title: string; examUrl: string; courseId: string } =
                  { title: "", examUrl: "", courseId: "" };
                if (url) {
                  data = { ...data, examUrl: url };
                }

                if (form.getValues().title !== course?.exam?.title) {
                  data = { ...data, title: form.getValues().title };
                }

                if (!course.exam) {
                  data = { ...data, courseId: course._id };
                }

                onSubmit(data);
              }}
            >
              {isSubmitting ? (
                <Spinner size={20} className="text-slate-500" />
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamForm;
