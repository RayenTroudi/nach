import { model, models, Schema, Document } from "mongoose";

interface ICourseChatRoom extends Document {
  courseId: Schema.Types.ObjectId;
  students?: Schema.Types.ObjectId[];
  instructorAdmin: Schema.Types.ObjectId;
  messages?: Schema.Types.ObjectId[];
}

const courseChatRoomSchema = new Schema<ICourseChatRoom>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course" },
    students: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    instructorAdmin: { type: Schema.Types.ObjectId, ref: "User" },
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "ChatRoomMessage",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

const CourseChatRoom =
  models.CourseChatRoom ||
  model<ICourseChatRoom>("CourseChatRoom", courseChatRoomSchema);

export default CourseChatRoom;
