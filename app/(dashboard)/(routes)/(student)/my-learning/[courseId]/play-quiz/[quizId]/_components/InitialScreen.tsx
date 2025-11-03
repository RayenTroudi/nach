"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TQuiz, TUser } from "@/types/models.types";
import { CheckCircleIcon, Clock, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import Questions from "./Questions";
import { QuizState, useQuiz } from "@/contexts/QuizProvider";
import ResultScreen from "./ResultScreen";

type Props = {
  quiz: TQuiz;
  student: TUser;
};

const InitialScreen = ({ quiz, student }: Props) => {
  const { quizState, dispatch } = useQuiz();

  const router = useRouter();

  useEffect(() => {
    dispatch({ type: QuizState.READY, payload: quiz });
  }, []);

  return (
    <div className="w-full">
      <div className="w-full md:w-[800px] lg:w-[1200px] mx-auto p-4 flex flex-col gap-y-6">
        {quizState.state === QuizState.READY ? (
          <>
            <div className="w-full flex justify-between items-center">
              <div className="w-full md:w-1/2 flex flex-col gap-y-2 md:flex-row gap-x-2 md:items-center">
                <Avatar className="w-full md:w-[80px] h-[130px] md:h-[80px] rounded-lg border-muted border">
                  <AvatarImage
                    className="w-full md:w-[80px] h-[130px] md:h-[80px] rounded-lg "
                    src={quiz.sectionId.course.thumbnail!}
                    alt="course-thumbnail"
                  />
                  <AvatarFallback className="w-full md:w-[80px] h-[130px] md:h-[80px] rounded-lg ">
                    <Skeleton className="w-full md:w-[80px] h-[130px] md:h-[80px] rounded-lg " />
                  </AvatarFallback>
                </Avatar>
                <div className="pl-2 md:pl-0 h-full flex flex-col gap-y-3 justify-between ">
                  <p className="text-slate-700 dark:text-slate-200 text-lg font-bold">
                    Course : {quiz.sectionId.course.title}
                  </p>
                  <span className="text-md font-semibold text-slate-500 dark:text-slate-400">
                    Section : {quiz.sectionId.title}
                  </span>
                  <div className="flex md:hidden h-full  flex-col gap-y-2 sm:gap-y-0 sm:flex-row sm:items-center sm:gap-x-2">
                    {!quiz.passedUsers?.length ? (
                      <p className="text-md font-semibold flex items-center gap-x-2 text-slate-400 dark:text-slate-500 capitalize">
                        <Info className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                        <span>No one passed this quiz</span>
                      </p>
                    ) : (
                      <p className="text-md font-semibold flex items-center gap-x-2 text-slate-400 dark:text-slate-500 capitalize">
                        <CheckCircleIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                        <span>
                          {" "}
                          {quiz.passedUsers?.length} students passed this quiz
                        </span>
                      </p>
                    )}

                    <p className="text-md font-semibold flex items-center gap-x-2 text-slate-400 dark:text-slate-500 capitalize">
                      <Clock className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                      <span> {quiz.time / (60 * 1000)} Minutes time to solve</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-full flex-1 hidden md:flex h-full flex-col gap-y-2 md:items-end">
                {!quiz.passedUsers?.length ? (
                  <p className="text-md font-semibold flex items-center gap-x-2 text-slate-400 dark:text-slate-500 capitalize">
                    <Info className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    <span>No one passed this quiz</span>
                  </p>
                ) : (
                  <p className="text-md font-semibold flex items-center gap-x-2 text-slate-400 dark:text-slate-500 capitalize">
                    <CheckCircleIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    <span>
                      {" "}
                      {quiz.passedUsers?.length} students passed this quiz
                    </span>
                  </p>
                )}

                <p className="text-md font-semibold flex items-center gap-x-2 text-slate-400 dark:text-slate-500 capitalize">
                  <Clock className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                  <span> {quiz.time / 60} Minutes to solve</span>
                </p>
              </div>
            </div>
            <div className="w-full p-2  border-t flex flex-col gap-y-4 items-center justify-center">
              <h1 className="text-lg md:text-2xl lg:text-4xl font-bold uppercase text-center  text-slate-950 dark:text-slate-50 mt-5">
                Let&apos;s go and try to solve the quiz on your own
              </h1>
              <p className="text-sm md:text-md lg:text-lg font-semibold text-center text-slate-700 dark:text-slate-300">
                You have {quiz.time  / 60} minutes to solve the quiz, it contains{" "}
                {quiz.questions.length} questions.
              </p>

              <span className="w-full md:w-1/2 mx-auto text-xs md:text-sm lg:text-md font-normal text-center text-slate-500 dark:text-slate-400">
                Solving all the course quizzes will help you to better
                understand the course, also without solving them you can&apos;t
                get your certificate
              </span>
              <div className="w-full md:w-1/2 mx-auto mt-8 flex flex-col gap-y-4">
                {quiz.passedUsers?.length &&
                quiz.passedUsers?.find((user) => user._id === student._id) ? (
                  <p className="w-full mx-auto text-slate-800 dark:text-slate-200 text-xl md:text-2xl lg: lg:text-4xl uppercase font-semibold text-center">
                    You already passed this quiz before
                  </p>
                ) : (
                  <Button
                    onClick={() => dispatch({ type: QuizState.STARTED })}
                    className="w-full  uppercase font-bold text-slate-50 bg-[#FF782D] hover:bg-[#FF782D] opacity-90 hover:opacity-100 transition-all duration-300 ease-in-out"
                  >
                    {" "}
                    Start Solving{" "}
                  </Button>
                )}
                <Button
                  onClick={() => router.back()}
                  className="w-full  uppercase font-bold transition-all duration-300 ease-in-out"
                >
                  {" "}
                  Go Back{" "}
                </Button>
              </div>
            </div>
          </>
        ) : null}

        {quizState.state === QuizState.STARTED ? (
          <Questions quiz={quizState.quiz} student={student} />
        ) : null}

        {quizState.state === QuizState.FINISHED ? (
          <ResultScreen student={student} quiz={quiz} />
        ) : null}
      </div>
    </div>
  );
};

export default InitialScreen;
