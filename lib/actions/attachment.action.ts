"use server";

import { auth } from "@clerk/nextjs";
import Attachment from "../models/attachment.model";
import { connectToDatabase } from "../mongoose";

import { getUserByClerkId } from "./user.action";
import mongoose from "mongoose";
import { CreateAttachmentParams, RemoveAttachment } from "@/types/shared.types";
import { revalidatePath } from "next/cache";
import {
  pullAttachmentFromSection,
  pushAttachmentToSection,
} from "./section.action";

export const createAttachment = async (params: CreateAttachmentParams) => {
  const { userId } = auth();
  const { courseId, instructorId, data, path } = params;
  try {
    connectToDatabase();

    const user = await getUserByClerkId({ clerkId: userId! });

    if (instructorId.toString() !== user._id.toString()) {
      throw new Error(
        "Unauthorized, you are not allowed to perform this action"
      );
    }

    const attachment = await Attachment.create(data);

    await pushAttachmentToSection({
      courseId,
      instructorId,
      sectionId: data.section,
      attachmentId: attachment._id,
      path,
    });

    revalidatePath(path);
    return JSON.parse(JSON.stringify(attachment));
  } catch (error: any) {
    console.log(error.message);
    throw new Error(error.message);
  }
};

export const removeAttachment = async (params: RemoveAttachment) => {
  const { userId } = auth();
  const { courseId, instructorId, attachmentId, sectionId, path } = params;
  try {
    connectToDatabase();

    const user = await getUserByClerkId({ clerkId: userId! });

    if (instructorId.toString() !== user._id.toString()) {
      throw new Error(
        "Unauthorized, you are not allowed to perform this action"
      );
    }
    if (!mongoose.isValidObjectId(attachmentId)) {
      throw new Error("Invalid attachment ID");
    }

    await Attachment.findByIdAndDelete(attachmentId);
    await pullAttachmentFromSection({
      courseId,
      instructorId,
      attachmentId,
      sectionId,
      path,
    });
    revalidatePath(path);
  } catch (error: any) {
    console.log(error.message);
    throw new Error(error.message);
  }
};

export const getAttachmentById = async (_id: string) => {
  try {
    connectToDatabase();
    if (!mongoose.isValidObjectId(_id)) {
      throw new Error("Invalid attachment id");
    }

    const attachment = await Attachment.findById(_id);
    return JSON.parse(JSON.stringify(attachment));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const deleteSectionAttachments = async (sectionId: string) => {
  try {
    await connectToDatabase();
    const attachments = await Attachment.deleteMany({ section: sectionId });
  } catch (error: any) {
    console.log("DELETE SECTION ATTACHMENTS ERROR: ", error.message);
    throw new Error(error.message);
  }
};
