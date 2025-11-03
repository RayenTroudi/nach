import { model, models, Schema, Document } from "mongoose";

export interface IUserCourseVideoCompleted extends Document {
  userId: Schema.Types.ObjectId;
  courseId: Schema.Types.ObjectId;
  videoId: Schema.Types.ObjectId;
}

export const UserCourseVideoCompletedSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    courseId: { type: Schema.Types.ObjectId, ref: "Course" },
    videoId: { type: Schema.Types.ObjectId, ref: "Video" },
  },
  { timestamps: true }
);

const UserCourseVideoCompleted =
  models?.UserCourseVideoCompleted ||
  model("UserCourseVideoCompleted", UserCourseVideoCompletedSchema);
export default UserCourseVideoCompleted;
