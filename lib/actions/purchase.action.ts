"use server";

import { auth } from "@clerk/nextjs";
import { connectToDatabase } from "../mongoose";
import {
  alreadyEnrolled,
  depositToUserWallet,
  getUserByClerkId,
  joinChatRoom,
  pushEnrolledCourseToUser,
} from "./user.action";
import Purchase from "../models/purchase.model";

import { CreatePurchaseParams } from "@/types/shared.types";
import {
  getCourseById,
  pullPurchaseFromCourse,
  pushPurchaseToCourse,
  pushStudentToCourse,
} from "./course.action";
import { startTrackUserCourseProgress } from "./user-progress.action";
import { TCourse } from "@/types/models.types";
import { createPrivateChatRoom } from "./private-chat-room.action";
import { CourseTypeEnum } from "../enums";

export const createPurchase = async (params: CreatePurchaseParams) => {
  try {
    await connectToDatabase();

    // check if there is a purchase for the course by the user
    const exists = await Purchase.findOne({
      courseId: params.courseId,
      userId: params.userId,
    });

    if (exists) return;

    const purchase = await Purchase.create(params);

    await startTrackUserCourseProgress({
      userId: params.userId,
      courseId: params.courseId,
    });

    !(await alreadyEnrolled(params.courseId, params.userId)) &&
      (await pushEnrolledCourseToUser({
        courseId: params.courseId,
        userId: params.userId,
      }));

    await pushStudentToCourse({
      courseId: params.courseId,
      studentId: params.userId,
    });

    await pushPurchaseToCourse({
      courseId: params.courseId,
      purchaseId: purchase._id,
    });

    const course: TCourse = await getCourseById({ courseId: params.courseId });

    // Use the price directly from the database without conversion
    const amount = course?.price!;

    await depositToUserWallet(course.instructor._id, amount);

    // Create private chat room with instructor for regular courses
    if (course.courseType === CourseTypeEnum.Regular) {
      try {
        await createPrivateChatRoom({
          courseId: params.courseId,
          studentId: params.userId,
          instructorId: course.instructor._id,
        });
        console.log("Private chat room created for course purchase");
      } catch (chatError: any) {
        console.log("Warning: Failed to create private chat room:", chatError.message);
        // Don't fail the purchase if chat room creation fails
      }
    }

    return JSON.parse(JSON.stringify(purchase));
  } catch (error: any) {
    console.log("Error in createPurchase: ", error.message);
    throw new Error(error.message);
  }
};

export const studentCourseExists = async (courseId: string) => {
  try {
    await connectToDatabase();
    const { userId } = auth();
    if (!userId) throw new Error("You have login first to purchase a course");

    const user = await getUserByClerkId({ clerkId: userId! });

    if (!user) throw new Error("User not found");

    const purchase = await Purchase.findOne({ userId: user._id, courseId });

    return purchase !== null;
  } catch (error: any) {
    console.log("Error in studentCourseExists SERVER: ", error.message);
    throw new Error(error.message);
  }
};

export const deleteUserPurchases = async (userId: string) => {
  try {
    await connectToDatabase();
    const allPurchases = await Purchase.find({ userId });
    await Purchase.deleteMany({ userId });

    allPurchases.forEach(
      async (purchase) =>
        await pullPurchaseFromCourse(purchase._id, purchase.courseId)
    );
  } catch (error: any) {
    console.log("Error in deleteUserPurchases: ", error.message);
    throw new Error(error.message);
  }
};
