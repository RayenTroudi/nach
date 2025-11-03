import { model, models, Schema, Document } from "mongoose";

export interface IQuestionOption extends Document {
  title: string;
  questionId: Schema.Types.ObjectId;
}

const QuestionOptionSchema = new Schema(
  {
    title: { type: String, required: true },
    questionId: { type: Schema.Types.ObjectId, ref: "Question" },
  },
  { timestamps: true }
);

const QuestionOption =
  models?.QuestionOption || model("QuestionOption", QuestionOptionSchema);
export default QuestionOption;
