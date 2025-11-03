"use server";

import UserCourseVideoCompleted from "../models/user-course-video-completed.model";
import { connectToDatabase } from "../mongoose";
import { updateUserCourseProgress } from "./user-progress.action";

export const addCompletedCourseVideo = async (params: {
  userId: string;
  courseId: string;
  videoId: string;
  allVideos: number;
}) => {
  try {
    const { userId, courseId, videoId, allVideos } = params;
    await connectToDatabase();
    const userCourseVideoCompleted = await UserCourseVideoCompleted.create(
      params
    );
    const allUserCourseCompletedVideo = await UserCourseVideoCompleted.find({
      userId,
      courseId,
    });

    const progress = (allUserCourseCompletedVideo.length / allVideos) * 100;

    await updateUserCourseProgress({
      userId,
      courseId,
      progress,
      isCompleted: progress === 100,
    });

    return JSON.parse(JSON.stringify(userCourseVideoCompleted));
  } catch (error: any) {
    console.log("addCompletedCourseVideo : ", error.message);
    throw new Error(error.message);
  }
};

export const getUserCourseCompletedVideos = async (params: {
  courseId: string;
  userId: string;
}) => {
  try {
    await connectToDatabase();
    const userCourseVideoCompleted = await UserCourseVideoCompleted.find({
      courseId: params.courseId,
      userId: params.userId,
    })
      .populate("courseId")
      .populate("userId")
      .populate("videoId");
    return JSON.parse(JSON.stringify(userCourseVideoCompleted));
  } catch (error: any) {
    console.log("getCompletedUserCourseVideos : ", error.message);
    throw new Error(error.message);
  }
};

export const deleteCompletedCourseVideo = async (params: {
  userId: string;
  courseId: string;
  videoId: string;
  allVideos: number;
}) => {
  try {
    const { userId, courseId, videoId, allVideos } = params;
    await connectToDatabase();

    await UserCourseVideoCompleted.findOneAndDelete({
      userId: params.userId,
      courseId: params.courseId,
      videoId: params.videoId,
    });

    const allCompletedVideos = await UserCourseVideoCompleted.find({
      userId,
      courseId,
    });

    const progress = (allCompletedVideos.length / allVideos) * 100;

    await updateUserCourseProgress({
      userId,
      courseId,
      progress,
      isCompleted: progress === 100,
    });
  } catch (error: any) {
    console.log("deleteCompletedCourseVideo : ", error.message);
    throw new Error(error.message);
  }
};
