"use server";

import Feedback from "../models/feedback.model";
import { connectToDatabase } from "../mongoose";
import { pushFeedbackToCourse } from "./course.action";

export const createFeedback = async (params: {
  user: string;
  course: string;
  rating: number;
  comment: string;
}) => {
  try {
    await connectToDatabase();
    const newFeedback = await Feedback.create(params);

    if (!newFeedback) {
      throw new Error("Feedback not created");
    }

    await pushFeedbackToCourse(newFeedback._id, params.course);

    return JSON.parse(JSON.stringify(newFeedback));
  } catch (error: any) {
    console.log("Create Feedback Error: ", error.message);
    throw new Error(error);
  }
};
