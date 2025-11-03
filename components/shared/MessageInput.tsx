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
import Spinner from "./Spinner";

const formSchema = z.object({
  message: z.string().optional(),
});

type Props = {
  selectedChatRoom: TCourseChatRoom;
  user: TUser;
};

const MessageInput = ({ user, selectedChatRoom }: Props) => {
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
      await createMessage({
        chatRoomId: selectedChatRoom._id,
        senderId: user._id,
        content: values.message,
        path: pathname,
      });

      router.refresh();
    } catch (error: any) {
      console.log("Error in MessageInput: ", error.message);
      scnToast({
        title: "Error",
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
        className="flex items-center w-full h-full"
      >
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="w-full h-full">
              <FormMessage />

              <FormControl>
                <Input
                  placeholder="e.g Hey I have an error in section N° can some one help me?"
                  {...field}
                  className="w-full h-full bg-slate-100 dark:bg-slate-900 rounded-none text-md "
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          size={"lg"}
          className="h-full rounded-none bg-[#FF782D] hover:bg-[#FF782D]  opacity-90 hover:opacity-100 duration-300 transition-all ease-in-out "
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Spinner size={26} className="text-slate-50" />
          ) : (
            <SendIcon size={26} className="text-slate-50" />
          )}
        </Button>
      </form>
    </Form>
  );
};

export default MessageInput;
