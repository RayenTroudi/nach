"use server";
import mongoose from "mongoose";
import { connectToDatabase } from "../mongoose";
import Quiz from "../models/Quiz.model";
import { CreateQuizParams } from "@/types/shared.types";
import { revalidatePath } from "next/cache";
import { registerQuizToSection } from "./section.action";
import { deleteQuizQuestions } from "./question.action";
import { pull } from "lodash";

export const getQuizById = async (quizId: string) => {
  try {
    await connectToDatabase();
    if (!mongoose.isValidObjectId(quizId)) throw new Error("Invalid Quiz id");
    // Fetch quiz by id
    const quiz = await Quiz.findById(quizId)
      .populate({
        path: "questions",
        populate: {
          path: "options",
        },
      })
      .populate({
        path: "sectionId",
        populate: {
          path: "course",
        },
      })
      .populate({
        path: "passedUsers",
        model: "User",
      });
    return JSON.parse(JSON.stringify(quiz));
  } catch (error: any) {
    console.log("Error in getQuizById: ", error.message);
    throw new Error(error.message);
  }
};

export const getSectionQuiz = async (sectionId: string) => {
  try {
    await connectToDatabase();
    if (!mongoose.isValidObjectId(sectionId))
      throw new Error("Invalid Section id");
    // Fetch quiz by id
    const quiz = await Quiz.findOne({ sectionId });

    return JSON.parse(JSON.stringify(quiz));
  } catch (error: any) {
    console.log("Error in getQuizById: ", error.message);
    throw new Error(error.message);
  }
};

export const createQuiz = async (params: CreateQuizParams) => {
  try {
    await connectToDatabase();

    const { title, sectionId, time, path } = params;

    const timeInMilliseconds = time * 60;

    const newQuiz = await Quiz.create({
      title,
      time: timeInMilliseconds,
      sectionId,
    });

    await registerQuizToSection({ sectionId, quizId: newQuiz._id, path });

    revalidatePath(path);

    return JSON.parse(JSON.stringify(newQuiz));
  } catch (error: any) {
    console.log("Error in createQuiz: ", error.message);
    throw new Error(error.message);
  }
};

export const pushQuestionToQuiz = async (params: {
  quizId: string;
  questionId: string;
  path: string;
}) => {
  try {
    await connectToDatabase();

    const { quizId, questionId, path } = params;

    const quiz = await Quiz.findByIdAndUpdate(
      { _id: quizId },
      {
        $push: { questions: questionId },
      }
    );

    revalidatePath(path);
  } catch (error: any) {
    console.log("Error in pushQuestionToQuiz: ", error.message);
    throw new Error(error.message);
  }
};

export const pullQuestionFromQuiz = async (params: {
  quizId: string;
  questionId: string;
}) => {
  try {
    await connectToDatabase();

    const { quizId, questionId } = params;

    const quiz = await Quiz.findByIdAndUpdate(
      { _id: quizId },
      {
        $pull: { questions: questionId },
      }
    );
  } catch (error: any) {
    console.log("Error in pullQuestionFromQuiz: ", error.message);
    throw new Error(error.message);
  }
};

export const deleteSectionQuiz = async (sectionId: string) => {
  try {
    await connectToDatabase();

    if (!mongoose.isValidObjectId(sectionId))
      throw new Error("Invalid Section id");

    const quiz = await Quiz.findOneAndDelete({ sectionId });

    deleteQuizQuestions(quiz._id);
  } catch (error: any) {
    console.log("Error in deleteSectionQuiz: ", error.message);
    throw new Error(error.message);
  }
};

export const pushPassedUser = async (quizId: string, userId: string) => {
  try {
    await connectToDatabase();

    if (!mongoose.isValidObjectId(quizId)) throw new Error("Invalid Quiz id");

    await Quiz.findByIdAndUpdate(
      { _id: quizId },
      {
        $push: { passedUsers: userId },
      }
    );
  } catch (error: any) {
    console.log("Error in pushPassedUser: ", error.message);
    throw new Error(error.message);
  }
};
