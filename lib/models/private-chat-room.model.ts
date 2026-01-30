import { model, models, Schema, Document } from "mongoose";

interface IPrivateChatRoom extends Document {
  courseId: Schema.Types.ObjectId;
  student: Schema.Types.ObjectId;
  instructor: Schema.Types.ObjectId;
  messages?: Schema.Types.ObjectId[];
  isActive: boolean;
}

const privateChatRoomSchema = new Schema<IPrivateChatRoom>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    instructor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "PrivateChatMessage",
        default: [],
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound index to ensure one private chat per student-instructor-course combination
privateChatRoomSchema.index({ courseId: 1, student: 1, instructor: 1 }, { unique: true });

// Force delete cached model to ensure schema updates are applied
if (models.PrivateChatRoom) {
  delete models.PrivateChatRoom;
}

const PrivateChatRoom = model<IPrivateChatRoom>("PrivateChatRoom", privateChatRoomSchema);

export default PrivateChatRoom;
