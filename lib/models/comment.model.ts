import { Schema, models, model, Document } from "mongoose";

export interface IComment extends Document {
  title: string;
  content: string;
  user: Schema.Types.ObjectId;
  course: Schema.Types.ObjectId;
  replies?: Schema.Types.ObjectId[];
}

const CommentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    course: { type: Schema.Types.ObjectId, ref: "Course" },
    replies: [{ type: Schema.Types.ObjectId, ref: "Replies", default: [] }],
  },
  { timestamps: true }
);

const Comment = models?.Comment || model("Comment", CommentSchema);

export default Comment;
