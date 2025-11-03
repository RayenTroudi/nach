import { models, model, Document, Schema } from "mongoose";

interface IFeedback extends Document {
  course: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  rating: number;
  comment: string;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    course: { type: Schema.Types.ObjectId, ref: "Course" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    rating: { type: Number, required: true, default: 0 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const Feedback = models.Feedback || model("Feedback", FeedbackSchema);

export default Feedback;
