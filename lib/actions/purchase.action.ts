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
    console.log(`\n${"*".repeat(80)}`);
    console.log(`🛒 CREATE PURCHASE INITIATED`);
    console.log(`   Course ID: ${params.courseId}`);
    console.log(`   User ID: ${params.userId}`);
    
    await connectToDatabase();

    // check if there is a purchase for the course by the user
    const exists = await Purchase.findOne({
      courseId: params.courseId,
      userId: params.userId,
    });

    if (exists) {
      console.log(`⚠️ Purchase already exists. Skipping.`);
      console.log(`${"*".repeat(80)}\n`);
      return;
    }

    const purchase = await Purchase.create(params);
    console.log(`✅ Purchase record created in database`);

    await startTrackUserCourseProgress({
      userId: params.userId,
      courseId: params.courseId,
    });
    console.log(`✅ User progress tracking started`);

    !(await alreadyEnrolled(params.courseId, params.userId)) &&
      (await pushEnrolledCourseToUser({
        courseId: params.courseId,
        userId: params.userId,
      }));
    console.log(`✅ Course added to user's enrolled courses`);

    console.log(`\n📢 Calling pushStudentToCourse...`);
    await pushStudentToCourse({
      courseId: params.courseId,
      studentId: params.userId,
    });
    console.log(`✅ pushStudentToCourse completed\n`);

    await pushPurchaseToCourse({
      courseId: params.courseId,
      purchaseId: purchase._id,
    });

    const course: TCourse = await getCourseById({ courseId: params.courseId });
    console.log(`📚 Course details fetched: ${course.title}`);
    console.log(`   Course Type: ${course.courseType}`);

    // Use the price directly from the database without conversion
    const amount = course?.price!;

    await depositToUserWallet(course.instructor._id, amount);

    // For regular courses, create private chat room with instructor
    // Note: Group chat room is handled by pushStudentToCourse
    if (course.courseType === CourseTypeEnum.Regular) {
      console.log(`\n💬 Creating private chat room with instructor...`);
      try {
        const privateChatRoom = await createPrivateChatRoom({
          courseId: params.courseId,
          studentId: params.userId,
          instructorId: course.instructor._id,
        });
        console.log("✅ Private chat room created:", privateChatRoom._id);
      } catch (chatError: any) {
        console.error("❌ Failed to create private chat room:", chatError.message);
        // Don't fail the purchase if chat room creation fails
      }
    }

    console.log("\n✅✅✅ PURCHASE COMPLETED SUCCESSFULLY ✅✅✅");
    console.log(`${"*".repeat(80)}\n`);
    return JSON.parse(JSON.stringify(purchase));
  } catch (error: any) {
    console.error(`\n❌❌❌ PURCHASE FAILED ❌❌❌`);
    console.error("Error in createPurchase: ", error.message);
    console.error("Full stack:", error.stack);
    console.error(`${"*".repeat(80)}\n`);
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
