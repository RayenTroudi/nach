"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SendIcon } from "lucide-react";
import { scnToast } from "../ui/use-toast";
import { TCourseChatRoom, TUser } from "@/types/models.types";
import { usePathname, useRouter } from "next/navigation";
import { createMessage } from "@/lib/actions/chat-room-message.action";
import { createPrivateMessage } from "@/lib/actions/private-chat-message.action";
import Spinner from "./Spinner";
import { isPrivateChat } from "@/lib/utils/chat-utils";
import { useTranslations } from "next-intl";

const formSchema = z.object({
  message: z.string().optional(),
});

type Props = {
  selectedChatRoom: TCourseChatRoom;
  user: TUser;
};

const MessageInput = ({ user, selectedChatRoom }: Props) => {
  const t = useTranslations("shared.messageInput");
  const router = useRouter();
  const pathname = usePathname();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!values.message) return;

    try {
      const isPrivate = isPrivateChat(selectedChatRoom);
      
      console.log("📤 Sending message:", {
        isPrivate,
        roomId: selectedChatRoom._id,
        studentsCount: selectedChatRoom.students?.length,
        messagePreview: values.message.substring(0, 30)
      });
      
      if (isPrivate) {
        // Send private message
        console.log("🔒 Sending as PRIVATE message");
        await createPrivateMessage({
          privateChatRoomId: selectedChatRoom._id,
          senderId: user._id,
          content: values.message,
          path: pathname,
        });
      } else {
        // Send group message
        console.log("👥 Sending as GROUP message");
        await createMessage({
          chatRoomId: selectedChatRoom._id,
          senderId: user._id,
          content: values.message,
          path: pathname,
        });
      }

      router.refresh();
    } catch (error: any) {
      console.log("Error in MessageInput: ", error.message);
      scnToast({
        title: t("errorTitle"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      form.clearErrors();
      form.reset();
    }
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-center gap-2 w-full px-4 py-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700"
      >
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormMessage />

              <FormControl>
                <Input
                  placeholder={t("placeholder")}
                  {...field}
                  className="w-full py-6 rounded-full bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-600"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          size="icon"
          className="h-12 w-12 rounded-full bg-red-500 hover:bg-red-600 shadow-lg hover:shadow-xl transition-all duration-300"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Spinner size={22} className="text-white" />
          ) : (
            <SendIcon size={22} className="text-white" />
          )}
        </Button>
      </form>
    </Form>
  );
};

export default MessageInput;
