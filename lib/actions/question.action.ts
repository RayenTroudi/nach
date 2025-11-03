"use server";

import { connectToDatabase } from "../mongoose";
import Question from "../models/question.model";
import {
  CreateQuestionParams,
  ToggleOptionToQuestionParams,
} from "@/types/shared.types";
import { revalidatePath } from "next/cache";
import { pullQuestionFromQuiz, pushQuestionToQuiz } from "./quiz.action";
import { deleteQuestionOptions } from "./question-option.action";
import { TQuestion } from "@/types/models.types";

export const createQuestion = async (params: CreateQuestionParams) => {
  try {
    await connectToDatabase();

    const { title, quizId, correctAnswer, path } = params;

    const newQuestion = await Question.create({
      title,
      correctAnswer,
      quizId,
    });

    await pushQuestionToQuiz({
      quizId,
      questionId: newQuestion._id,
      path,
    });

    revalidatePath(path);

    return JSON.parse(JSON.stringify(newQuestion));
  } catch (error: any) {
    console.log("Error in createQuestion: ", error.message);
    throw new Error(error.message);
  }
};

export const deleteQuestion = async (questionId: string) => {
  try {
    await connectToDatabase();

    const deletedQuestion = await Question.findById(questionId)
      .populate("options")
      .populate("quizId");

    await pullQuestionFromQuiz({
      quizId: deletedQuestion.quizId._id,
      questionId,
    });

    await deleteQuestionOptions(questionId);

    await Question.deleteOne({ _id: questionId });
  } catch (error: any) {
    console.log("Error in deleteQuestion: ", error.message);
    throw new Error(error.message);
  }
};

export const pushOptionToQuestion = async (
  params: ToggleOptionToQuestionParams
) => {
  try {
    await connectToDatabase();

    const { questionId, optionId, path } = params;

    const question = await Question.findByIdAndUpdate(
      questionId,
      { $push: { options: optionId } },
      { new: true }
    );

    revalidatePath(path);
  } catch (error: any) {
    console.log("Error in pushOptionToQuestion: ", error.message);
    throw new Error(error.message);
  }
};

export const pullOptionFromQuestion = async (
  params: ToggleOptionToQuestionParams
) => {
  try {
    await connectToDatabase();

    const { questionId, optionId, path } = params;

    const question = await Question.findByIdAndUpdate(
      questionId,
      { $pull: { options: optionId } },
      { new: true }
    );

    revalidatePath(path);
  } catch (error: any) {
    console.log("Error in pullOptionFromQuestion: ", error.message);
    throw new Error(error.message);
  }
};

export const deleteQuizQuestions = async (quizId: string) => {
  try {
    await connectToDatabase();

    const allQuestions = await Question.find({ quizId });
    await Question.deleteMany({ quizId });

    allQuestions.forEach(
      async (question: TQuestion) => await deleteQuestionOptions(question._id)
    );
  } catch (error: any) {
    console.log("Error in deleteQuizQuestions: ", error.message);
    throw new Error(error.message);
  }
};

export const isTheCorrectAnswer = async (
  questionId: string,
  optionText: string
) => {
  try {
    await connectToDatabase();

    const question = await Question.findById(questionId);

    return (
      question.correctAnswer.trim().toLowerCase() ===
      optionText.trim().toLowerCase()
    );
  } catch (error: any) {
    console.log("Error in isTheCorrectAnswer: ", error.message);
    throw new Error(error.message);
  }
};

export const updateCorrectAnswer = async (
  questionId: string,
  correctAnswer: string
) => {
  try {
    await connectToDatabase();

    await Question.findByIdAndUpdate(questionId, { correctAnswer });
  } catch (error: any) {
    console.log("Error in updateCorrectAnswer: ", error.message);
    throw new Error(error.message);
  }
};

export const updateQuestion = async (params: {
  questionId: string;
  data: { title: string };
  path: string;
}) => {
  try {
    await connectToDatabase();

    const { questionId, data, path } = params;

    await Question.findByIdAndUpdate(questionId, data);
    revalidatePath(path);
  } catch (error: any) {
    console.log("Error in updateQuestion: ", error.message);
    throw new Error(error.message);
  }
};
