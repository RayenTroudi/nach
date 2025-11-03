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
import { IAttachment } from "@/lib/models/attachment.model";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { scnToast } from "@/components/ui/use-toast";

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
import { CourseStatusEnum, ICourse } from "@/lib/models/course.model";
import { pushAttachmentToSection } from "@/lib/actions/section.action";
import {
  createAttachment,
  removeAttachment,
} from "@/lib/actions/attachment.action";
import { updateCourseStatus } from "@/lib/actions";
import { TAttachment, TCourse } from "@/types/models.types";

const formSchema = z.object({
  title: z.string().min(10),
  url: z.string(),
});

interface Props {
  section: {
    _id: string;
    attachments?: TAttachment[];
    course: TCourse;
  };
}

const AttachmentForm = ({ section }: Props) => {
  console.log("SECTION : ");
  const pathname = usePathname();
  const [edit, setEdit] = useState<boolean>(false);
  const [url, setUrl] = useState<string | undefined>("");
  const [deletedAttachmentId, setDeletedAttachmentId] = useState<string | null>(
    null
  );
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      url: "",
    },
  });

  const isSameTitle = section?.attachments?.find(
    (attachment) =>
      attachment.title.toLowerCase() === form.getValues().title.toLowerCase()
  )?.title;

  const { isValid, isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log("VALUES", values);
      const data = { ...values, section: section._id };
      const newAttachment = await createAttachment({
        courseId: section.course._id,
        instructorId: section.course.instructor._id,
        data,
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
        description: "Attachment added successfully.",
      });
      onToggleEditHandler();
      onEditAttachment();
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
      return !section?.attachments?.length ? false : !curr;
    });

  const onHandleChangeUrl = (url?: string) => setUrl(url);
  const onEditAttachment = () => setUrl("");
  const onDeleteAttachmentHandler = async (id: string) => {
    try {
      setDeletedAttachmentId(id);
      await removeAttachment({
        courseId: section.course._id,
        instructorId: section.course.instructor._id,
        attachmentId: id,
        sectionId: section._id,
        path: pathname,
      });
      scnToast({
        variant: "success",
        title: "Congrats !",
        description: "Attachment removed successfully.",
      });
      router.refresh();
    } catch (error: any) {
      scnToast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setDeletedAttachmentId(null);
    }
  };

  return (
    <div className=" flex flex-col gap-2 bg-slate-200/50  dark:bg-slate-900 shadow-md p-6 rounded-md border border-input ">
      <div className="w-full flex items-center justify-between">
        <h2 className="font-bold text-slate-500 dark:text-slate-300">
          Section Attachments
        </h2>
        <Button variant="ghost" size="icon" onClick={onToggleEditHandler}>
          {!edit && section?.attachments?.length ? (
            <PlusCircle
              size={15}
              className="text-slate-600  dark:text-slate-300"
            />
          ) : (
            <XCircle size={15} className="text-slate-600 dark:text-slate-300" />
          )}
        </Button>
      </div>
      {!edit && section?.attachments?.length ? (
        section?.attachments?.length ? (
          <div className="flex flex-col gap-y-2">
            {section?.attachments.map((attachment) => (
              <div
                className="w-full p-2 flex items-center justify-between  rounded-md cursor-pointer bg-slate-200/60 hover:bg-slate-200 transition-all duration-200 ease-in-out border border-input dark:bg-slate-900/50 dark:hover:bg-slate-950"
                key={attachment._id}
              >
                <Link
                  href={attachment?.url}
                  target="_blank"
                  className=""
                  key={attachment._id}
                >
                  <div className="flex items-center gap-2">
                    <FileDown size={20} />
                    <p className="text-sm  line-clamp-1">{attachment?.title}</p>
                  </div>
                </Link>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    {deletedAttachmentId === attachment?._id ? (
                      <Spinner />
                    ) : (
                      <XCircle
                        size={15}
                        color="red"
                        className="cursor-pointer"
                      />
                    )}
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your account and remove your data from our
                        servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>No</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          onDeleteAttachmentHandler(attachment?._id)
                        }
                      >
                        {deletedAttachmentId === attachment?._id ? (
                          <Spinner />
                        ) : (
                          <span>Yes</span>
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
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
                        placeholder="e.g simple exercises on react hooks"
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
            <FileUpload
              className={`w-full`}
              endpoint="courseAttachments"
              onChange={onHandleChangeUrl}
            />
          ) : (
            <iframe
              src={url}
              className="w-full h-[300px] border border-input mt-2 rounded-md "
            />
          )}

          <div className="pt-4 flex gap-x-2 justify-between">
            <Button onClick={onEditAttachment} disabled={!url || isSubmitting}>
              Change PDF
            </Button>
            <Button
              size="sm"
              className="bg-[#FF782D] hover:bg-[#FF782D] text-slate-50"
              disabled={
                !isValid ||
                !url ||
                isSubmitting ||
                (isSameTitle?.length ?? 0) > 0
              }
              onClick={() =>
                onSubmit({ url: url!, title: form.getValues().title })
              }
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
              Attachment title must be unique in your section attachments.
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default AttachmentForm;
