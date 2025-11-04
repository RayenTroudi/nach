"use server";
import {
  CreateSectionParams,
  ReorderSectionParams,
  ToggleAttachmentParams,
  ToggleVideoParams,
  UpdateSectionParams,
} from "@/types/shared.types";
import { getCourseById } from "./course.action";
import Section from "../models/section.model";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { connectToDatabase } from "../mongoose";
import Video from "../models/video.model";
import { deleteSectionVideos, deleteVideosSection } from "./video.action";
import Attachment from "../models/attachment.model";
import path from "path";
import { TSection } from "@/types/models.types";
import { deleteSectionAttachments } from "./attachment.action";

export const getSectionById = async (sectionId: string) => {
  try {
    await connectToDatabase();
    console.log(sectionId);
    if (!mongoose.isValidObjectId(sectionId)) throw new Error("Invalid ID");
    Video.find();
    Attachment.find();

    const section = await Section.findById(sectionId)
      .populate({
        path: "course",
        populate: [{ path: "instructor" }, { path: "category" }],
      })
      .populate({
        path: "attachments",
        options: { sort: { createdAt: -1 } },
      })
      .populate({
        path: "videos",
        options: { sort: { position: 1 } },
      });
    if (!section) throw new Error("Section not found");
    return JSON.parse(JSON.stringify(section));
  } catch (error: any) {
    console.log("GET SECTION BY ID ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const createSection = async (params: CreateSectionParams) => {
  try {
    await connectToDatabase();
    const { title, courseId, instructorId, path } = params;

    if (!mongoose.isValidObjectId(courseId)) throw new Error("Invalid ID");
    const course = await getCourseById({ courseId });
    if (!course) throw new Error("Course not found");
    if (course.instructor._id.toString() !== instructorId.toString())
      throw new Error("Unauthorized, this course does not belong to you.");

    const sections = await Section.find({ course: courseId });

    const newSection = await Section.create({
      title,
      course: courseId,
      position: sections.length + 1,
    });

    revalidatePath(path);
    return JSON.parse(JSON.stringify(newSection));
  } catch (error: any) {
    console.log("CREATE SECTION ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const updateSection = async (params: UpdateSectionParams) => {
  try {
    await connectToDatabase();
    const { sectionId, courseId, instructorId, data, path } = params;
    if (
      !mongoose.isValidObjectId(courseId) ||
      !mongoose.isValidObjectId(sectionId)
    )
      throw new Error("Invalid ID");
    const course = await getCourseById({ courseId });
    if (!course) throw new Error("Course not found");
    console.log(instructorId, course.instructor._id);
    if (course.instructor._id.toString() !== instructorId.toString())
      throw new Error("Unauthorized, this course does not belong to you.");
    const updatedSection = await Section.findByIdAndUpdate(sectionId, data, {
      new: true,
    });
    revalidatePath(path);
  } catch (error: any) {
    console.log("UPDATE SECTION ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const deleteSectionById = async (sectionId: string) => {
  try {
    await connectToDatabase();
    if (!mongoose.isValidObjectId(sectionId)) throw new Error("Invalid ID");

    const deletedSection = await Section.findByIdAndDelete(sectionId);

    await deleteVideosSection(sectionId);

    if (!deletedSection) throw new Error("Section not found");

    const sectionsToUpdate = await Section.find({
      course: deletedSection.course,
      position: { $gt: deletedSection.position },
    });

    await Section.updateMany(
      { _id: { $in: sectionsToUpdate.map((section) => section._id) } },
      { $inc: { position: -1 } }
    );

    return JSON.parse(JSON.stringify(deletedSection));
  } catch (error: any) {
    console.log("DELETE SECTION BY ID ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const reorderSection = async (params: ReorderSectionParams) => {
  try {
    await connectToDatabase();
    const { courseId, instructorId, sectionId, newPosition, path } = params;
    if (!mongoose.isValidObjectId(courseId)) throw new Error("Invalid ID");
    if (!mongoose.isValidObjectId(sectionId)) throw new Error("Invalid ID");
    const course = await getCourseById({ courseId });
    if (!course) throw new Error("Course not found");
    if (course.instructor._id.toString() !== instructorId.toString())
      throw new Error("Unauthorized, this course does not belong to you.");
    await Section.findByIdAndUpdate(sectionId, { position: newPosition });
    revalidatePath(path);
  } catch (error) {}
};

export const pushVideoToSection = async (params: ToggleVideoParams) => {
  try {
    await connectToDatabase();
    const { sectionId, videoId, path } = params;
    if (!mongoose.isValidObjectId(sectionId)) throw new Error("Invalid ID");

    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $push: { videos: videoId },
      }
    );

    revalidatePath(path);
    return JSON.parse(JSON.stringify(updatedSection));
  } catch (error: any) {
    console.log("PUSH VIDEO TO SECTION ERROR: ", error.message);
    throw new Error(error.message);
  }
};
export const pullVideoFromSection = async (params: ToggleVideoParams) => {
  try {
    await connectToDatabase();
    const { sectionId, videoId, path } = params;
    if (!mongoose.isValidObjectId(sectionId)) throw new Error("Invalid ID");

    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: { videos: videoId },
      }
    );

    revalidatePath(path);
    return JSON.parse(JSON.stringify(updatedSection));
  } catch (error: any) {
    console.log("PUSH VIDEO TO SECTION ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const deleteCourseSections = async (courseId: string) => {
  try {
    await connectToDatabase();
    if (!mongoose.isValidObjectId(courseId)) throw new Error("Invalid ID");

    const allSections = await Section.find({ course: courseId });
    await Section.deleteMany({ course: courseId });
    allSections.forEach(async (section: TSection) => {
      await deleteSectionVideos(section._id);
      await deleteSectionAttachments(section._id);
    });
  } catch (error: any) {
    console.log("DELETE COURSE SECTIONS ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const pushAttachmentToSection = async (
  params: ToggleAttachmentParams
) => {
  try {
    await connectToDatabase();

    const { courseId, instructorId, sectionId, attachmentId, path } = params;

    console.log("PARAMS : ", params);

    const course = await getCourseById({ courseId });

    if (!course) throw new Error("Course not found");

    if (course.instructor._id.toString() !== instructorId.toString())
      throw new Error("Unauthorized, this course does not belong to you.");

    if (!mongoose.isValidObjectId(sectionId)) throw new Error("Invalid ID");

    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $push: { attachments: attachmentId },
      }
    );

    revalidatePath(path);
    return JSON.parse(JSON.stringify(updatedSection));
  } catch (error: any) {
    console.log("PUSH ATTACHMENT TO SECTION ERROR: ", error.message);
    throw new Error(error.message);
  }
};
export const pullAttachmentFromSection = async (
  params: ToggleAttachmentParams
) => {
  try {
    await connectToDatabase();
    const { sectionId, attachmentId, path } = params;
    if (!mongoose.isValidObjectId(sectionId)) throw new Error("Invalid ID");

    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: { attachments: attachmentId },
      }
    );

    revalidatePath(path);
    return JSON.parse(JSON.stringify(updatedSection));
  } catch (error: any) {
    console.log("PULL ATTACHMENT FROM SECTION ERROR: ", error.message);
    throw new Error(error.message);
  }
};
