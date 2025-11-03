import { Schema, models, model, Document } from "mongoose";

export enum CourseLevelEnum {
  Beginner = "beginner",
  Intermediate = "intermediate",
  Advanced = "advanced",
  All_Levels = "all levels",
}

export enum CourseStatusEnum {
  Draft = "draft",
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
}

export interface ICourse extends Document {
  title: string;
  description?: string;
  level?: CourseLevelEnum;
  language?: string;
  welcomeMessage?: string;
  congratsMessage?: string;
  price?: number;
  currency?: string;
  completed?: boolean;
  thumbnail?: string;
  isPublished?: boolean;
  status?: CourseStatusEnum;
  instructor: Schema.Types.ObjectId;
  category: Schema.Types.ObjectId;
  exam?: Schema.Types.ObjectId;
  keywords: string[];
  feedbacks?: Schema.Types.ObjectId[];
  chatRoom?: Schema.Types.ObjectId;
  students?: Schema.Types.ObjectId[];
  sections?: Schema.Types.ObjectId[];
  purchases?: Schema.Types.ObjectId[];
  comments?: Schema.Types.ObjectId[];
}

export const CourseSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    level: {
      type: String,
      enum: Object.values(CourseLevelEnum),
      default: CourseLevelEnum.Beginner,
    },
    language: { type: String, default: "English" },
    welcomeMessage: { type: String, default: "" },
    congratsMessage: { type: String, default: "" },
    price: { type: Number, default: 0 },
    currency: { type: String, default: "" },
    completed: { type: Boolean, default: false },
    thumbnail: { type: String, default: "" },
    isPublished: { type: Boolean, default: false },
    status: {
      type: String,
      enum: Object.values(CourseStatusEnum),
      default: CourseStatusEnum.Draft,
    },
    exam: { type: Schema.Types.ObjectId, ref: "Exam", default: null },
    instructor: { type: Schema.Types.ObjectId, ref: "User" },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    chatRoom: {
      type: Schema.Types.ObjectId,
      ref: "CourseChatRoom",
      default: null,
    },
    keywords: [{ type: String, default: [] }],
    feedbacks: [{ type: Schema.Types.ObjectId, ref: "Feedback", default: [] }],
    students: [{ type: Schema.Types.ObjectId, ref: "User" }],
    sections: [{ type: Schema.Types.ObjectId, ref: "Section" }],
    purchases: [{ type: Schema.Types.ObjectId, ref: "Purchase" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment", default: [] }],
  },
  { timestamps: true }
);

CourseSchema.index({ title: "text" });

const Course = models?.Course || model("Course", CourseSchema);

export default Course;
