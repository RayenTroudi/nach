"use client";
import { Button } from "@/components/ui/button";
import { QuizState, useQuiz } from "@/contexts/QuizProvider";
import { convertSecondsToTime } from "@/lib/utils";
import { TQuestion, TQuestionOption } from "@/types/models.types";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import React from "react";

type Props = {
  question: TQuestion;
};

const Question = ({ question }: Props) => {
  const { quizState, dispatch } = useQuiz();

  const alreadyAnsweredQuestion = quizState.userAnswers.find(
    (answer) => answer.questionIndex === quizState.currentQuestionIndex
  );

  return (
    <div className="mt-5 w-full flex flex-col gap-y-4 ">
      <h2 className="text-lg md:text-xl lg:text-4xl font-semibold text-slate-800 dark:text-slate-200">
        {" "}
        {question.title}{" "}
      </h2>
      <div className="w-full flex flex-col gap-y-3 min-h-[300px]">
        {question.options.map((option: TQuestionOption) => (
          <div
            key={option._id}
            className={`
              rounded-md w-full px-4 py-5 border border-input text-slate-700 dark:text-slate-300
                cursor-pointer transition-all duration-300 ease-in-out
                hover:scale-105 hover:bg-blue-950 hover:text-slate-50

              ${
                alreadyAnsweredQuestion?.userAnswer === option.title
                  ? "bg-blue-950 scale-105"
                  : ""
              }
            `}
            onClick={() =>
              dispatch({
                type: QuizState.ANSWER,
                payload: {
                  questionIndex: quizState.currentQuestionIndex,
                  userAnswer: option.title,
                },
              })
            }
          >
            {option.title}
          </div>
        ))}
      </div>
      <div className="rounded-full w-full flex items-center justify-between">
        <Button
          onClick={() => dispatch({ type: QuizState.PREVIOUS_QUESTION })}
          disabled={quizState.currentQuestionIndex === 0}
          className="md:hidden w-10 h-10 rounded-full"
        >
          <ArrowLeft className="flex-shrink-0" />
        </Button>
        <Button
          onClick={() => dispatch({ type: QuizState.PREVIOUS_QUESTION })}
          size={"lg"}
          disabled={quizState.currentQuestionIndex === 0}
          className="hidden md:block"
        >
          Previous
        </Button>
        <Button
          size={"lg"}
          className="bg-black text-slate-50 font-bold pointer-events-none px-10 text-lg flex items-center gap-x-4 rounded-full md:rounded-md border border-input"
        >
          <Clock />
          <span className="tracking-widest">
            {convertSecondsToTime(quizState.timer)}
          </span>{" "}
        </Button>

        <Button
          disabled={
            quizState.currentQuestionIndex ===
              quizState.quiz.questions.length - 1 ||
            quizState.state === QuizState.FINISHED
          }
          onClick={() => dispatch({ type: QuizState.NEXT_QUESTION })}
          className="bg-[#FF782D] hover:bg-[#FF782D] text-slate-50  w-10 h-10 rounded-full md:hidden"
        >
          <ArrowRight className="flex-shrink-0" />
        </Button>
        <div className="flex gap-x-2 items-center">
          <Button
            disabled={
              quizState.currentQuestionIndex ===
                quizState.quiz.questions.length - 1 ||
              quizState.state === QuizState.FINISHED
            }
            onClick={() => dispatch({ type: QuizState.NEXT_QUESTION })}
            size={"lg"}
            className="bg-[#FF782D] hover:bg-[#FF782D] text-slate-50 px-6 hidden md:block"
          >
            Next
          </Button>
          {quizState.userAnswers.length === quizState.quiz.questions.length ? (
            <Button
              onClick={() => dispatch({ type: QuizState.FINISHED })}
              size={"lg"}
              className="bg-[#FF782D] hover:bg-[#FF782D] text-slate-50 px-6 hidden md:block"
            >
              Finish
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Question;
