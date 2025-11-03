"use server";

import { CreateQuestionOptionParams } from "@/types/shared.types";
import QuestionOption from "../models/question-option.model";
import { connectToDatabase } from "../mongoose";
import { revalidatePath } from "next/cache";
import {
  isTheCorrectAnswer,
  pullOptionFromQuestion,
  pushOptionToQuestion,
  updateCorrectAnswer,
} from "./question.action";

export const createQuestionOption = async (
  params: CreateQuestionOptionParams
) => {
  try {
    await connectToDatabase();

    const { title, questionId, path } = params;

    const newOption = await QuestionOption.create({
      title,
      questionId,
    });

    await pushOptionToQuestion({
      questionId,
      optionId: newOption._id,
      path,
    });

    revalidatePath(path);

    return JSON.parse(JSON.stringify(newOption));
  } catch (error: any) {
    console.log("Error in createQuestion: ", error.message);
    throw new Error(error.message);
  }
};

export const deleteOption = async (optionId: string, path: string) => {
  try {
    await connectToDatabase();

    const deletedOption = await QuestionOption.findById(optionId).populate(
      "questionId"
    );

    await pullOptionFromQuestion({
      questionId: deletedOption.questionId._id,
      optionId,
      path,
    });

    await QuestionOption.deleteOne({ _id: optionId });

    revalidatePath(path);
  } catch (error: any) {
    console.log("Error in deleteOption: ", error.message);
    throw new Error(error.message);
  }
};

export const deleteQuestionOptions = async (questionId: string) => {
  try {
    await connectToDatabase();

    await QuestionOption.deleteMany({ questionId });
  } catch (error: any) {
    console.log("Error in deleteQuestionOptions: ", error.message);
    throw new Error(error.message);
  }
};

export const updateOption = async (params: {
  optionId: string;
  title: string;
  path: string;
}) => {
  try {
    await connectToDatabase();

    const { optionId, title, path } = params;

    const fetchedOption = await QuestionOption.findById(optionId).populate(
      "questionId"
    );

    if (
      await isTheCorrectAnswer(
        fetchedOption.questionId._id,
        fetchedOption.title
      )
    ) {
      await updateCorrectAnswer(fetchedOption.questionId._id, title);
    }

    await QuestionOption.findByIdAndUpdate(optionId, { title });

    revalidatePath(path);
  } catch (error: any) {
    console.log("Error in updateOption: ", error.message);
    throw new Error(error.message);
  }
};
