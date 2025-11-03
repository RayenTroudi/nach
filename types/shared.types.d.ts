import mongoose from "mongoose";
import { TComment } from "./models.types";
// Course Params

export interface GetCourseByIdParams {
  courseId: string;
}

export interface CreateCourseParams {
  courseTitle: string;
  courseCategory: string;
  path: string;
}

export interface UpdateCourseParams {
  courseId: string;
  instructorId: string;
  data: any;
  path: string;
}

export interface UpdateCourseStatusParams {
  courseId: string;
  status: string;
  path: string;
}

export interface DeleteCourseByIdParams {
  courseId: string;
  path: string;
}

export interface DeleteAttachmentFromCourseParams {
  courseId: string;
  attachmentId: string;
  path: string;
}

export interface AddAttachmentToCourseParams {
  courseId: string;
  attachmentId: any;
  path: string;
}

export interface DeleteInstructorCoursesParams {
  instructorId: string;
  path?: string;
}

export interface ToggleCourseExam {
  courseId: string;
  examId: string;
  path: string;
}

export interface PublishCourseParams {
  courseId: string;
  instructorId: string;
}

export interface ToggleStudentFromCourse {
  courseId: string;
  studentId: string;
}

// User Params
export interface CreateUserParams {
  clerkId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  picture: string;
  path?: string;
}

export interface UpdateUserParams {
  clerkId: string;
  data: any;
  path?: string;
}

export interface DeleteUserParams {
  clerkId: string;
}

export interface GetUserByClerkIdParams {
  clerkId: string;
}

export interface AddNewlyCreatedCourseToUserParams {
  userId: string;
  courseId: string;
}

export interface GetTeacherCourses {
  clerkId: string;
}

export interface PullCourseFromUser {
  userId: string;
  courseId: string;
}

export interface ToggleSectionFromCourse {
  courseId: string;
  instructorId: string;
  sectionId: string;
  path: string;
}

export interface PushEnrolledCourseToUser {
  userId: string;
  courseId: string;
}

export interface GetUserEnrolledCourseById {
  courseId: string;
}

// Attachment Params

export interface CreateAttachmentParams {
  courseId: string;
  instructorId: string;
  data: any;
  path: string;
}

export interface DeleteCourseAttachmentsParams {
  courseId: string;
}

export interface RemoveAttachment {
  courseId: string;
  instructorId: string;
  attachmentId: string;
  sectionId: string;
  path: string;
}

// Category Params
export interface GetCategoryById {
  id: string;
}

export interface CreateCategoryParams {
  name: string;
  path: string;
}

export interface ToggleCourseToCategory {
  categoryId: string;
  courseId: string;
  path: string;
}

// Section Params
export interface CreateSectionParams {
  title: string;
  courseId: string;
  instructorId: string;
  path: string;
}

export interface ReorderSectionParams {
  courseId: string;
  instructorId: string;
  sectionId: string;
  newPosition: number;
  path: string;
}

export interface UpdateSectionParams {
  sectionId: string;
  courseId: string;
  instructorId: string;
  data: any;
  path: string;
}

export interface ToggleVideoParams {
  sectionId: string;
  videoId: string;
  path: string;
}

export interface ToggleAttachmentParams {
  courseId: string;
  instructorId: string;
  sectionId: string;
  attachmentId: string;
  path: string;
}

export interface RegisterQuizToSectionParams {
  sectionId: string;
  quizId: string;
  path: string;
}

// Video Params
export interface CreateVideoParams {
  sectionId: string;
  courseId: string;
  instructorId: string;
  title: any;
  path: string;
}

export interface ReorderVideoParams {
  courseId: string;
  instructorId: string;
  videoId: string;
  newPosition: number;
  path: string;
}

export interface DeleteVideoParams {
  courseId: string;
  instructorId: string;
  sectionId: string;
  videoId: string;
  path: string;
}

export interface UpdateVideoParams {
  videoId: string;
  courseId: string;
  instructorId: string;
  data: any;
  path: string;
}

// Exam Params
export interface EditExamParams {
  courseId: string;
  instructorId: string;
  examId?: string;
  data: any;
  path: string;
}

export interface RemoveExamParams {
  courseId: string;
  instructorId: string;
  examId: string;
  path: string;
}

// Quiz Params
export interface CreateQuizParams {
  title: string;
  sectionId: string;
  time: number;
  path: string;
}
export interface PushQuestionToQuizParams {
  quizId: string;
  questionId: string;
  path: string;
}

// Question Params
export interface CreateQuestionParams {
  title: string;
  correctAnswer: string;
  quizId: string;
  path: string;
}

export interface ToggleOptionToQuestionParams {
  questionId: string;
  optionId: string;
  path: string;
}

// Question Option Params
export interface CreateQuestionOptionParams {
  title: string;
  questionId: string;
  path: string;
}

// Purchase Params
export interface CreatePurchaseParams {
  userId: string;
  courseId: string;
}

// Comment Params
export interface CreateCommentParams {
  title: string;
  content?: string;
  userId: string;
  courseId: string;
  path: string;
}

// Reply Params
export interface ReplyToCommentParams {
  title: string;
  content?: string;
  ownerId: string;
  commentId: string;
  path: string;
}

// User Course Progress Params
export interface StartTrackUserCourseProgressParams {
  userId: string;
  courseId: string;
}

export interface GetUserCourseProgressParams {
  userId: string;
  courseId: string;
}

export interface CreateChatRoomParams {
  courseId: string;
  instructorId: string;
}
