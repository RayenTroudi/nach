"use server";
import {
  GetUserCourseProgressParams,
  StartTrackUserCourseProgressParams,
} from "@/types/shared.types";
import { connectToDatabase } from "../mongoose";
import UserProgress from "../models/userprogress.model";

export const startTrackUserCourseProgress = async (
  params: StartTrackUserCourseProgressParams
) => {
  try {
    await connectToDatabase();
    const userProgress = await UserProgress.create(params);

    return JSON.parse(JSON.stringify(userProgress));
  } catch (error: any) {
    console.log("startTrackUserCourseProgress : ", error.message);
    throw new Error(error.message);
  }
};

export const getUserCourseProgress = async (
  params: GetUserCourseProgressParams
) => {
  try {
    await connectToDatabase();

    const userProgress = await UserProgress.findOne({
      userId: params.userId,
      courseId: params.courseId,
    })
      .populate("courseId")
      .populate("userId");

    return JSON.parse(JSON.stringify(userProgress));
  } catch (error: any) {
    console.log("getUserCourseProgress : ", error.message);
    throw new Error(error.message);
  }
};

export const updateUserCourseProgress = async (params: {
  userId: string;
  courseId: string;
  progress: number;
  isCompleted: boolean;
}) => {
  try {
    await connectToDatabase();

    console.log(
      "updateUserCourseProgress : ",
      params.userId,
      params.courseId,
      params.progress,
      params.isCompleted
    );

    const userProgress = await UserProgress.findOneAndUpdate(
      {
        userId: params.userId,
        courseId: params.courseId,
      },
      {
        progress: params.progress,
        isCompleted: params.isCompleted,
      },
      { new: true }
    );

    console.log(userProgress);
    return JSON.parse(JSON.stringify(userProgress));
  } catch (error: any) {
    console.log("updateUserCourseProgress : ", error.message);
    throw new Error(error.message);
  }
};
