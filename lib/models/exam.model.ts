import { models, model, Schema, Document } from "mongoose";

export interface IExam extends Document {
  title: string;
  examUrl: string;
  courseId: Schema.Types.ObjectId;
  passedUsers?: Schema.Types.ObjectId[];
}

const ExamSchema = new Schema(
  {
    title: { type: String, required: true },
    examUrl: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: models.Course },
    passedUsers: [
      { type: Schema.Types.ObjectId, ref: models.User, default: [] },
    ],
  },
  { timestamps: true }
);

const Exam = models?.Exam || model("Exam", ExamSchema);

export default Exam;
