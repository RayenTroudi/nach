"use client";
import { Spinner } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { scnToast } from "@/components/ui/use-toast";
import { deleteQuestion, updateQuestion } from "@/lib/actions/question.action";
import { TQuestionOption } from "@/types/models.types";
import {
  CheckCircleIcon,
  FileQuestion,
  PencilLineIcon,
  PlusCircle,
  Settings,
  Trash2,
  XCircle,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { set } from "mongoose";
import {
  createQuestionOption,
  deleteOption,
  updateOption,
} from "@/lib/actions/question-option.action";

const formSchema = z.object({
  newOption: z
    .string()
    .min(2, {
      message: "Option must be at least 2 characters",
    })
    .max(50, {
      message: "Option must be at most 50 characters",
    }),
});
interface Props {
  question: {
    _id?: string;
    title: string;
    options: TQuestionOption[] | string[];
    correctAnswer: string;
  };
}

const QuizQuestions = ({ question }: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  const [editedQuestion, setEditedQuestion] = useState<{
    _id: string;
    title: string;
    options: TQuestionOption[] | string[];
    correctAnswer: string;
  } | null>(null);

  const [newQuestionTitle, setNewQuestionTitle] = useState<string>("");

  const [editedOption, setEditedOption] = useState<TQuestionOption | null>(
    null
  );

  const [newOptionTitle, setNewOptionTitle] = useState<string>("");
  const [updatingOptionTitle, setUpdatingOptionTitle] =
    useState<boolean>(false);

  const [updatingQuestionTitle, setUpdatingQuestionTitle] =
    useState<boolean>(false);

  const [isAddingNewOption, setIsAddingNewOption] = useState<boolean>(false);
  const [deletedQuestionId, setDeletedQuestionId] = useState<string | null>(
    null
  );

  const [deletedOptionId, setDeletedOptionId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newOption: "",
    },
  });

  const { isValid, isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const newOption = {
        title: values.newOption,
        questionId: question._id!,
        path: pathname,
      };

      await createQuestionOption(newOption);

      scnToast({
        title: "Option Created",
        description: "Option has been successfully Added",
        variant: "success",
      });

      setIsAddingNewOption(false);
      router.refresh();
      form.reset();
    } catch (error: any) {
      scnToast({
        title: "Error",
        description: "An error occurred while creating the option",
        variant: "destructive",
      });
    }
  }

  const onDeleteQuestionHandler = async (questionId: string) => {
    try {
      setDeletedQuestionId(questionId);
      await deleteQuestion(questionId);

      setDeletedQuestionId(null);
      router.refresh();
      scnToast({
        title: "Question Deleted",
        description: "Question has been successfully deleted",
        variant: "success",
      });
    } catch (error) {
      scnToast({
        title: "Error",
        description: "An error occurred while deleting the question",
        variant: "destructive",
      });
      setDeletedQuestionId(null);
    } finally {
      setDeletedQuestionId(null);
    }
  };

  const onDeleteOptionHandler = async (optionId: string) => {
    try {
      setDeletedOptionId(optionId);
      await deleteOption(optionId, pathname);

      setDeletedOptionId(null);
      router.refresh();
      scnToast({
        title: "Option Deleted",
        description: "Option has been successfully deleted",
        variant: "success",
      });
    } catch (error) {
      scnToast({
        title: "Error",
        description: "An error occurred while deleting the option",
        variant: "destructive",
      });
      setDeletedOptionId(null);
    } finally {
      setDeletedOptionId(null);
    }
  };

  const onUpdateOptionTitleHandler = async () => {
    if (newOptionTitle.length < 2 || newOptionTitle.length > 50)
      return scnToast({
        title: "Error",
        description:
          "Option must be at least 2 characters and at most 50 characters",
        variant: "destructive",
      });

    if (newOptionTitle === editedOption!.title) {
      setNewOptionTitle("");
      setEditedOption(null);
      return scnToast({
        title: "Info",
        description: "Option title is the same as the previous one",
        variant: "default",
      });
    }

    try {
      setUpdatingOptionTitle(true);
      await updateOption({
        optionId: editedOption!._id!,
        title: newOptionTitle,
        path: pathname,
      });

      scnToast({
        title: "Option Updated",
        description: "Option has been successfully updated",
        variant: "success",
      });
      setUpdatingOptionTitle(false);
      setNewOptionTitle("");
      setEditedOption(null);
      router.refresh();
    } catch (error: any) {
      scnToast({
        title: "Error",
        description: "An error occurred while updating the option",
        variant: "destructive",
      });
    } finally {
      setUpdatingOptionTitle(false);
      setNewOptionTitle("");
      setEditedOption(null);
    }
  };

  const onUpdateQuestionTitleHandler = async () => {
    if (newQuestionTitle.length < 10 || newQuestionTitle.length > 50)
      return scnToast({
        title: "Error",
        description:
          "Option must be at least 10 characters and at most 50 characters",
        variant: "destructive",
      });

    if (newQuestionTitle === editedQuestion!.title) {
      setNewQuestionTitle("");
      setEditedQuestion(null);
      return scnToast({
        title: "Info",
        description: "Question title is the same as the previous one",
        variant: "default",
      });
    }

    try {
      setUpdatingQuestionTitle(true);
      await updateQuestion({
        questionId: editedQuestion!._id,
        data: {
          title: newQuestionTitle,
        },
        path: pathname,
      });

      scnToast({
        title: "Question Updated",
        description: "Question has been successfully updated",
        variant: "success",
      });

      setUpdatingQuestionTitle(false);
      setNewQuestionTitle("");
      setEditedQuestion(null);
      router.refresh();
    } catch (error: any) {
      scnToast({
        title: "Error",
        description: "An error occurred while updating the question",
        variant: "destructive",
      });
    } finally {
      setUpdatingQuestionTitle(false);
      setNewQuestionTitle("");
      setEditedQuestion(null);
    }
  };

  return (
    <div
      className={`flex flex-col gap-4 bg-white dark:bg-slate-950 rounded-lg px-2 py-4 relative `}
    >
      {deletedQuestionId &&
      typeof question !== "string" &&
      deletedQuestionId === question._id ? (
        <span className="absolute top-0 left-0 bottom-0 w-full bg-slate-500/50  flex items-center justify-center rounded-lg">
          <Spinner size={50} className="text-primaryColor" />
        </span>
      ) : null}

      <div className="w-full flex items-center justify-between">
        <h1 className="font-semibold text-slate-950 dark:text-slate-200 flex items-center gap-x-2 text-sm md:text-md lg:text-lg ">
          <FileQuestion className="text-slate-950 dark:text-slate-200 flex-shrink-0" />
          {editedQuestion && editedQuestion._id === question._id ? (
            <Input
              placeholder="e.g Your Question"
              className="font-bold flex-1 w-full bg-transparent border-none outline-none p-0 h-full"
              value={newQuestionTitle}
              onChange={(e) => setNewQuestionTitle(e.target.value)}
              autoFocus
            />
          ) : (
            <p>{question.title}</p>
          )}
        </h1>
        {question?._id ? (
          <div className="flex items-center gap-x-1">
            {editedQuestion &&
            typeof question !== "string" &&
            editedQuestion._id === question._id ? (
              <Button
                className="size-[20px] p-0 rounded-md hover:bg-transparent group"
                variant={"ghost"}
                onClick={onUpdateQuestionTitleHandler}
                disabled={
                  newQuestionTitle.length < 10 || newQuestionTitle.length > 50
                }
              >
                {updatingQuestionTitle ? (
                  <Spinner size={15} className="flex-shrink-0 text-green-500" />
                ) : (
                  <CheckCircleIcon
                    size={15}
                    className="flex-shrink-0 text-green-500"
                  />
                )}
              </Button>
            ) : null}
            {question.options.length < 4 ? (
              <Button
                variant={"ghost"}
                className="size-[20px] rounded-md hover:bg-transparent group"
                onClick={() => setIsAddingNewOption((prev) => !prev)}
              >
                {isAddingNewOption ? (
                  <XCircle
                    size={15}
                    className="flex-shrink-0 text-slate-950 dark:text-slate-50 group-hover:text-primaryColor transition-all duration-300 ease-in-out"
                  />
                ) : (
                  <PlusCircle
                    size={15}
                    className="flex-shrink-0 text-slate-950 dark:text-slate-50 group-hover:text-primaryColor transition-all duration-300 ease-in-out"
                  />
                )}
              </Button>
            ) : null}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="p-0 size-[20px] rounded-md hover:bg-transparent outline-none border-none group focus-within:outline-none"
                >
                  <Settings
                    size={15}
                    className="text-slate-950 dark:text-slate-50 flex-shrink-0 group-hover:animate-spin"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" side="bottom">
                <DropdownMenuGroup className="w-full flex flex-col space-y-2">
                  <DropdownMenuItem
                    onClick={() => {
                      if (typeof question !== "string") {
                        setNewQuestionTitle(question.title);
                        setEditedQuestion({ ...question, _id: question._id! });
                      }
                    }}
                    className="text-slate-50 flex items-center gap-x-2 bg-[#065f46] rounded-md hover:bg-[#065f46] cursor-pointer"
                  >
                    <p>Edit Question</p>
                    <DropdownMenuShortcut>
                      <PencilLineIcon size={15} />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDeleteQuestionHandler(question._id!)}
                    className="text-slate-50 flex items-center gap-x-2 bg-destructive rounded-md hover:bg-destructive cursor-pointer"
                  >
                    <p>Delete Question</p>
                    <DropdownMenuShortcut>
                      {deletedQuestionId &&
                      question._id === deletedQuestionId ? (
                        <Spinner size={15} className="flex-shrink-0" />
                      ) : (
                        <Trash2 size={15} className="flex-shrink-0" />
                      )}
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : null}
      </div>

      {isAddingNewOption ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full bg-slate-100 dark:bg-black p-2 rounded-lg border border-input flex flex-col space-y-2"
          >
            <FormField
              control={form.control}
              name="newOption"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="e.g Your Option"
                      {...field}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={!isValid}
              className="bg-primaryColor  font-semibold hover:bg-primaryColor text-slate-50"
            >
              {isSubmitting ? (
                <Spinner size={20} className="text-slate-50" />
              ) : (
                "Add Option"
              )}
            </Button>
          </form>
        </Form>
      ) : null}
      <div className="pl-4 flex flex-col gap-y-2">
        {question.options.map((option, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-slate-100 dark:bg-black p-2 rounded-lg border border-input"
          >
            <div key={index} className="flex items-center gap-x-2 ">
              <Image
                src="/icons/question.svg"
                width={20}
                height={20}
                alt="correct"
              />

              {editedOption &&
              typeof option !== "string" &&
              editedOption._id === option._id ? (
                <Input
                  placeholder="e.g Your Option"
                  className="font-bold flex-1 w-full bg-transparent border-none outline-none p-0 h-full"
                  value={newOptionTitle}
                  onChange={(e) => setNewOptionTitle(e.target.value)}
                  autoFocus
                />
              ) : (
                <p
                  key={index}
                  className="text-slate-950 dark:text-slate-50 text-sm"
                >
                  {" "}
                  {typeof option === "string" ? option : option.title}{" "}
                </p>
              )}
            </div>

            {question?._id ? (
              <div className="flex items-center space-x-2">
                {editedOption &&
                typeof option !== "string" &&
                editedOption._id === option._id ? (
                  <Button
                    className="size-[20px] p-0 rounded-md hover:bg-transparent group"
                    variant={"ghost"}
                    onClick={onUpdateOptionTitleHandler}
                    disabled={
                      newOptionTitle.length < 2 || newOptionTitle.length > 50
                    }
                  >
                    {updatingOptionTitle ? (
                      <Spinner
                        size={15}
                        className="flex-shrink-0 text-green-500"
                      />
                    ) : (
                      <CheckCircleIcon
                        size={15}
                        className="flex-shrink-0 text-green-500"
                      />
                    )}
                  </Button>
                ) : null}
                <Button
                  className="size-[20px] p-0 rounded-md hover:bg-transparent group"
                  variant={"ghost"}
                  onClick={() => {
                    if (typeof option !== "string") {
                      setNewOptionTitle(option.title);
                      setEditedOption(option);
                    }
                  }}
                >
                  <PencilLineIcon
                    size={15}
                    className="text-slate-950 dark:text-slate-50 group-hover:text-primaryColor"
                  />
                </Button>
                {question.options.length > 2 ? (
                  <Button
                    className="size-[20px] p-0 rounded-md hover:bg-transparent group"
                    variant={"ghost"}
                    onClick={() => {
                      if (typeof option !== "string") {
                        onDeleteOptionHandler(option._id!);
                      }
                    }}
                  >
                    {deletedOptionId &&
                    typeof option !== "string" &&
                    option._id === deletedOptionId ? (
                      <Spinner
                        size={15}
                        className="flex-shrink-0 text-primaryColor"
                      />
                    ) : (
                      <Trash2
                        size={15}
                        className="flex-shrink-0 text-slate-950 dark:text-slate-50 group-hover:text-destructive transition-all duration-300 ease-in-out"
                      />
                    )}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <div className="pl-4 flex items-center gap-x-2">
        <CheckCircleIcon size={20} className="text-[#49BBBD]" />

        {editedOption &&
        editedOption!.title.trim().toLocaleUpperCase() ===
          question.correctAnswer.trim().toLocaleUpperCase() ? (
          <Input
            placeholder="e.g Your Option"
            className="font-bold flex-1 w-full bg-transparent border-none outline-none p-0 h-full text-[#49BBBD]"
            value={newOptionTitle}
            onChange={() => {}} // Read-only field requires onChange handler
            readOnly
          />
        ) : (
          <p className="text-[#49BBBD]">{question.correctAnswer}</p>
        )}
      </div>
    </div>
  );
};

export default QuizQuestions;
