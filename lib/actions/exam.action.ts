"use server";
import { EditExamParams, RemoveExamParams } from "@/types/shared.types";
import Exam from "../models/exam.model";
import { connectToDatabase } from "../mongoose";
import {
  addCourseExam,
  getCourseById,
  removeCourseExam,
} from "./course.action";
import { revalidatePath } from "next/cache";

export const getExamById = async (examId: string) => {
  try {
    await connectToDatabase();
    const exam = await Exam.findById(examId)
      .populate("course")
      .populate("passedUsers");

    if (!exam) throw new Error("Exam not found");
    return JSON.parse(JSON.stringify(exam));
  } catch (error: any) {
    console.log("GET EXAM BY ID ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const getAllExams = async () => {
  try {
    await connectToDatabase();
    const exams = await Exam.find().populate("course").populate("passedUsers");

    return JSON.parse(JSON.stringify(exams));
  } catch (error: any) {
    console.log("GET ALL EXAMS ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const getCourseExams = async (courseId: string) => {
  try {
    await connectToDatabase();
    const exams = await Exam.find({ courseId })
      .populate("course")
      .populate("passedUsers");

    return JSON.parse(JSON.stringify(exams));
  } catch (error: any) {
    console.log("GET COURSE EXAMS ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const editExam = async (params: EditExamParams) => {
  try {
    await connectToDatabase();

    const { courseId, instructorId, examId, data, path } = params;
    const course = await getCourseById({ courseId });

    if (course?.instructor?._id.toString() !== instructorId.toString())
      throw new Error("Unauthorized, this course does not belong to you.");

    let exam = null;

    console.log(examId === null);

    if (!examId) {
      console.log("CREATING", data, examId);
      exam = await Exam.create(data);
    } else {
      console.log("UPDATING", data, examId);
      exam = await Exam.findByIdAndUpdate(examId, data, { new: true });
    }
    await addCourseExam({ courseId, examId: exam._id, path });

    revalidatePath(path);
  } catch (error: any) {
    console.log("CREATE EXAM ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const removeExam = async (params: RemoveExamParams) => {
  try {
    await connectToDatabase();

    const { courseId, instructorId, examId, path } = params;

    const course = await getCourseById({ courseId });

    if (course?.instructor?._id.toString() !== instructorId.toString())
      throw new Error("Unauthorized, this course does not belong to you.");

    await Exam.findByIdAndDelete(examId);
    await removeCourseExam({ courseId, examId, path });

    revalidatePath(path);
  } catch (error: any) {
    console.log("REMOVE EXAM ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const deleteCourseExam = async (courseId: string) => {
  try {
    await connectToDatabase();
    await Exam.deleteOne({ courseId });
  } catch (error: any) {
    console.log("DELETE COURSE EXAMS ERROR: ", error.message);
    throw new Error(error.message);
  }
};
