import { Schema, models, model, Document } from "mongoose";

export interface IAttachment extends Document {
  title: string;
  url: string;
  section: Schema.Types.ObjectId;
}

export const AttachmentSchema = new Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    section: { type: Schema.Types.ObjectId, ref: "Section" },
  },
  { timestamps: true }
);

const Attachment = models.Attachment || model("Attachment", AttachmentSchema);

export default Attachment;
