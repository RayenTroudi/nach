"use client";
import { Spinner } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { scnToast } from "@/components/ui/use-toast";
import Quiz, { IQuiz } from "@/lib/models/Quiz.model";
import { ICourse } from "@/lib/models/course.model";
import Image from "next/image";
import React, { useState } from "react";
import QuizQuestions from "./QuizQuestions";
import { register } from "module";
import { createQuiz, pushQuestionToQuiz } from "@/lib/actions/quiz.action";
import { usePathname } from "next/navigation";
import {
  createQuestion,
  pushOptionToQuestion,
} from "@/lib/actions/question.action";
import { createQuestionOption } from "@/lib/actions/question-option.action";
import { set } from "mongoose";
import { useRouter } from "next/navigation";
import {
  TCourse,
  TQuestion,
  TQuestionOption,
  TQuiz,
} from "@/types/models.types";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  AlertTriangle,
  Key,
  PlusCircle,
  Timer,
  Trash2,
  XCircle,
} from "lucide-react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { usePageLoader } from "@/contexts/PageLoaderProvider";
import Loader from "@/components/shared/Loader";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  addedQuestion: z.string().min(5).max(50),
  options: z.array(z.string().min(2).max(50)).min(2).max(4),
});

interface Props {
  section: {
    _id: string;
    title: string;
    course: TCourse;
    quiz?: TQuiz;
  };
}

interface IGeneratedQuiz {
  questions: {
    title: string;
    options: string[];
    correctAnswer: string;
  }[];
}

const QuizForm = ({ section }: Props) => {
  const { setIsLoading } = usePageLoader();
  const pathname = usePathname();
  const router = useRouter();

  const [quizTime, setQuizTime] = useState<number>(5);

  const [isAddingQuestion, setIsAddingQuestion] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(3);
  const [option, setOption] = useState<string>("");
  const [correctAnswer, setCorrectAnswer] = useState<number>(-1);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      addedQuestion: "",
      options: [],
    },
  });

  const { isSubmitting, isValid } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { addedQuestion, options } = values;
    if (correctAnswer === -1) {
      return form.setError("options", {
        message: "Please select one of the options as a correct answer",
      });
    }

    if (options.length < 2 || options.length > 4) {
      return form.setError("options", {
        message: "Options must be between 2 and 4",
      });
    }

    try {
      const newQuestion = await createQuestion({
        title: addedQuestion,
        correctAnswer: options[correctAnswer],
        quizId: section.quiz!._id,
        path: pathname,
      });

      options.forEach(async (option) => {
        const newOption = await createQuestionOption({
          title: option,
          questionId: newQuestion._id,
          path: pathname,
        });
      });

      setIsAddingQuestion(false);

      const el = document.getElementById(`${newQuestion._id}`);
      el?.scrollIntoView({ behavior: "smooth" });

      scnToast({
        variant: "success",
        title: "Success",
        description: "Question added successfully",
      });

      router.refresh();
    } catch (error: any) {
      console.log("CREATE QUESTION ERROR: ", error.message);
      scnToast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  }

  const onAddOptionToQuestionHandler = (field: any) => {
    if (option.length < 2 || option.length > 50)
      return form.setError("options", {
        message: "Option must be between 2 and 50 characters",
      });

    const options = field.value;

    if (options.length < 4) {
      form.setValue("options", [...options, option]);
    }
    form.clearErrors("options");
    setOption("");
    // form.trigger("options");
  };

  const onChangeQuizTimeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (+e.target.value < 5 || +e.target.value > 60)
      return scnToast({
        variant: "destructive",
        title: "Error",
        description: "Quiz time must be between 5 and 60 minutes",
      });
    setQuizTime(+e.target.value);
  };

  return (
    <div
      className={cn(
        "relative flex flex-col gap-y-6 bg-slate-200/50 dark:bg-slate-900 shadow-md p-6 rounded-md border border-input"
      )}
    >
      <div className={cn("relative flex flex-col gap-y-6")}>
        <div className="w-full flex items-center justify-between">
          <h2 className="font-bold text-slate-500 dark:text-slate-300 flex items-center space-x-2">
            <p>Section Quiz</p>
            <span className="text-sm text-slate-400">
              (
              <em className="text-primaryColor">
                {section?.quiz?.questions.length || numberOfQuestions || 0}
              </em>{" "}
              / 15 Questions)
            </span>
          </h2>

          <div className="flex items-center gap-x-2">
            <Timer className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {quizTime ? quizTime : section.quiz?.time! / (60 * 1000)} Minutes
            </span>
          </div>

          {section.quiz && section.quiz.questions.length < 15 ? (
            <Button
              variant={"ghost"}
              className="w-[30px] h-[30px] rounded-md bg-primaryColor opacity-80 hover:opacity-100 hover:bg-primaryColor transition-all duration-300 ease-out"
              onClick={() => setIsAddingQuestion((curr) => !curr)}
            >
              {isAddingQuestion ? (
                <XCircle className="flex-shrink-0 text-slate-50" size={20} />
              ) : (
                <PlusCircle className="flex-shrink-0 text-slate-50" size={20} />
              )}
            </Button>
          ) : null}
        </div>

        {isAddingQuestion ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full border border-input bg-white dark:bg-black p-4 rounded-lg flex flex-col gap-y-4"
            >
              <FormField
                control={form.control}
                name="addedQuestion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Question Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g How to center a div" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="options"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel className="font-bold flex items-center gap-x-1">
                      <p>Question Options</p>
                      <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ">
                        {" "}
                        (2 To 4) Options{" "}
                      </span>
                    </FormLabel>
                    <FormMessage />

                    {field.value.length < 4 ? (
                      <FormControl>
                        <Input
                          placeholder="e.g Use flex box and ..."
                          onChange={(e) => setOption(e.target.value)}
                          value={option}
                        />
                      </FormControl>
                    ) : null}

                    {field.value.length > 0 ? (
                      <RadioGroup className="w-full flex flex-col gap-y-4 border border-input bg-slate-50 dark:bg-slate-950 p-4 rounded-md">
                        {field.value.map((option: string, index: number) => (
                          <div
                            className="flex items-center justify-between"
                            key={index}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value={option}
                                id={`${index}`}
                                onClick={() => {
                                  console.log("FORM: ", form.formState.errors);
                                  setCorrectAnswer(index);
                                }}
                              />
                              <Label
                                htmlFor={`${index}`}
                                className="cursor-pointer"
                              >
                                {" "}
                                {option}{" "}
                              </Label>
                            </div>

                            <Button
                              variant={"ghost"}
                              className="group size-[20px] rounded-md p-0 hover:bg-transparent "
                              onClick={() => {
                                const options = field.value;
                                options.splice(index, 1);
                                form.setValue("options", options);
                              }}
                            >
                              <Trash2
                                size={15}
                                className="group-hover:text-destructive text-slate-950 dark:text-slate-50 transition-all duration-300 ease-out"
                              />
                            </Button>
                          </div>
                        ))}
                      </RadioGroup>
                    ) : null}

                    {field.value.length < 4 ? (
                      <Button
                        type="button"
                        className="border border-input dark:hover:bg-transparent shadow-lg shadow-slate-200 dark:shadow-slate-950 slate w-full flex items-center justify-center gap-x-2"
                        variant={"ghost"}
                        onClick={() => onAddOptionToQuestionHandler(field)}
                      >
                        <PlusCircle className="flex-shrink-0" size={20} />
                        <p>Add Option</p>
                      </Button>
                    ) : null}
                    <FormDescription className="flex items-center gap-x-2 !mt-8">
                      <AlertTriangle
                        className="flex-shrink-0 text-slate-500 dark:text-slate-400"
                        size={15}
                      />
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        Don&apos;t forget to select one of the options as a
                        correct answer
                      </span>
                    </FormDescription>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="mt-4 bg-primaryColor hover:bg-primaryColor text-slate-50  font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Spinner className="text-slate-50" size={20} />
                ) : (
                  "Add Question"
                )}
              </Button>
            </form>
          </Form>
        ) : null}

        {!generatedQuiz && !section.quiz ? (
          <div className="relative flex flex-col gap-y-2">
            <p className="font-semibold text-slate-600 dark:text-slate-300  ">
              Quiz time ({quizTime} min)
            </p>
            <Input
              placeholder="In how many time the student needs to solve it ?"
              type="number"
              value={quizTime}
              min={5}
              max={60}
              onChange={onChangeQuizTimeHandler}
            />

            <p className="font-semibold text-slate-600 dark:text-slate-300  ">
              Number of Questions ({numberOfQuestions} / 15)
            </p>
            <Select
              onValueChange={(e) => {
                console.log("NUMBER OF QUESTIONS: ", +e);
                setNumberOfQuestions(+e);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="How Many Questions You Need" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>How Many You Need</SelectLabel>

                  {Array.from({ length: 15 }).map((_, index) => (
                    <>
                      {index + 1 < 3 ? null : (
                        <SelectItem key={index} value={`${index + 1}`}>
                          {index + 1} Questions
                        </SelectItem>
                      )}
                    </>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
              Please add quiz questions manually using the form above.
            </p>
          </div>
        ) : null}

        <div>
          {section.quiz ? (
            <div className="flex flex-col gap-y-4">
              {section.quiz?.questions.map(
                (question: TQuestion, index: number) => {
                  const _question = {
                    _id: question._id,
                    title: question.title,
                    options: question.options,
                    correctAnswer: question.correctAnswer,
                  };
                  return <QuizQuestions key={index} question={_question} />;
                }
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default QuizForm;
