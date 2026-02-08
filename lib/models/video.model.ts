import { models, model, Schema, Document } from "mongoose";

export interface IVideo extends Document {
  title: string;
  description?: string;
  videoUrl?: string;
  position?: number;
  isPublished?: boolean;
  isFree: boolean;
  sectionId: Schema.Types.ObjectId;
  muxData?: Schema.Types.ObjectId;
  userProgress?: Schema.Types.ObjectId[];
}

export const VideoSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    position: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    isFree: { type: Boolean, default: false },
    sectionId: { type: Schema.Types.ObjectId, ref: "Section" },
    muxData: { type: Schema.Types.ObjectId, ref: "MuxData", default: null },
    userProgress: [{ type: Schema.Types.ObjectId, ref: "UserProgress" }],
  },
  { timestamps: true }
);

const Video = models?.Video || model("Video", VideoSchema);
export default Video;
