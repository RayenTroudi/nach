"use server";

import { ReplyToCommentParams } from "@/types/shared.types";
import { connectToDatabase } from "../mongoose";
import Reply from "../models/reply.model";
import { pushReplyToComment } from "./comment.action";
import { revalidatePath } from "next/cache";

export const replyToComment = async (params: ReplyToCommentParams) => {
  try {
    const { title, content, ownerId, commentId, path } = params;
    await connectToDatabase();

    const reply = await Reply.create({
      title,
      content,
      owner: ownerId,
      comment: commentId,
    });

    const populatedReply = await Reply.findById(reply._id)
      .populate("owner")
      .populate("comment");

    await pushReplyToComment(commentId, reply._id);

    revalidatePath(path);

    return JSON.parse(JSON.stringify(populatedReply));
  } catch (error: any) {}
};

export const deleteCommentReplies = async (commentId: string) => {
  try {
    await connectToDatabase();

    await Reply.deleteMany({ comment: commentId });
  } catch (error: any) {
    console.log("ERROR : ", error.message);
  }
};
