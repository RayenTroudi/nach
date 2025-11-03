"use client";
import Congrats from "@/components/shared/animations/Congrats";
import QuizEnd from "@/components/shared/animations/QuizEnd";
import { Button } from "@/components/ui/button";
import { scnToast } from "@/components/ui/use-toast";
import { QuizState, useQuiz } from "@/contexts/QuizProvider";
import { pushPassedUser } from "@/lib/actions/quiz.action";
import { TQuiz, TUser } from "@/types/models.types";
import { IconMoodSadFilled } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import { CheckCircleIcon } from "lucide-react";

type Props = {
  student: TUser;
  quiz: TQuiz;
};

const ResultScreen = ({ student, quiz }: Props) => {
  const router = useRouter();

  const { quizState, dispatch } = useQuiz();

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const correctAnswers = quizState.userAnswers.filter(
    (answer) =>
      answer.userAnswer ===
      quizState.quiz.questions[answer.questionIndex].correctAnswer
  );

  const percentage =
    (correctAnswers.length / quizState.quiz.questions.length) * 100;

  const onSubmitScoreHandler = async () => {
    try {
      setIsSubmitted(true);
      await pushPassedUser(quiz._id, student._id);
      scnToast({
        title: "Success",
        description: "Take a look at the correct answers below",
        variant: "success",
      });

      router.refresh();
    } catch (error: any) {
      setIsSubmitted(false);

      scnToast({
        title: "Error",
        description: "Something went very wrong, please try again",
        variant: "destructive",
      });
    }
  };
  return (
    <div className="w-full flex flex-col gap-y-4">
      <div
        className="w-full flex flex-col md:flex-row  md:gap-x-4 md:items-start"
        style={{
          height: "calc(100vh - 150px)",
        }}
      >
        <div className="w-full md:w-1/3">
          <QuizEnd className="h-[200px] md:h-full" />
        </div>
        <div className="flex-1 w-full h-full flex flex-col gap-y-4 -mt-20 md:mt-0">
          <div className="w-full h-[200px] flex items-center justify-center gap-x-4 ">
            {percentage >= 50 ? (
              <>
                <Congrats />
                <p className="text-xl md:text-2xl lg:text-4xl font-semibold text-slate-800 dark:text-slate-200 text-center uppercase">
                  Congratulations
                </p>
                <Congrats />
              </>
            ) : (
              <>
                <IconMoodSadFilled className="" size={50} />
                <p className="text-xl md:text-2xl lg:text-4xl font-semibold text-slate-800 dark:text-slate-200 text-center uppercase">
                  Unfortunately
                </p>
                <IconMoodSadFilled className="" size={50} />
              </>
            )}
          </div>
          <div className="w-full flex flex-col gap-y-4 -mt-16">
            <p className="text-lg md:text-xl lg:text-2xl text-center font-semibold">
              {student.username}, you scored{" "}
              <span className="font-bold text-2xl md:text-3xl lg:text-4xl text-[#FF782D]">
                {percentage}%
              </span>
            </p>
            <p className="text-md md:text-lg lg:text-xl text-center text-slate-700 dark:text-slate-300">
              You got {correctAnswers.length} out of{" "}
              {quizState.quiz.questions.length} questions correct
            </p>

            <p className="w-full mx-auto text-center text-slate-400 dark:text-slate-500">
              Once You submit your score, you will not be able to replay the
              quiz, and were going to show all the correct answers down below
            </p>
          </div>

          <div className="w-full mt-8 flex flex-col gap-y-2 md:flex-row md:items-center md:justify-between  md:gap-x-2">
            {percentage >= 50 && !isSubmitted ? (
              <Button
                onClick={() => onSubmitScoreHandler()}
                className="w-full  bg-[#FF782D] hover:bg-[#FF782D] opacity-90 hover:opacity-100 duration-300 ease-in-out transition-all uppercase text-slate-50"
              >
                Submit your score
              </Button>
            ) : null}
            {!isSubmitted ? (
              <Button
                onClick={() =>
                  dispatch({ type: QuizState.RESTARTED, payload: quiz })
                }
                className="w-full duration-300 ease-in-out transition-all uppercase "
              >
                Replay again
              </Button>
            ) : null}
            <Button
              onClick={() => {
                dispatch({ type: QuizState.RESET });
                router.back();
              }}
              className="w-full  bg-slate-500 hover:bg-slate-500 text-slate-50 uppercase duration-300 ease-in-out transition-all opacity-90 hover:opacity-100"
            >
              Go Back To Course
            </Button>
          </div>
        </div>
      </div>

      {isSubmitted ? (
        <Accordion type="single" collapsible className="w-full md:-mt-40">
          {quiz.questions.map((question) => (
            <AccordionItem
              key={question._id}
              value={question._id.toString()}
              className="group hover:bg-slate-200/50 dark:hover:bg-slate-900 px-2 py-1 rounded-sm border-none"
            >
              <AccordionTrigger className="group-hover:no-underline w-full  ">
                <div className="w-full flex items-center gap-x-2">
                  <Image
                    src={"/icons/question.svg"}
                    alt="question"
                    width={20}
                    height={20}
                    className="object-cover object-center flex-shrink-0"
                  />
                  <p className="text-md md:text-xl text-start">
                    {" "}
                    {question.title}{" "}
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="w-full flex items-center gap-x-2 pl-2 text-[#065f46]">
                <CheckCircleIcon className="w-5 h-5 text-[#065f46] flex-shrink-0" />
                <p className="text-md md:text-lg text-[#065f46]">
                  {" "}
                  {question.correctAnswer}{" "}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : null}
    </div>
  );
};

export default ResultScreen;
