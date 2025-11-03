import { Schema, models, model, Document } from "mongoose";

export interface Reply extends Document {
  owner: Schema.Types.ObjectId;
  title: string;
  content: string;
  comment: Schema.Types.ObjectId;
}

const ReplySchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
    },
    content: {
      type: String,
    },
    comment: { type: Schema.Types.ObjectId, ref: "Comment" },
  },
  { timestamps: true }
);

const Reply = models?.Reply || model("Reply", ReplySchema);

export default Reply;
