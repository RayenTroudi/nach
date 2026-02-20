"use server";
import { auth } from "@clerk/nextjs/server";
import Course from "../models/course.model";
import { CourseStatusEnum, CourseTypeEnum, CourseLevelEnum } from "../enums";
import Comment from "../models/comment.model";
import { connectToDatabase } from "../mongoose";
import {
  addNewlyCreatedCourseToUser,
  getUserByClerkId,
  joinChatRoom,
  pullCourseFromUser,
} from "./user.action";
import {
  addCourseToCategory,
  getCategoryIdsByName,
  removeCourseFromCategory,
} from "./category.action";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import {
  CreateCourseParams,
  DeleteCourseByIdParams,
  DeleteInstructorCoursesParams,
  GetCourseByIdParams,
  PublishCourseParams,
  ToggleStudentFromCourse,
  ToggleCourseExam,
  ToggleSectionFromCourse,
  UpdateCourseParams,
  UpdateCourseStatusParams,
} from "@/types/shared.types";
import Section from "../models/section.model";
import { deleteCourseSections } from "./section.action";
import Exam from "../models/exam.model";
import { addCourseCommentParams } from "@/types";
import Reply from "../models/reply.model";
import Video from "../models/video.model";
import { CourseState } from "@/app/(landing-page)/courses/[keywords]/_components/course-validator";
import { TCourse } from "@/types/models.types";
import { deleteCourseExam } from "./exam.action";
import MuxData from "../models/muxdata.model";
import {
  createCourseChatRoom,
  deleteCourseChatRooms,
} from "./course-chat-room";
import CourseChatRoom from "../models/course-chat-room.model";
import Purchase from "../models/purchase.model";
import Feedback from "../models/feedback.model";
import { deleteFileFromUploadThing } from "../utils/uploadthing-manager";

export const getCourseById = async (params: GetCourseByIdParams) => {
  try {
    await connectToDatabase();

    if (!mongoose.isValidObjectId(params.courseId))
      throw new Error("Invalid ID");

    Feedback.find();
    Section.find();
    Video.find();
    Exam.find();
    Comment.find();
    Reply.find();
    MuxData.find();
    let course = await Course.findById(params.courseId)
      .populate("instructor")
      .populate("category")
      .populate("students")
      .populate("purchases")
      .populate("faqVideoMuxData")
      .populate({
        path: "feedbacks",
        populate: [
          { path: "user", model: "User" },
          {
            path: "course",
            model: "Course",
          },
        ],
        options: { sort: { createdAt: -1 } },
      })
      .populate({
        path: "sections",
        populate: [
          { 
            path: "videos", 
            populate: [
              { path: "muxData" },
              { 
                path: "filePacks",
                model: "DocumentBundle",
                match: { isPublished: true }
              }
            ],
            options: { sort: { position: 1 } }
          },
          { path: "attachments" },
        ],
        options: { sort: { position: 1 } },
      })
      .populate("exam")
      .populate({
        path: "comments",
        populate: [
          { path: "user", model: "User" },

          {
            path: "replies",
            model: "Reply",
            populate: { path: "owner", model: "User" },
          },
        ],
        options: { sort: { createdAt: -1 } },
      })
      .lean();

    if (!course) throw new Error("Course not found");
    
    return JSON.parse(JSON.stringify(course));
  } catch (error: any) {
    console.log("GET COURSE BY ID ERROR FROM SERVER: ", error.message);
    throw new Error(error.message);
  }
};

export const createCourse = async (params: CreateCourseParams) => {
  try {
    connectToDatabase();

    const { userId } = auth();
    const user = await getUserByClerkId({ clerkId: userId! });

    const { courseTitle, courseCategory, courseType, path } = params;

    console.log("🎯 Creating course with type:", courseType);
    console.log("🎯 Is FAQ Course:", courseType === CourseTypeEnum.Most_Frequent_Questions);
    console.log("🎯 CourseTypeEnum values:", Object.values(CourseTypeEnum));

    // Validate courseType
    if (!Object.values(CourseTypeEnum).includes(courseType)) {
      throw new Error(`Invalid course type: ${courseType}`);
    }

    const courseData: any = {
      title: courseTitle,
      category: courseCategory,
      instructor: user._id,
      courseType: courseType, // Explicitly set courseType
      price: 0, // Always start at 0
    };

    console.log("📦 Course data to create:", JSON.stringify(courseData, null, 2));

    const newCourse = await Course.create(courseData);

    await addNewlyCreatedCourseToUser({
      userId: user._id,
      courseId: newCourse._id,
    });

    await addCourseToCategory({
      categoryId: courseCategory,
      courseId: newCourse._id,
      path,
    });

    // Only create chat rooms for regular courses
    if (courseType === CourseTypeEnum.Regular) {
      await createCourseChatRoom({
        courseId: newCourse._id,
        instructorId: user._id,
      });
    }

    revalidatePath(path);
    return JSON.parse(JSON.stringify(newCourse));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateCourse = async (params: UpdateCourseParams) => {
  const { courseId, instructorId, data, path } = params;
  const { userId } = auth();

  try {
    connectToDatabase();
    const user = await getUserByClerkId({ clerkId: userId! });
    if (user._id.toString() !== instructorId.toString())
      throw new Error("Unauthorized, this course does not belong to you.");
    if (!mongoose.isValidObjectId(courseId)) throw new Error("Invalid ID");

    console.log('[Update Course] Updating course with data:', data);

    // If updating faqVideo, delete old video from UploadThing first
    if (data.faqVideo) {
      const existingCourse = await Course.findById(courseId);
      if (existingCourse?.faqVideo && existingCourse.faqVideo !== data.faqVideo) {
        console.log('[Update Course] Removing old FAQ video from UploadThing:', existingCourse.faqVideo);
        try {
          await deleteFileFromUploadThing(existingCourse.faqVideo);
        } catch (error) {
          console.error('[Update Course] Failed to delete old FAQ video:', error);
        }
      }
    }

    const course = await Course.findByIdAndUpdate(
      courseId,
      { ...data, isPublished: false },
      {
        new: true,
        runValidators: true,
      }
    );

    console.log('[Update Course] Course updated. New currency:', course.currency, 'New price:', course.price);

    course.status =
      course.status === CourseStatusEnum.Draft
        ? course.status
        : CourseStatusEnum.Pending;

    await course.save();
    
    // Aggressively clear cache for all course-related paths
    revalidatePath(path, 'page');
    revalidatePath(`/course/${courseId}`, 'page');
    revalidatePath(`/en/course/${courseId}`, 'page');
    revalidatePath(`/de/course/${courseId}`, 'page');
    revalidatePath(`/ar/course/${courseId}`, 'page');
    revalidatePath(`/teacher/courses/manage/${courseId}`, 'page');
    
    // Revalidate landing page and courses listing pages
    revalidatePath('/', 'page');
    revalidatePath('/en', 'page');
    revalidatePath('/de', 'page');
    revalidatePath('/ar', 'page');
    revalidatePath('/courses', 'page');
    revalidatePath('/en/courses', 'page');
    revalidatePath('/de/courses', 'page');
    revalidatePath('/ar/courses', 'page');
    
    console.log('[Update Course] Cache revalidated for course:', courseId);
    
    return JSON.parse(JSON.stringify(course));
  } catch (error: any) {
    console.error('[Update Course] Error:', error);
    throw new Error(error.message);
  }
};

export const updateCourseStatus = async (params: UpdateCourseStatusParams) => {
  try {
    connectToDatabase();
    const { courseId, status, path } = params;
    console.log(courseId, status, path);
    const course = await Course.findByIdAndUpdate(courseId, {
      status: status,
    });

    revalidatePath(path);

    return JSON.parse(JSON.stringify(course));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const deleteCourseById = async (params: DeleteCourseByIdParams) => {
  const { courseId, path } = params;
  try {
    connectToDatabase();
    const course = await Course.findById(courseId);
    if (!course) throw new Error("Course not found");
    if (course.students.length)
      throw new Error(
        "We promise students lifetime access, so courses cannot be deleted after students have enrolled."
      );
    
    // Delete FAQ video from UploadThing if exists
    if (course.faqVideo) {
      console.log('[Delete Course] Removing FAQ video from UploadThing:', course.faqVideo);
      try {
        await deleteFileFromUploadThing(course.faqVideo);
      } catch (error) {
        console.error('[Delete Course] Failed to delete FAQ video:', error);
      }
    }

    await removeCourseFromCategory({
      categoryId: course.category,
      courseId: course._id,
      path,
    });
    await pullCourseFromUser({
      userId: course.instructor,
      courseId: course._id,
    });

    await deleteCourseSections(course._id);

    await deleteCourseChatRooms(course._id);

    await Course.findByIdAndDelete(courseId);

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getAllPublishedCourses = async () => {
  try {
    await connectToDatabase();
    const courses = await Course.find({ isPublished: true })
      .populate("instructor")
      .populate("category")
      .populate("students")
      .populate("faqVideoMuxData")
      .populate({
        path: "feedbacks",
        populate: [
          { path: "user", model: "User" },
          {
            path: "course",
            model: "Course",
          },
        ],
      })
      .lean();
    return JSON.parse(JSON.stringify(courses));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getCoursesByTitle = async (title: string) => {
  try {
    await connectToDatabase();

    Feedback.find();
    const courses = await Course.find({
      title: new RegExp(title, "i"),
      isPublished: true,
    })
      .populate("instructor")
      .populate("category")
      .populate("students")
      .populate("feedbacks")
      .populate("faqVideoMuxData")
      .lean();
    return JSON.parse(JSON.stringify(courses));
  } catch (error) {
    console.error("Error fetching courses by title:", error);
    throw new Error("Failed to fetch courses by title");
  }
};

export const deleteInstructorCourses = async (
  params: DeleteInstructorCoursesParams
) => {
  const { instructorId } = params;
  try {
    connectToDatabase();
    await Course.deleteMany({ instructor: instructorId });
  } catch (error: any) {}
};

export const pushSectionToCourse = async (params: ToggleSectionFromCourse) => {
  try {
    connectToDatabase();
    const { courseId, instructorId, sectionId, path } = params;

    if (!mongoose.isValidObjectId(courseId)) throw new Error("Invalid ID");

    const course = await getCourseById({ courseId });

    if (!course) throw new Error("Course not found");
    if (course.instructor._id.toString() !== instructorId.toString())
      throw new Error("Unauthorized, this course does not belong to you.");

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $push: { sections: sectionId } },
      { new: true }
    );

    revalidatePath(path);
    return JSON.parse(JSON.stringify(updatedCourse));
  } catch (error: any) {
    console.log("PUSH SECTION FROM COURSE ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const pullSectionFromCourse = async (
  params: ToggleSectionFromCourse
) => {
  try {
    connectToDatabase();
    const { courseId, instructorId, sectionId, path } = params;

    if (!mongoose.isValidObjectId(courseId)) throw new Error("Invalid ID");

    const course = await getCourseById({ courseId });

    if (!course) throw new Error("Course not found");
    if (course.instructor._id.toString() !== instructorId.toString())
      throw new Error("Unauthorized, this course does not belong to you.");

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $pull: { sections: sectionId } },
      { new: true }
    );

    revalidatePath(path);
    return JSON.parse(JSON.stringify(updatedCourse));
  } catch (error: any) {
    console.log("PUSH SECTION FROM COURSE ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const addCourseExam = async (params: ToggleCourseExam) => {
  try {
    await connectToDatabase();
    const { courseId, examId, path } = params;
    if (!mongoose.isValidObjectId(courseId)) throw new Error("Invalid ID");

    await Course.findByIdAndUpdate(courseId, { exam: examId });

    revalidatePath(path);
  } catch (error: any) {
    console.log("ADD COURSE EXAM ERROR: ", error.message);
    throw new Error(error.message);
  }
};
export const removeCourseExam = async (params: ToggleCourseExam) => {
  try {
    await connectToDatabase();
    const { courseId, examId, path } = params;
    if (!mongoose.isValidObjectId(courseId)) throw new Error("Invalid ID");

    await Course.findByIdAndUpdate(courseId, { exam: null });

    revalidatePath(path);
  } catch (error: any) {
    console.log("REMOVE COURSE EXAM ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const getAllCommentsByCourseId = async (params: GetCourseByIdParams) => {
  try {
    await connectToDatabase();
    const course = await Course.findById(params.courseId).populate("comments");
    if (!course) {
      throw new Error("Course not found");
    }
    return course.comments;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const addCourseComment = async (params: addCourseCommentParams) => {
  try {
    await connectToDatabase();
    const { courseId, userId, content } = params;
    if (!mongoose.isValidObjectId(courseId))
      throw new Error("Invalid course ID");

    const comment = await Comment.create({
      content,
      user: userId,
      course: courseId,
    });

    await Course.findByIdAndUpdate(courseId, {
      $push: { comments: comment._id },
    });

    return comment;
  } catch (error: any) {
    console.log("ADD COURSE COMMENT ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const getAllCourses = async () => {
  try {
    await connectToDatabase();
    const courses = await Course.find()
      .populate("instructor")
      .populate("category")
      .populate("students")
      .populate("faqVideoMuxData")
      .lean();
    return JSON.parse(JSON.stringify(courses));
  } catch (error) {
    console.error("Error fetching all courses:", error);
    throw new Error("Failed to fetch all courses");
  }
};

export const getPendingCourses = async () => {
  try {
    await connectToDatabase();
    const courses = await Course.find({ status: CourseStatusEnum.Pending })
      .populate("instructor")
      .populate("category")
      .populate("students")
      .populate("feedbacks")
      .populate("faqVideoMuxData")
      .lean();

    return JSON.parse(JSON.stringify(courses));
  } catch (error: any) {
    console.log("GET PENDING COURSES ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const publishCourse = async (params: PublishCourseParams) => {
  try {
    await connectToDatabase();

    const { courseId, instructorId } = params;

    if (!mongoose.isValidObjectId(courseId)) throw new Error("Invalid ID");

    const course = await getCourseById({ courseId });

    if (!course) throw new Error("Course not found");

    if (course.instructor._id.toString() !== instructorId.toString())
      throw new Error("Unauthorized, this course does not belong to you.");

    await Course.findByIdAndUpdate(courseId, { isPublished: true });

    return JSON.parse(JSON.stringify(course));
  } catch (error: any) {
    console.log("PUBLISH COURSE ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const pushStudentToCourse = async (params: ToggleStudentFromCourse) => {
  try {
    await connectToDatabase();
    const { courseId, studentId } = params;

    console.log(`\n${"=".repeat(80)}`);
    console.log(`📝 PUSH STUDENT TO COURSE`);
    console.log(`   Course ID: ${courseId}`);
    console.log(`   Student ID: ${studentId}`);

    await CourseChatRoom.find();
    const course = await Course.findById(courseId).populate("chatRoom").populate("instructor");

    if (!course) {
      throw new Error("Course not found");
    }

    console.log(`   Course: ${course.title}`);
    console.log(`   Course Type: ${course.courseType}`);
    console.log(`   Instructor: ${course.instructor ? course.instructor._id : "NOT POPULATED"}`);
    console.log(`   Chat Room ID: ${course.chatRoom ? course.chatRoom._id : "NO CHAT ROOM"}`);

    course.students.push(studentId);
    await course.save();
    console.log(`✅ Student added to course.students array`);

    // Only add student to chat room for regular courses
    if (course.courseType === CourseTypeEnum.Regular) {
      console.log(`\n🔄 Processing group chat room for REGULAR course...`);
      
      // If course doesn't have a chat room, create one
      if (!course.chatRoom || !course.chatRoom._id) {
        console.log("⚠️ Regular course has no chat room, creating one now...");
        try {
          if (!course.instructor || !course.instructor._id) {
            throw new Error("Course instructor not found or not populated");
          }
          const { createCourseChatRoom } = await import("./course-chat-room");
          await createCourseChatRoom({
            courseId: courseId,
            instructorId: course.instructor._id.toString(),
          });
          // Re-fetch course with the newly created chat room
          const updatedCourse = await Course.findById(courseId).populate("chatRoom");
          if (updatedCourse && updatedCourse.chatRoom) {
            course.chatRoom = updatedCourse.chatRoom;
            console.log("✅ Created group chat room:", course.chatRoom._id);
          } else {
            console.error("❌ Failed to create or fetch chat room");
          }
        } catch (createError: any) {
          console.error("❌ Failed to create chat room:", createError.message);
          console.error("Full error stack:", createError.stack);
          // Continue even if chat room creation fails
        }
      } else {
        console.log(`✅ Chat room already exists: ${course.chatRoom._id}`);
      }

      // Now add student to the chat room if it exists
      if (course.chatRoom && course.chatRoom._id) {
        console.log(`\n🔄 Adding student to group chat room...`);
        console.log(`   Student ID: ${studentId}`);
        console.log(`   Chat Room ID: ${course.chatRoom._id}`);
        
        try {
          // Add student to joinedChatRooms and chat room's students array
          await joinChatRoom(studentId, course.chatRoom._id.toString());
          console.log("✅ Student successfully added to group chat room!");
          console.log(`   - Added to User.joinedChatRooms`);
          console.log(`   - Added to CourseChatRoom.students`);
        } catch (chatError: any) {
          console.error("❌ CRITICAL: Failed to add student to group chat:", chatError.message);
          console.error("Full error stack:", chatError.stack);
          // Don't continue silently, throw to see the error
          throw chatError;
        }
      } else {
        console.error("❌ CRITICAL: Chat room still doesn't exist after creation attempt");
        console.log(`   This student will NOT have access to the group chat!`);
      }
    } else {
      console.log(`ℹ️ Course type is "${course.courseType}", skipping group chat room logic`);
    }
    
    console.log(`${"=".repeat(80)}\n`);
  } catch (error: any) {
    console.log("PUSH STUDENT TO COURSE ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const isCourseOwner = async (courseId: string, instructorId: string) => {
  try {
    await connectToDatabase();

    const course: TCourse = await getCourseById({ courseId });

    return course.instructor._id.toString() === instructorId.toString();
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const pushCommentToCourse = async (
  commentId: string,
  courseId: string
) => {
  try {
    await connectToDatabase();

    await Course.findByIdAndUpdate(courseId, {
      $push: { comments: commentId },
    });
  } catch (error: any) {
    console.log("PUSH COMMENT TO COURSE ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const pullCommentFromCourse = async (
  commentId: string,
  courseId: string
) => {
  try {
    await connectToDatabase();

    await Course.findByIdAndUpdate(courseId, {
      $pull: { comments: commentId },
    });
  } catch (error: any) {
    console.log("PULL COMMENT FROM COURSE ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const getCoursesByFilter = async (filters: CourseState) => {
  try {
    await connectToDatabase();

    let query: any = { isPublished: true };
    // let query: any = {};

    if (filters.language.length > 0) {
      query = { ...query, language: { $in: filters.language } };
    }

    if (filters.level.length > 0) {
      query = { ...query, level: { $in: filters.level } };
    }

    if (filters.category.length > 0) {
      const categoryIds = await getCategoryIdsByName(filters.category);
      query = { ...query, category: { $in: categoryIds } };
    }

    query = {
      ...query,
      price: { $gte: filters.price.range[0], $lte: filters.price.range[1] },
    };

    if (filters.rating.length > 0) {
      query = {
        ...query,
        rating: { $in: filters.rating.map((rate) => Number(rate)) },
      };
    }

    let courseQuery = Course.find(query)
      .populate("instructor")
      .populate("category")
      .populate("students")
      .populate("faqVideoMuxData")
      .lean();

    const courses = await courseQuery;

    return JSON.parse(JSON.stringify(courses));
  } catch (error: any) {
    console.error("Error fetching courses by filter:", error);
    throw new Error(error.message);
  }
};

export const pullStudentFromCourse = async (
  params: ToggleStudentFromCourse
) => {
  try {
    await connectToDatabase();
    const { courseId, studentId } = params;

    await Course.findByIdAndUpdate(courseId, {
      $pull: { students: studentId },
    });
  } catch (error: any) {
    console.log("PULL STUDENT FROM COURSE ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const pullPurchaseFromCourse = async (
  purchaseId: string,
  courseId: string
) => {
  try {
    await connectToDatabase();
    await Course.findByIdAndUpdate(courseId, {
      $pull: { purchases: purchaseId },
    });
  } catch (error: any) {
    console.log("PULL PURCHASE FROM COURSE ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const deleteUserCreatedCourses = async (userId: string) => {
  try {
    await connectToDatabase();
    const allCreatedCourses = await Course.find({ instructor: userId });
    await Course.deleteMany({ instructor: userId });

    allCreatedCourses.forEach(async (course) => {
      await deleteCourseSections(course._id);
      await deleteCourseExam(course._id);
      await removeCourseFromCategory({
        categoryId: course.category,
        courseId: course._id,
        path: "/",
      });
    });
  } catch (error: any) {
    console.log("DELETE USER CREATED COURSES ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const pushPurchaseToCourse = async (params: {
  courseId: string;
  purchaseId: string;
}) => {
  try {
    await connectToDatabase();
    const { courseId, purchaseId } = params;

    await Course.findByIdAndUpdate(courseId, {
      $push: { purchases: purchaseId },
    });
  } catch (error: any) {
    console.log("PUSH PURCHASE TO COURSE ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const addCourseChatRoom = async (params: {
  courseId: string;
  chatRoomId: string;
}) => {
  try {
    await connectToDatabase();
    const { courseId, chatRoomId } = params;

    await Course.findByIdAndUpdate(courseId, {
      chatRoom: chatRoomId,
    });
  } catch (error: any) {
    console.log("PUSH CHAT ROOM TO COURSE ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const pullKeywordFromCourse = async (
  courseId: string,
  keyWord: string
) => {
  try {
    await connectToDatabase();

    await Course.findByIdAndUpdate(courseId, {
      $pull: { keywords: keyWord },
    });
  } catch (error: any) {
    console.log("PULL KEYWORD FROM COURSE ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export const pushKeywordsToCourse = async (
  keywords: string[],
  courseId: string
) => {
  try {
    console.log("PUSH KEYWORDS TO COURSE", keywords);
    await connectToDatabase();

    const course = await Course.findById(courseId);

    course.keywords = keywords;

    await course.save();
  } catch (error: any) {
    console.log("PUSH KEYWORDS TO COURSE ERROR: ", error.message);
    throw new Error(error.message);
  }
};

export interface MonthlyPurchaseCount {
  year: number;
  month: string;
  count: number;
}

export const countMonthlyPurchasesForCourse = async (
  courseId: string
): Promise<MonthlyPurchaseCount[]> => {
  try {
    console.log("Calculating monthly purchase counts for course", courseId);
    await connectToDatabase();

    const purchases = await Purchase.find({ courseId: courseId });

    const monthCounts: { [key: string]: number } = {};

    purchases.forEach((purchase) => {
      const date = new Date(purchase.createdAt);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const key = `${year}-${month.toString().padStart(2, "0")}`;

      if (!monthCounts[key]) {
        monthCounts[key] = 0;
      }
      monthCounts[key]++;
    });

    const results: MonthlyPurchaseCount[] = Object.keys(monthCounts).map(
      (key) => {
        const [year, month] = key.split("-");
        return {
          year: parseInt(year),
          month: month,
          count: monthCounts[key],
        };
      }
    );

    results.sort((a, b) => {
      return a.year === b.year
        ? parseInt(a.month) - parseInt(b.month)
        : a.year - b.year;
    });

    console.log("the results are: ", results);
    return results;
  } catch (error: any) {
    console.error(
      "Error in counting monthly purchases for course:",
      error.message
    );
    throw new Error(error.message);
  }
};

export const pushFeedbackToCourse = async (
  feedbackId: string,
  courseId: string
) => {
  try {
    await connectToDatabase();

    await Course.findByIdAndUpdate(courseId, {
      $push: { feedbacks: feedbackId },
    });
  } catch (error: any) {
    console.log("PUSH FEEDBACK TO COURSE ERROR: ", error.message);
    throw new Error(error.message);
  }
};
