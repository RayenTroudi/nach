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
import { Seperator, Spinner } from "@/components/shared";
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
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  content: z.string().min(3).max(500),
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
        title: values.content?.substring(0, 100) || "Question",
        content: values.content,
        userId: user._id,
        courseId: course._id,
        path: pathname,
      });
      setIsSendingEmail(true);

      await fetch(`/api/comment`, {
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
        <Card className="w-full max-w-3xl mx-auto border-slate-200 dark:border-slate-800 shadow-lg">
          <CardHeader className="space-y-3 pb-6">
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-[#FF782D] to-orange-600 bg-clip-text text-transparent">
              Ask Your Question
            </CardTitle>
            <p className="text-sm text-center text-slate-600 dark:text-slate-400">
              Your instructor will be notified and respond as soon as possible
            </p>
            <Separator className="bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
          </CardHeader>
          <CardContent className="pb-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="editor" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        More details about the question
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter more details..."
                          className="min-h-[100px] resize-y border-slate-300 dark:border-slate-700 focus-visible:ring-[#FF782D] focus-visible:ring-offset-0 rounded-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-end gap-x-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={isSubmitting}
                    onClick={() => setIsAsking(false)}
                    className="h-11 px-6 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#FF782D] hover:bg-orange-600 text-white font-medium px-6 h-11 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 min-w-[140px]"
                    disabled={
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
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-y-8 pt-6">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
              Questions & Discussions
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Ask questions and get help from your instructor and fellow students
            </p>
          </div>

          <Separator className="bg-slate-200 dark:bg-slate-800" />

          {course?.comments?.length ? (
            <Card className="w-full border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="pb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                  <div className="relative flex-1">
                    <Input
                      className="w-full h-11 bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 pl-10 rounded-lg focus-visible:ring-[#FF782D] focus-visible:ring-offset-0"
                      placeholder="Search questions..."
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Image
                      src="/icons/search.svg"
                      width={18}
                      height={18}
                      alt="search"
                      className="absolute top-1/2 transform -translate-y-1/2 left-3 opacity-50"
                    />
                  </div>
                  <Button
                    onClick={() => setIsAsking(true)}
                    className="h-11 px-6 rounded-lg bg-[#FF782D] hover:bg-orange-600 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-x-2"
                  >
                    <span className="hidden sm:inline">Ask Question</span>
                    <span className="sm:hidden">Ask</span>
                    <MessageCircleQuestion size={18} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="w-full flex flex-col gap-y-2 pt-0">
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
                  <Accordion type="single" collapsible className="w-full space-y-3">
                    {filteredComments.map((comment: TComment) => (
                      <AccordionItem
                        value={comment._id}
                        key={comment._id}
                        className="relative border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 hover:shadow-md transition-all duration-200 px-4 overflow-hidden"
                      >
                        {comment?.user?._id === user._id ? (
                          <Button
                            disabled={deletedCommentId !== null}
                            onClick={() => onDeleteCommentHandler(comment._id)}
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-12 hover:text-destructive hover:bg-destructive/10 transition-colors duration-200 rounded-lg"
                          >
                            {deletedCommentId === comment._id ? (
                              <Spinner size={18} />
                            ) : (
                              <Trash size={18} />
                            )}
                          </Button>
                        ) : null}
                        {user._id !== comment?.user?._id ? (
                          <Button
                            disabled={false}
                            onClick={() => setReplyTo(comment)}
                            variant="ghost"
                            size="icon"
                            className="hidden md:flex absolute top-4 right-12 hover:text-[#FF782D] hover:bg-orange-100 dark:hover:bg-orange-950/30 transition-colors duration-200 rounded-lg"
                          >
                            <MessageCircleReply size={18} />
                          </Button>
                        ) : null}

                        <AccordionTrigger className="w-full hover:no-underline py-4">
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <div className="flex items-start gap-x-4 w-full">
                                <Image
                                  src={comment.user?.picture!}
                                  width={48}
                                  height={48}
                                  alt="avatar"
                                  className="object-cover rounded-full ring-2 ring-slate-200 dark:ring-slate-800"
                                />
                                <div className="flex flex-col items-start gap-y-2 flex-1 min-w-0">
                                  <div className="flex items-center gap-x-2 flex-wrap">
                                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                                      {comment.title}
                                    </h2>

                                    {comment.user._id === course.instructor._id ? (
                                      <span className="px-3 py-0.5 text-xs font-medium rounded-full bg-[#FF782D]/10 text-[#FF782D] border border-[#FF782D]/20">
                                        Instructor
                                      </span>
                                    ) : null}
                                  </div>

                                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
                                    <p className="font-medium text-slate-700 dark:text-slate-300 hover:text-[#FF782D] cursor-pointer transition-colors">
                                      {comment.user?.username}
                                    </p>

                                    <span>·</span>

                                    <p className="text-xs">
                                      {getTimeAgo(comment.createdAt)}
                                    </p>

                                    {comment?.replies?.length ? (
                                      <>
                                        <p className="text-xs font-medium px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                                          {comment?.replies?.length} {comment?.replies?.length === 1 ? 'answer' : 'answers'}
                                        </p>
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-7 px-3 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                                            >
                                              View
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
                                                      <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                                        {reply.content!}
                                                      </p>
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
                        <AccordionContent className="pt-4 pb-2">
                          <div className="ml-16 pl-4 border-l-2 border-slate-200 dark:border-slate-800">
                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
                              {comment?.content}
                            </p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="w-full flex flex-col items-center justify-center gap-y-8 py-20">
              <NoQuestions className="w-32 h-60" />
              <div className="flex flex-col gap-y-4 items-center text-center max-w-md">
                <h3 className="font-bold text-2xl md:text-3xl text-slate-900 dark:text-slate-100">
                  No Questions Yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">
                  Be the first to ask a question about this course! Your instructor is ready to help.
                </p>
                <Button
                  onClick={() => setIsAsking(true)}
                  className="bg-[#FF782D] hover:bg-orange-600 transition-all duration-200 rounded-lg px-8 h-12 font-semibold text-white shadow-sm hover:shadow-md"
                >
                  Ask Your First Question
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
