"use client";
import { TComment, TCourse, TReply, TUser } from "@/types/models.types";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Separator } from "@/components/ui/separator";
import NoQuestions from "@/components/shared/animations/NoQuestions";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Preview, Seperator, Spinner } from "@/components/shared";
import { createComment, deleteCommentById } from "@/lib/actions/comment.action";
import { usePathname, useRouter } from "next/navigation";
import { scnToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { MessageCircleQuestion, MessageCircleReply, Trash } from "lucide-react";
import { getTimeAgo } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeProvider";
import ReplyForm from "./ReplyForm";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

const DynamicEditor = dynamic(
  () => import("@/components/shared/editor/Editor"),
  {
    loading: () => <Skeleton className="w-full h-[300px]" />,
  }
);

const formSchema = z.object({
  title: z.string().min(10).max(100),
  content: z.string().optional(),
});

interface Props {
  course: TCourse;
  user: TUser;
}

const Comments = ({ course, user }: Props) => {
  const { mode } = useTheme();

  const [isAsking, setIsAsking] = useState<boolean>(false);
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [replyTo, setReplyTo] = useState<TComment | null>(null);
  const [deletedCommentId, setDeletedCommentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredComments, setFilteredComments] = useState<TComment[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const { isValid, isSubmitting } = form.formState;

  const filterComments = useCallback(() => {
    if (!searchTerm.trim()) {
      setFilteredComments(course.comments ?? []);
    } else {
      const lowercasedFilter = searchTerm.toLowerCase();
      const filteredData = (course.comments ?? []).filter((comment) => {
        return (
          typeof comment.title === "string" &&
          comment.title.toLowerCase().includes(lowercasedFilter)
        );
      });
      setFilteredComments(filteredData);
    }
  }, [course.comments, searchTerm]);

  useEffect(() => {
    filterComments();
  }, [filterComments]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const comment = await createComment({
        title: values.title,
        content: values.content,
        userId: user._id,
        courseId: course._id,
        path: pathname,
      });
      setIsSendingEmail(true);

      await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user,
          course,
          comment,
          mode,
        }),
      });

      scnToast({
        title: "You Asked A Question",
        description:
          "The instructor will be notified about your question. He'll answer it as soon as possible.",
        variant: "success",
      });
      setIsAsking(false);
      setIsSendingEmail(false);
      router.refresh();
    } catch (error: any) {
      scnToast({
        title: "An Error Occured",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      form.reset();
      setIsAsking(false);
      setIsSendingEmail(false);
    }
  }

  const onDeleteCommentHandler = async (commentId: string) => {
    try {
      setDeletedCommentId(commentId);
      await deleteCommentById(commentId, pathname);

      scnToast({
        title: "Comment Deleted",
        description: "The comment has been deleted successfully",
        variant: "success",
      });

      router.refresh();
    } catch (error: any) {
      scnToast({
        title: "An Error Occured",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeletedCommentId(null);
    }
  };

  useEffect(() => {
    const el = document.getElementById("comments");
    el?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <>
      {isAsking ? (
        <Card className="w-full lg:w-1/2 lg:mx-auto">
          <CardHeader className="flex flex-col gap-y-2">
            <CardTitle className="text-center">
              Ask Any Question To Your Instructor
            </CardTitle>
            <Separator />
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Question Title{" "}
                        <span className="text-destructive text-lg font-bold">
                          *
                        </span>
                      </FormLabel>

                      <FormControl>
                        <Input
                          className="dark:bg-[#222f3e] dark:text-slate-50"
                          placeholder="How do i center a div?"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="editor">
                        More details about the question
                      </FormLabel>
                      <FormControl>
                        <DynamicEditor
                          onBlur={field.onBlur}
                          onChange={field.onChange}
                          initialValue=""
                          defaultHeight={400}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="w-full  flex justify-end items-center gap-x-2">
                  <Button
                    size={"sm"}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setIsAsking(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size={"sm"}
                    type="submit"
                    className=" w-[108px] bg-[#FF782D] hover:bg-[#FF782D] hover:opacity-90 transition-all duration-300 ease-in-out text-slate-50"
                    disabled={
                      !isValid ||
                      isSubmitting ||
                      deletedCommentId !== null ||
                      isSendingEmail
                    }
                  >
                    {isSubmitting || isSendingEmail ? (
                      <Spinner className="text-slate-50" size={15} />
                    ) : (
                      "Ask Question"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <div className="w-[90%] mx-auto flex flex-col gap-y-6 pt-6">
          <h1 className="text-center md:text-start text-2xl md:text-3xl lg:text-4xl line-clamp-1  font-bold">
            All Students Comments & Questions
          </h1>

          <Separator className="h-[2px]" />

          {course?.comments?.length ? (
            <Card className="w-full border-none">
              <CardHeader className="">
                <div className="w-full flex gap-x-4 items-center">
                  <div className="h-full relative w-full ">
                    <Input
                      className="w-full h-[45px]  bg-slate-200/50 dark:bg-slate-900 pl-12 rounded-sm"
                      placeholder="Search For Questions  ..."
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Image
                      src="/icons/search.svg"
                      width={20}
                      height={20}
                      alt="search"
                      className="absolute top-1/2 transform -translate-y-1/2 left-4"
                    />
                  </div>
                  <Button
                    onClick={() => setIsAsking(true)}
                    size={"sm"}
                    className="h-[45px] rounded-sm flex items-center justify-center gap-x-2 bg-[#FF782D] hover:bg-[#FF782D] hover:opacity-90"
                  >
                    <p className="text-slate-50 font-bold hidden md:block">
                      Ask Question
                    </p>
                    <MessageCircleQuestion
                      size={20}
                      className="text-slate-50"
                    />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="w-full flex  flex-col gap-y-2">
                {replyTo ? (
                  <Card className="w-full lg:w-1/2 lg:mx-auto">
                    <CardHeader className="flex flex-col gap-y-2">
                      <CardTitle className="text-center">
                        {replyTo?.title}
                      </CardTitle>
                      <Separator />
                    </CardHeader>
                    <CardContent>
                      <ReplyForm
                        course={course}
                        user={user}
                        comment={replyTo!}
                        setReplyTo={setReplyTo}
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <Accordion type="single" collapsible className="w-full ">
                    {filteredComments.map((comment: TComment) => (
                      <AccordionItem
                        value={comment._id}
                        key={comment._id}
                        className={`relative border-none rounded-sm w-full h-full hover:bg-slate-200/50 dark:hover:bg-slate-900/50 transition-all duration-300 ease-in-out hover:underline-offset-0 px-2`}
                      >
                        {comment?.user?._id === user._id ? (
                          <Button
                            disabled={deletedCommentId !== null}
                            onClick={() => onDeleteCommentHandler(comment._id)}
                            className="bg-transparent   group hover:bg-transparent absolute top-1/2 right-8 transform -translate-y-1/2 hover:text-destructive transition-all duration-300 ease-in-out"
                          >
                            {deletedCommentId === comment._id ? (
                              <Spinner
                                size={20}
                                className="text-slate-950 dark:text-slate-50"
                              />
                            ) : (
                              <Trash
                                size={20}
                                className="text-slate-950 dark:text-slate-50 group-hover:text-destructive transition-all duration-300 ease-in-out"
                              />
                            )}
                          </Button>
                        ) : null}
                        {user._id !== comment?.user?._id ? (
                          <Button
                            disabled={false}
                            onClick={() => setReplyTo(comment)}
                            className={` hidden md:block bg-transparent group hover:bg-transparent absolute top-1/2 right-8 transform -translate-y-1/2 hover:text-destructive transition-all duration-300 ease-in-out`}
                          >
                            <MessageCircleReply
                              size={20}
                              className="text-slate-950 dark:text-slate-50 group-hover:text-[#ff782d] transition-all duration-300 ease-in-out"
                            />
                          </Button>
                        ) : null}

                        <AccordionTrigger
                          className={`w-full hover:no-underline  `}
                        >
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <div className="flex items-start md:items-center gap-x-4">
                                <Image
                                  src={comment.user?.picture!}
                                  width={50}
                                  height={50}
                                  alt="avatar "
                                  className=" object-cover rounded-full "
                                />
                                <div className="flex flex-col items-start gap-y-1 ">
                                  <div className="flex items-center gap-x-2">
                                    <h2 className="block lg:hidden text-sm  lg:text-lg font-bold">
                                      {comment.title.length > 20
                                        ? `${comment.title.slice(0, 21)} ...`
                                        : comment.title}{" "}
                                    </h2>
                                    <h2 className="hidden lg:block text-sm  lg:text-lg font-bold">
                                      {comment.title.length > 100
                                        ? comment.title.slice(0, 101)
                                        : comment.title}{" "}
                                    </h2>

                                    {comment.user._id ===
                                    course.instructor._id ? (
                                      <div className=" w-fit px-4 py-1 text-[11px] font-bold rounded-full bg-blue-700/20 text-center text-blue-700">
                                        Instructor
                                      </div>
                                    ) : null}
                                  </div>

                                  <div className="flex flex-col gap-y-1 items-start  sm:flex-row sm:items-center sm:gap-x-2">
                                    <p className="text-xs text-[#FF782D] hover:underline cursor-pointer underline-offset-2">
                                      <span>{comment.user?.username}</span>
                                    </p>

                                    <span className="text-slate-950 dark:text-slate-50 hidden sm:block">
                                      ·
                                    </span>

                                    <div className="flex items-center gap-x-2">
                                      <p className="text-xs dark:text-slate-50">
                                        {getTimeAgo(comment.createdAt)}
                                      </p>

                                      <span
                                        className={`text-slate-950 dark:text-slate-50 ${
                                          comment?.replies?.length
                                            ? "block"
                                            : "hidden"
                                        } `}
                                      >
                                        ·
                                      </span>

                                      {comment?.replies?.length ? (
                                        <>
                                          <Dialog>
                                            <DialogTrigger asChild className="">
                                              <Button
                                                variant={"link"}
                                                className="p-0 text-xs dark:text-slate-50  "
                                              >
                                                {comment?.replies?.length}{" "}
                                                answer(s)
                                              </Button>
                                            </DialogTrigger>
                                            <DialogContent className="w-full max-h-[480px] overflow-y-auto">
                                              <DialogHeader>
                                                <DialogTitle className="w-full break-words">
                                                  <span className="w-full text-[#ff782d] break-words">
                                                    {comment.title.slice(0, 30)}
                                                    ...
                                                  </span>{" "}
                                                  &apos;s answers
                                                </DialogTitle>
                                                <Separator />
                                              </DialogHeader>

                                              <Accordion
                                                type="single"
                                                collapsible
                                                className="w-full"
                                              >
                                                {comment?.replies?.map(
                                                  (reply: TReply) => (
                                                    <AccordionItem
                                                      key={reply._id}
                                                      value={reply._id}
                                                      className="group hover:bg-slate-200/50 hover:dark:bg-slate-900/50 rounded-non border-none px-2 rounded-sm"
                                                    >
                                                      <AccordionTrigger
                                                        className={`group-hover:no-underline  w-full
                                                    
                                                  `}
                                                      >
                                                        <HoverCard>
                                                          <HoverCardTrigger
                                                            asChild
                                                          >
                                                            <div className="flex items-center gap-x-4">
                                                              <Image
                                                                src={
                                                                  reply.owner
                                                                    .picture!
                                                                }
                                                                width={50}
                                                                height={50}
                                                                alt="avatar"
                                                                className="object-cover rounded-md"
                                                              />
                                                              <div className="w-full h-full flex flex-col items-start justify-between gap-y-1">
                                                                <p className="text-md font-semibold">
                                                                  {reply.title.slice(
                                                                    0,
                                                                    20
                                                                  )}
                                                                  ...
                                                                </p>
                                                                <p className="w-fit text-md font-semibold text-xs  text-[#ff782d]">
                                                                  {
                                                                    reply.owner
                                                                      .username
                                                                  }
                                                                </p>
                                                              </div>
                                                            </div>
                                                          </HoverCardTrigger>
                                                          <HoverCardContent className="w-full flex items-center gap-x-2">
                                                            <Image
                                                              src={
                                                                reply.owner
                                                                  .picture!
                                                              }
                                                              width={50}
                                                              height={50}
                                                              alt="avatar"
                                                              className="object-cover rounded-md"
                                                            />
                                                            <div className="w-full h-full flex flex-col items-start justify-between gap-y-1">
                                                              <p className="text-md font-semibold">
                                                                {reply.title}
                                                              </p>
                                                              <p className="w-fit text-md font-semibold text-xs  text-[#ff782d]">
                                                                {
                                                                  reply.owner
                                                                    .username
                                                                }
                                                              </p>
                                                            </div>
                                                          </HoverCardContent>
                                                        </HoverCard>
                                                      </AccordionTrigger>
                                                      <AccordionContent>
                                                        <Preview
                                                          data={reply.content!}
                                                        />
                                                      </AccordionContent>
                                                    </AccordionItem>
                                                  )
                                                )}
                                              </Accordion>
                                            </DialogContent>
                                          </Dialog>
                                        </>
                                      ) : null}

                                      <span
                                        className={`text-slate-950 dark:text-slate-50 md:hidden ${
                                          user._id !== comment?.user?._id
                                            ? "block"
                                            : "hidden"
                                        } `}
                                      >
                                        ·
                                      </span>

                                      {user._id !== comment?.user?._id ? (
                                        <p
                                          className="block md:hidden text-xs dark:text-slate-50 hover:underline cursor-pointer underline-offset-2"
                                          onClick={() => setReplyTo(comment)}
                                        >
                                          Reply
                                        </p>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-full">
                              <div className="flex items-center gap-x-4">
                                <Image
                                  src={comment.user?.picture!}
                                  width={50}
                                  height={50}
                                  alt="avatar "
                                  className="object-cover rounded-md "
                                />

                                <div className="flex flex-col justify-between">
                                  <h2 className="block text-sm  lg:text-lg font-bold">
                                    {comment.title}
                                  </h2>

                                  <div className="flex items-center gap-x-2">
                                    <p className="text-xs text-[#FF782D]">
                                      {comment.user?.username}
                                    </p>
                                    ·
                                    <p className="text-xs dark:text-slate-50">
                                      {getTimeAgo(comment.createdAt)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </AccordionTrigger>
                        <AccordionContent>
                          <Preview data={comment?.content} />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="w-full flex flex-col items-center justify-center gap-y-2">
              <NoQuestions className="" />
              <div className="flex flex-col gap-y-2 ">
                <p className="font-bold text-lg md:text-xl">
                  No Question Has Been Asked .
                </p>
                <Button
                  onClick={() => setIsAsking(true)}
                  className="bg-[#FF782D] hover:bg-[#FF782D] hover:opacity-90 transition-all duration-300 ease-in-out rounded-sm w-full font-bold text-slate-50 text-sm"
                >
                  Ask a question
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Comments;
