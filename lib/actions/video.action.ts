"use server";
import {
  CreateVideoParams,
  DeleteVideoParams,
  ReorderVideoParams,
  UpdateVideoParams,
} from "@/types/shared.types";
import { connectToDatabase } from "../mongoose";
import mongoose from "mongoose";
import Video from "../models/video.model";
import { revalidatePath } from "next/cache";
import { getCourseById } from "./course.action";
import { pullVideoFromSection } from "./section.action";
import UserProgress from "../models/userprogress.model";

export const getVideoById = async (videoId: string) => {
  try {
    await connectToDatabase();
    if (!mongoose.isValidObjectId(videoId)) throw new Error("Invalid ID");
    await UserProgress.find();
    const video = await Video.findById(videoId)
      .populate({
        path: "sectionId",
        populate: {
          path: "course",
          model: "Course",
          populate: {
            path: "instructor",
          },
        },
      })
      .populate("userProgress");

    return JSON.parse(JSON.stringify(video));
  } catch (error: any) {
    console.log("GET VIDEO BY ID ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const createVideo = async (params: CreateVideoParams) => {
  try {
    await connectToDatabase();
    const { sectionId, courseId, instructorId, title, path } = params;
    console.log("SECTION ID: ", sectionId);
    console.log("INSTRUCTOR ID: ", instructorId);
    console.log("COURSE ID: ", courseId);
    if (
      !mongoose.isValidObjectId(sectionId) ||
      !mongoose.isValidObjectId(courseId) ||
      !mongoose.isValidObjectId(instructorId)
    )
      throw new Error("Invalid Id");

    const videos = await Video.find({ sectionId });
    const newVideo = await Video.create({
      title,
      sectionId,
      position: videos.length + 1,
    });

    revalidatePath(path);
    return JSON.parse(JSON.stringify(newVideo));
  } catch (error: any) {
    console.log("CREATE VIDEO ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const deleteVideo = async (params: DeleteVideoParams) => {
  try {
    await connectToDatabase();
    const { courseId, instructorId, sectionId, videoId, path } = params;
    if (
      !mongoose.isValidObjectId(courseId) ||
      !mongoose.isValidObjectId(videoId)
    )
      throw new Error("Invalid ID");

    const course = await getCourseById({ courseId });
    if (!course) throw new Error("Course not found");
    if (course.instructor._id.toString() !== instructorId.toString())
      throw new Error("Unauthorized, this course does not belong to you.");

    await Video.findByIdAndDelete(videoId);
    await pullVideoFromSection({ sectionId, videoId, path });

    revalidatePath(path);
  } catch (error: any) {
    console.log("DELETE VIDEO ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const updateVideo = async (params: UpdateVideoParams) => {
  try {
    await connectToDatabase();
    const { videoId, courseId, instructorId, data, path } = params;
    if (!mongoose.isValidObjectId(videoId)) throw new Error("Invalid ID");
    const course = await getCourseById({ courseId });
    if (!course) throw new Error("Course not found");
    if (course.instructor._id.toString() !== instructorId.toString())
      throw new Error("Unauthorized, this course does not belong to you.");

    const video = await Video.findByIdAndUpdate(videoId, data);

    return JSON.parse(JSON.stringify(video));
  } catch (error: any) {
    console.log("UPDATE VIDEO ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const reorderVideo = async (params: ReorderVideoParams) => {
  try {
    await connectToDatabase();
    const { courseId, instructorId, videoId, newPosition, path } = params;
    if (!mongoose.isValidObjectId(courseId)) throw new Error("Invalid ID");
    if (!mongoose.isValidObjectId(videoId)) throw new Error("Invalid ID");
    const course = await getCourseById({ courseId });
    if (!course) throw new Error("Course not found");
    if (course.instructor._id.toString() !== instructorId.toString())
      throw new Error("Unauthorized, this course does not belong to you.");
    await Video.findByIdAndUpdate(videoId, { position: newPosition });
    revalidatePath(path);
  } catch (error: any) {
    console.log("REORDER VIDEO ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const deleteVideosSection = async (sectionId: string) => {
  try {
    await connectToDatabase();
    if (!mongoose.isValidObjectId(sectionId)) throw new Error("Invalid ID");
    await Video.deleteMany({ sectionId });
  } catch (error: any) {
    console.log("DELETE VIDEO SECTION ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const deleteSectionVideos = async (sectionId: string) => {
  try {
    await connectToDatabase();
    if (!mongoose.isValidObjectId(sectionId)) throw new Error("Invalid ID");
    await Video.deleteMany({ sectionId });
  } catch (error: any) {
    console.log("DELETE SECTION VIDEOS ERROR: ", error.message);
    throw new Error(error.message);
  }
};
