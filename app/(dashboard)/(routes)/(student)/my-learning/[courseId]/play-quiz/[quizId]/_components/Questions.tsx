"use client";
import { Progress } from "@/components/ui/progress";
import { QuizState, useQuiz } from "@/contexts/QuizProvider";
import { convertSecondsToTime } from "@/lib/utils";
import { TQuiz, TUser } from "@/types/models.types";
import { useEffect, useState } from "react";
import Question from "./Question";
// @ts-ignore
import { useSound } from "use-sound";
import { repeat } from "lodash";

type Props = {
  quiz: TQuiz;
  student: TUser;
};

const Questions = ({ quiz, student }: Props) => {
  const [play, { stop }] = useSound("/sounds/ticking.mp3");

  const { quizState, dispatch } = useQuiz();

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: QuizState.COUNT_DOWN });
    }, 1000);

    return () => clearInterval(interval);
  }, [quizState.timer, dispatch]);

  useEffect(() => {
    if (
      quizState.timer <= 15 &&
      quizState.userAnswers.length === quizState.quiz.questions.length
    ) {
      return stop();
    }
    if (quizState.timer === 0) {
      return stop();
    }
    if (quizState.timer === 15) {
      return play();
    }

    if (quizState.state === QuizState.FINISHED) {
      return stop();
    }
  }, [quizState.timer, play, stop, quizState.state, quizState.userAnswers]);

  return (
    <div className="w-full flex flex-col gap-y-4">
      <h1 className="text-center text-lg md:text-2xl lg:text-4xl uppercase font-bold">
        Go ahead and answer the questions, the timer is ticking
      </h1>
      {/* <span className="text-slate-500 font-semibold text-lg md:text-xl lg:text-2xl text-center uppercase"></span> */}
      <div className="mt-5 w-full flex flex-col gap-y-2">
        {/* <Progress
          value={quizState.userAnswers.length}
          max={quizState.quiz.questions.length}
          className="w-full rounded-md"
        /> */}

        <progress
          className="w-full progress"
          value={quizState.userAnswers.length}
          max={quizState.quiz.questions.length}
        />

        <div className="w-full flex items-center justify-between">
          <p className="flex items-center gap-x-2 font-semibold text-slate-500">
            <span>You Answered</span>
            <span className="text-[#FF782D]">
              {quizState.userAnswers.length}
            </span>{" "}
            / <span>{quizState.quiz.questions.length} Questions</span>{" "}
          </p>

          <p className="font-bold">{convertSecondsToTime(quizState.timer)}</p>
        </div>
      </div>
      <Question
        question={quizState.quiz.questions[quizState.currentQuestionIndex]}
      />
    </div>
  );
};

export default Questions;
