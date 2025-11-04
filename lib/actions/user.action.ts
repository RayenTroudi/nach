"use server";
import { TUser } from "./../../types/models.types.d";
import mongoose from "mongoose";
import User from "../models/user.model";
import { connectToDatabase } from "../mongoose";
import Attachment from "../models/attachment.model";
import Course from "../models/course.model";
import {
  deleteUserCreatedCourses,
  pullStudentFromCourse,
} from "./course.action";
import {
  AddNewlyCreatedCourseToUserParams,
  CreateUserParams,
  DeleteUserParams,
  GetTeacherCourses,
  GetUserByClerkIdParams,
  GetUserEnrolledCourseById,
  PullCourseFromUser,
  PushEnrolledCourseToUser,
  UpdateUserParams,
} from "@/types/shared.types";
import { auth } from "@clerk/nextjs";
import { TCourse } from "@/types/models.types";
import { deleteUserPurchases } from "./purchase.action";
import { deleteUserComments } from "./comment.action";
import { pushStudentToChatRoom } from "./course-chat-room";
import CourseChatRoom from "../models/course-chat-room.model";
import ChatRoomMessage from "../models/chat-room-message.model";
import { TagType } from "../utils";
import { redirect } from "next/navigation";
// WithdrawTransaction model removed - Stripe-related

export const createUser = async (params: CreateUserParams) => {
  try {
    await connectToDatabase();
    
    console.log("Creating user with params:", params);
    
    const user = await User.create(params);
    
    console.log("User created successfully:", user);
    
    return JSON.parse(JSON.stringify(user));
  } catch (error: any) {
    console.error("Error in createUser:", error.message);
    throw new Error(`Failed to create user: ${error.message}`);
  }
};

export const updateUser = async (params: UpdateUserParams) => {
  const { clerkId, data } = params;
  try {
    connectToDatabase();
    const user = await User.findOneAndUpdate({ clerkId }, data, {
      new: true,
    });

    return JSON.parse(JSON.stringify(user));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const deleteUser = async (params: DeleteUserParams) => {
  // params contains the clerkId of the user to be deleted : params = {clerkId: "clerk_1234"}
  try {
    connectToDatabase();

    const user: TUser = await getUserByClerkId(params);

    await User.findByIdAndDelete(user._id);

    user.createdCourses?.length && (await deleteUserCreatedCourses(user._id));
    user.enrolledCourses?.length &&
      user.enrolledCourses.forEach(
        async (course: TCourse) =>
          await pullStudentFromCourse({
            courseId: course._id,
            studentId: user._id,
          })
      );

    await deleteUserPurchases(user._id);
    await deleteUserComments(user._id);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getUserByMongoDbId = async (_id: string) => {
  try {
    connectToDatabase();
    if (!mongoose.isValidObjectId(_id)) throw new Error("Invalid ID");

    // Removed WithdrawTransaction.find() - Stripe-related
    const user = await User.findById(_id)
      .populate({
        path: "createdCourses",
        populate: [
          // { path: "attachments", options: { sort: { createdAt: -1 } } },
          { path: "category" },
          { path: "instructor" },
        ],
        options: { sort: { createdAt: -1 } },
      })
      // Removed withdrawTransactions populate - Stripe-related
      .populate({
        path: "enrolledCourses",
        populate: [
          // { path: "attachments", options: { sort: { createdAt: -1 } } },
          { path: "category" },
        ],
        options: { sort: { createdAt: -1 } },
      });
    if (!user) throw new Error("User not found");
    return JSON.parse(JSON.stringify(user));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getUserByClerkId = async (params: GetUserByClerkIdParams) => {
  try {
    connectToDatabase();

    // Removed WithdrawTransaction.find() - Stripe-related
    await CourseChatRoom.find();
    await ChatRoomMessage.find();
    const user = await User.findOne({ clerkId: params.clerkId })
      .populate({
        path: "createdCourses",
        populate: [
          { path: "exam" },
          { path: "category" },
          { path: "feedbacks" },
          {
            path: "instructor",
          },
        ],
        options: { sort: { createdAt: -1 } },
      })
      // Removed withdrawTransactions populate - Stripe-related
      .populate({
        path: "enrolledCourses",
        model: "Course",
        populate: [
          { path: "feedbacks" },
          { path: "exam" },
          { path: "category", model: "Category" },
          {
            path: "instructor",
            populate: {
              path: "createdCourses",
            },
          },
        ],
        options: { sort: { createdAt: -1 } },
      })
      .populate({
        path: "joinedChatRooms",
        populate: [
          { path: "students", model: "User" },
          { path: "instructorAdmin", model: "User" },
          { path: "courseId", model: "Course" },
          {
            path: "messages",
            model: "ChatRoomMessage",
            populate: {
              path: "senderId",
              model: "User",
            },
          },
        ],
      })
      .populate({
        path: "ownChatRooms",
        populate: [
          { path: "students", model: "User" },
          { path: "instructorAdmin", model: "User" },
          {
            path: "courseId",
            model: "Course",
            populate: {
              path: "feedbacks",
              model: "Feedback",
            },
          },
          {
            path: "messages",
            model: "ChatRoomMessage",
            populate: {
              path: "senderId",
              model: "User",
            },
          },
        ],
      });

    return JSON.parse(JSON.stringify(user));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const addNewlyCreatedCourseToUser = async (
  params: AddNewlyCreatedCourseToUserParams
) => {
  const { userId, courseId } = params;
  try {
    connectToDatabase();
    await User.findByIdAndUpdate(userId, {
      $push: { createdCourses: courseId },
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getTeacherCourses = async (params: GetTeacherCourses) => {
  try {
    connectToDatabase();
    Attachment.find();
    const user = await getUserByClerkId(params);
    return JSON.parse(JSON.stringify(user));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getUserCreatedCourses = async (userId: string) => {
  try {
    await connectToDatabase();
    const courses = await Course.find({ instructor: userId })
      .populate("instructor")
      .populate("category")
      .populate({
        path: "students",
      });

    return JSON.parse(JSON.stringify(courses));
  } catch (error) {
    console.error("Error fetching user-created courses:", error);
    throw new Error("Failed to fetch user-created courses");
  }
};

export const pullCourseFromUser = async (params: PullCourseFromUser) => {
  try {
    connectToDatabase();
    const { userId, courseId } = params;
    await User.findByIdAndUpdate(userId, {
      $pull: { createdCourses: courseId },
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const pushEnrolledCourseToUser = async (
  params: PushEnrolledCourseToUser
) => {
  try {
    await connectToDatabase();

    const { userId, courseId } = params;

    await User.findByIdAndUpdate(userId, {
      $push: { enrolledCourses: courseId },
    });
  } catch (error: any) {
    console.log("Error in pushEnrolledCourseToUser: ", error.message);
    throw new Error(error.message);
  }
};

export const getUserEnrolledCourseById = async (
  params: GetUserEnrolledCourseById
) => {
  try {
    connectToDatabase();
    const { userId } = auth();

    if (!userId) return null;

    const user = await getUserByClerkId({ clerkId: userId });

    const { courseId } = params;
    const res = await User.findOne({
      _id: user._id,
      enrolledCourses: { $in: [courseId] },
    });

    return res;
  } catch (error: any) {
    console.log("Error in getUserEnrolledCourseById: ", error.message);
    throw new Error(error.message);
  }
};

export const alreadyEnrolled = async (courseId: string, studentId: string) => {
  try {
    await connectToDatabase();

    const user = await User.findById(studentId);
    if (!user) throw new Error("User not found");
    return user?.enrolledCourses?.includes(courseId);
  } catch (error: any) {
    console.log("ALREADY ENROLLED ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const pushOwnChatRoomToUser = async (
  userId: string,
  chatRoomId: string
) => {
  try {
    await connectToDatabase();
    await User.findByIdAndUpdate(userId, {
      $push: { ownChatRooms: chatRoomId },
    });
  } catch (error: any) {
    console.log("Error in pushOwnChatRoomToUser: ", error.message);
    throw new Error(error.message);
  }
};

export const joinChatRoom = async (userId: string, chatRoomId: string) => {
  try {
    await connectToDatabase();
    await User.findByIdAndUpdate(userId, {
      $push: { joinedChatRooms: chatRoomId },
    });

    await pushStudentToChatRoom({ chatRoomId, studentId: userId });
  } catch (error: any) {
    console.log("Error in pushOwnChatRoomToUser: ", error.message);
    throw new Error(error.message);
  }
};

export const pussInterestsToUser = async (userId: string, tags: TagType[]) => {
  try {
    await connectToDatabase();
    const user = await User.findById(userId);

    if (!user) return redirect("/sign-in");

    tags.forEach((tag) => {
      user?.interests.includes(tag.value)
        ? null
        : user?.interests.push(tag.value);
    });

    await user?.save();
  } catch (error: any) {
    console.log("Error in pushOwnChatRoomToUser: ", error.message);
    throw new Error(error.message);
  }
};

export const depositToUserWallet = async (userId: string, amount: number) => {
  try {
    await connectToDatabase();

    const newAmount = amount * 0.1 - amount;

    console.log("newAmount: ", Math.abs(newAmount));

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { wallet: Math.abs(+newAmount.toFixed(2)) },
      },
      { new: true }
    );

    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error: any) {
    console.log("Error in depositToUserWallet: ", error.message);
    throw new Error(error.message);
  }
};

// Stripe-related functions removed - using Flouci payment gateway instead
// export const withdrawEarnings = async (...)
// export const connectUserToStripe = async (...)

export const getAllUsers = async () => {
  try {
    await connectToDatabase();

    const users = await User.find().lean();

    return JSON.parse(JSON.stringify(users));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getAllInstructorsWithTransactions = async () => {
  try {
    // const instructors: TUser[] = await User.aggregate([
    //   {
    //     $match: {
    //       createdCourses: { $exists: true, $not: { $size: 0 } }, // filter users who have created courses
    //       withdrawTransactions: { $not: { $size: 0 } }, // filter users who have withdrawal transactions
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "withdrawTransactions", // assuming this is the correct collection name
    //       localField: "_id",
    //       foreignField: "user", // assuming this is the correct field name
    //       as: "withdrawTransactions",
    //     },
    //   },

    //   {
    //     $sort: { "withdrawTransactions.createdAt": -1 },
    //   },
    //   {
    //     $group: {
    //       _id: "$_id",
    //       firstName: { $first: "$firstName" },
    //       lastName: { $first: "$lastName" },
    //       username: { $first: "$username" },
    //       email: { $first: "$email" },
    //       picture: { $first: "$picture" },
    //       isAdmin: { $first: "$isAdmin" },
    //       wallet: { $first: "$wallet" },
    //       interests: { $first: "$interests" },
    //       createdCourses: { $first: "$createdCourses" },
    //       enrolledCourses: { $first: "$enrolledCourses" },
    //       ownChatRooms: { $first: "$ownChatRooms" },
    //       joinedChatRooms: { $first: "$joinedChatRooms" },
    //       withdrawTransactions: { $push: "$withdrawTransactions" },
    //     },
    //   },
    // ]);

    const users = await User.find().populate({
      path: "withdrawTransactions",
      model: "WithdrawTransaction",
    });

    const instructors = users.filter(
      (user) =>
        user.createdCourses.length > 0 && user.withdrawTransactions.length > 0
    );

    return JSON.parse(JSON.stringify(instructors));
  } catch (error: any) {
    console.log("Error in getAllInstructorsWithTransactions: ", error.message);
    throw new Error(error.message);
  }
};
export const updateUserDetails = async (params: UpdateUserParams) => {
  const { clerkId, data } = params;
  try {
    await connectToDatabase();

    const user = await User.findOneAndUpdate({ clerkId }, data, {
      new: true,
    });

    if (!user) {
      throw new Error("User not found");
    }

    return JSON.parse(JSON.stringify(user));
  } catch (error: any) {
    console.error("Error updating user details:", error);
    throw new Error(error.message);
  }
};
