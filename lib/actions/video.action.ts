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
import Section from "../models/section.model";
import Course from "../models/course.model";
import User from "../models/user.model";
import MuxData from "../models/muxdata.model";
import { revalidatePath } from "next/cache";
import { getCourseById } from "./course.action";
import { pullVideoFromSection } from "./section.action";
import UserProgress from "../models/userprogress.model";
import { deleteFileFromUploadThing } from "../utils/uploadthing-manager";
import { deleteMuxAsset } from "../mux";

export const getVideoById = async (videoId: string) => {
  try {
    await connectToDatabase();
    if (!mongoose.isValidObjectId(videoId)) throw new Error("Invalid ID");
    
    // Ensure models are registered
    await UserProgress.find();
    await Section.find();
    await Course.find();
    await User.find();
    
    const video = await Video.findById(videoId)
      .populate({
        path: "sectionId",
        model: "Section",
        populate: {
          path: "course",
          model: "Course",
          populate: {
            path: "instructor",
            model: "User",
          },
        },
      })
      .populate("muxData")
      .populate("userProgress");

    if (!video) {
      throw new Error("Video not found");
    }

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

    // Get video before deleting to retrieve resources
    const video = await Video.findById(videoId).populate('muxData');
    
    if (video) {
      // Delete Mux asset if it exists
      if (video.muxData?.assetId) {
        console.log('[Delete Video] Removing Mux asset:', video.muxData.assetId);
        try {
          await deleteMuxAsset(video.muxData.assetId);
          await MuxData.findByIdAndDelete(video.muxData._id);
        } catch (error) {
          console.error('[Delete Video] Failed to delete Mux asset:', error);
          // Continue with deletion even if Mux fails
        }
      }

      // Delete video file from UploadThing if it exists (for legacy videos)
      if (video.videoUrl && video.videoUrl.includes('utfs.io')) {
        console.log('[Delete Video] Removing file from UploadThing:', video.videoUrl);
        try {
          await deleteFileFromUploadThing(video.videoUrl);
        } catch (error) {
          console.error('[Delete Video] Failed to delete from UploadThing:', error);
          // Continue with deletion even if UploadThing fails
        }
      }
    }

    // Delete video from database
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

    const video = await Video.findByIdAndUpdate(videoId, data, { new: true });

    revalidatePath(path);
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
    
    // Get all videos in the section before deleting
    const videos = await Video.find({ sectionId });
    
    // Delete video files from UploadThing
    if (videos && videos.length > 0) {
      console.log(`[Delete Videos Section] Removing ${videos.length} video files from UploadThing`);
      for (const video of videos) {
        if (video.videoUrl && video.videoUrl.includes('utfs.io')) {
          await deleteFileFromUploadThing(video.videoUrl);
        }
      }
    }
    
    // Delete videos from database
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
    
    // Get all videos in the section before deleting
    const videos = await Video.find({ sectionId });
    
    // Delete video files from UploadThing
    if (videos && videos.length > 0) {
      console.log(`[Delete Section Videos] Removing ${videos.length} video files from UploadThing`);
      for (const video of videos) {
        if (video.videoUrl && video.videoUrl.includes('utfs.io')) {
          await deleteFileFromUploadThing(video.videoUrl);
        }
      }
    }
    
    // Delete videos from database
    await Video.deleteMany({ sectionId });
  } catch (error: any) {
    console.log("DELETE SECTION VIDEOS ERROR: ", error.message);
    throw new Error(error.message);
  }
};
