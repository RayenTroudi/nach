import { model, models, Schema, Document } from "mongoose";

export interface IQuiz extends Document {
  title: string;
  questions: Schema.Types.ObjectId[];
  sectionId: Schema.Types.ObjectId;
  passedUsers?: Schema.Types.ObjectId[];
  time: number;
}

const QuizSchema = new Schema(
  {
    title: { type: String, required: true },
    questions: [{ type: Schema.Types.ObjectId, ref: "Question", default: [] }],
    sectionId: { type: Schema.Types.ObjectId, ref: "Section" },
    passedUsers: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    time: { type: Number, default:  300},
  },
  { timestamps: true }
);

const Quiz = models?.Quiz || model("Quiz", QuizSchema);
export default Quiz;
