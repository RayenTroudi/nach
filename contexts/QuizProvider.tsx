"use client";

import { TQuiz } from "@/types/models.types";
import { createContext, useContext, useReducer } from "react";

export enum QuizState {
  LOADING = "quiz/loading",
  READY = "quiz/ready",
  STARTED = "quiz/started",
  FINISHED = "quiz/finished",
  ANSWER = "quiz/answer",
  NEXT_QUESTION = "quiz/next-question",
  PREVIOUS_QUESTION = "quiz/previous-question",
  RESTARTED = "quiz/restarted",
  COUNT_DOWN = "quiz/count-down",
  RESET = "quiz/reset",
}

type QuizContextType = {
  quizState: QuizInitialStateType;
  dispatch: React.Dispatch<Action>;
};

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export type UserAnswerType = {
  questionIndex: number;
  userAnswer: string;
};

type QuizInitialStateType = {
  quiz: TQuiz;
  currentQuestionIndex: number;
  userAnswers: UserAnswerType[];
  correctAnswers: number;
  timer: number;
  state: QuizState;
};

type Action = {
  type: QuizState;
  payload?: TQuiz | UserAnswerType;
};

const initialState: QuizInitialStateType = {
  quiz: {} as TQuiz,
  currentQuestionIndex: 0,
  userAnswers: [],
  correctAnswers: 0,
  timer: 300000,
  state: QuizState.READY,
};

const reducer = (
  state: QuizInitialStateType,
  action: Action
): QuizInitialStateType => {
  switch (action.type) {
    case QuizState.LOADING:
      return { ...state, state: QuizState.LOADING };
    case QuizState.READY:
      return {
        ...state,
        state: QuizState.READY,
        quiz: action.payload as TQuiz,
        timer: (action.payload as TQuiz).time,
      };
    case QuizState.STARTED:
      return { ...state, state: QuizState.STARTED };
    case QuizState.FINISHED:
      return { ...state, state: QuizState.FINISHED };
    case QuizState.ANSWER:
      const convertedPayload = action.payload as UserAnswerType;
      const alreadyAnsweredQuestion = state.userAnswers.find(
        (answer) => answer.questionIndex === convertedPayload.questionIndex
      );

      return {
        ...state,
        userAnswers: alreadyAnsweredQuestion
          ? state.userAnswers.map((answer) =>
              answer.questionIndex === alreadyAnsweredQuestion.questionIndex
                ? { ...answer, userAnswer: convertedPayload.userAnswer }
                : answer
            )
          : [...state.userAnswers, convertedPayload],
      };

    case QuizState.RESET:
      return initialState;

    case QuizState.NEXT_QUESTION:
      return {
        ...state,
        currentQuestionIndex: state.currentQuestionIndex + 1,
      };

    case QuizState.PREVIOUS_QUESTION:
      if (state.currentQuestionIndex === 0) {
        return state;
      }
      return {
        ...state,
        currentQuestionIndex: state.currentQuestionIndex - 1,
      };

    case QuizState.COUNT_DOWN:
      if (state.timer === 0) {
        return { ...state, state: QuizState.FINISHED };
      }
      return { ...state, timer: state.timer - 1 };

    case QuizState.RESTARTED:
      return { ...initialState, quiz: action.payload as TQuiz };

    default:
      return initialState;
  }
};

const QuizProvider = ({ children }: { children: React.ReactNode }) => {
  const [quizState, dispatch] = useReducer(reducer, initialState);

  return (
    <QuizContext.Provider
      value={{
        quizState,
        dispatch,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error("useQuizContext must be used within a QuizProvider");
  }
  return context;
};

export { QuizProvider, useQuiz };
