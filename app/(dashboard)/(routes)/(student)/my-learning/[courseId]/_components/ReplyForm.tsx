"use client";

import React from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z, isValid } from "zod";
import { usePathname, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { TComment, TCourse, TUser } from "@/types/models.types";
import { scnToast } from "@/components/ui/use-toast";
import { replyToComment } from "@/lib/actions/reply.action";
import { Spinner } from "@/components/shared";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  title: z.string().min(10).max(100),
  content: z.string().optional(),
});

interface Props {
  course: TCourse;
  user: TUser;
  comment: TComment;
  setReplyTo: (comment: TComment | null) => void;
}

const ReplyForm = ({ course, user, comment, setReplyTo }: Props) => {
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const reply = await replyToComment({
        title: values.title,
        content: values.content,
        ownerId: user._id,
        commentId: comment?._id!,
        path: pathname,
      });

      await fetch("/api/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment,
          course,
          reply: reply,
          mode: "dark",
        }),
      });
      scnToast({
        title: `You Answered ${comment?.user.username}`,
        description: "Tanks for helping out 🎉, we appreciate it!",
        variant: "success",
      });
      setReplyTo(null);
      router.refresh();
    } catch (error: any) {
      scnToast({
        title: "An Error Occured",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setReplyTo(null);
      form.reset();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Answer Title{" "}
                <span className="text-destructive text-lg font-bold">*</span>
              </FormLabel>

              <FormControl>
                <Input
                  className="dark:bg-[#222f3e] dark:text-slate-50"
                  placeholder="I faced the same error this is how i fix it , happy to help 😊"
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
              <FormLabel htmlFor="editor">Detailed Answer</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Enter your answer..."
                  className="min-h-[300px] resize-none"
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
            onClick={() => setReplyTo(null)}
          >
            Cancel
          </Button>
          <Button
            size={"sm"}
            type="submit"
            className="w-[120px] bg-brand-red-500 hover:bg-brand-red-600 hover:opacity-90 transition-all duration-300 ease-in-out text-slate-50"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? (
              <Spinner size={15} className="text-slate-50" />
            ) : (
              "Submit Answer"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ReplyForm;
