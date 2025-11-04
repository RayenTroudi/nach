import { model, models, Schema, Document } from "mongoose";

export interface ISection extends Document {
  title: string;
  videos: Schema.Types.ObjectId[];
  attachments: Schema.Types.ObjectId[];
  course: Schema.Types.ObjectId;
  sectionThumbnail?: string;
  position: number;
  isPublished: boolean;
}

export const SectionSchema = new Schema(
  {
    title: { type: String, required: true },
    videos: [{ type: Schema.Types.ObjectId, ref: "Video", default: [] }],
    attachments: [
      { type: Schema.Types.ObjectId, ref: "Attachment", default: [] },
    ],
    sectionThumbnail: { type: String, default: "" },
    position: { type: Number, default: 1 },
    course: { type: Schema.Types.ObjectId, ref: "Course" },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Section = models?.Section || model("Section", SectionSchema);
export default Section;
