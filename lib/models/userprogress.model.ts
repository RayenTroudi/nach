import { models, model, Schema, Document } from "mongoose";

export interface IUserProgress extends Document {
  userId: Schema.Types.ObjectId;
  courseId: Schema.Types.ObjectId;
  progress: number;
  isCompleted?: boolean;
}

export const UserProgressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    courseId: { type: Schema.Types.ObjectId, ref: "Course" },
    progress: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const UserProgress =
  models?.UserProgress || model("UserProgress", UserProgressSchema);
export default UserProgress;
