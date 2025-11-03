import { model, models, Schema, Document } from "mongoose";

export interface IQuestion extends Document {
  title: string;
  options: Schema.Types.ObjectId[];
  correctAnswer: string;
  quizId: Schema.Types.ObjectId;
}

const QuestionSchema = new Schema(
  {
    title: { type: String, required: true },
    options: [
      { type: Schema.Types.ObjectId, ref: "QuestionOption", default: [] },
    ],
    correctAnswer: { type: String, required: true },
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
  },
  { timestamps: true }
);

const Question = models?.Question || model("Question", QuestionSchema);
export default Question;
