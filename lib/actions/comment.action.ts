"use server";
import Comment from "../models/comment.model";
import { CreateCommentParams } from "@/types/shared.types";
import { connectToDatabase } from "../mongoose";
import { getUserEnrolledCourseById } from "./user.action";
import {
  isCourseOwner,
  pullCommentFromCourse,
  pushCommentToCourse,
} from "./course.action";
import { revalidatePath } from "next/cache";
import { deleteCommentReplies } from "./reply.action";
import { TComment } from "@/types/models.types";

export const createComment = async (params: CreateCommentParams) => {
  try {
    const { title, content, userId, courseId, path } = params;

    await connectToDatabase();

    const res = await getUserEnrolledCourseById({ courseId });
    const isOwner = await isCourseOwner(courseId, userId);

    if (!res && !isOwner) {
      throw new Error("You are not allowed to comment on this course");
    }

    const comment = await Comment.create({
      title,
      content,
      user: userId,
      courseId,
    });

    await pushCommentToCourse(comment._id, courseId);

    revalidatePath(path);

    return JSON.parse(JSON.stringify(comment));
  } catch (error: any) {
    console.log("CREATE COMMENT ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const deleteCommentById = async (commentId: string, path: string) => {
  try {
    await connectToDatabase();

    const comment = await Comment.findByIdAndDelete(commentId);

    if (!comment) {
      throw new Error("Comment not found");
    }

    await pullCommentFromCourse(commentId, comment.courseId);

    revalidatePath(path);

    return JSON.parse(JSON.stringify(comment));
  } catch (error: any) {
    console.log("DELETE COMMENT ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const pushReplyToComment = async (
  commentId: string,
  replyId: string
) => {
  try {
    await connectToDatabase();
    const comment = await Comment.findByIdAndUpdate(commentId, {
      $push: { replies: replyId },
    });

    return JSON.parse(JSON.stringify(comment));
  } catch (error: any) {
    console.log("PUSH REPLY TO COMMENT ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const deleteUserComments = async (userId: string) => {
  try {
    await connectToDatabase();
    const comments = await Comment.find({ user: userId }).populate("course");

    await Comment.deleteMany({ user: userId });

    comments.forEach(async (comment) => {
      await pullCommentFromCourse(comment._id, comment.course._id);
      await deleteCommentReplies(comment._id);
    });
  } catch (error: any) {
    console.log("DELETE USER COMMENTS ERROR: ", error.message);
    throw new Error(error.message);
  }
};
