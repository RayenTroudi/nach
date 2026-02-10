import { models, model, Schema, Document } from "mongoose";

export interface IVideo extends Document {
  title: string;
  description?: string;
  // DEPRECATED: videoUrl and videoQualities - Now using Mux for all videos
  videoUrl?: string; // Legacy field, kept for backward compatibility
  videoQualities?: Record<string, string>; // Legacy field, kept for backward compatibility
  position?: number;
  isPublished?: boolean;
  isFree: boolean;
  sectionId: Schema.Types.ObjectId;
  muxData?: Schema.Types.ObjectId; // Primary video source via Mux
  userProgress?: Schema.Types.ObjectId[];
}

export const VideoSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    // Legacy fields - kept for backward compatibility with existing videos
    videoUrl: { type: String, default: "" },
    videoQualities: { 
      type: Map, 
      of: String,
      default: () => new Map()
    },
    position: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    isFree: { type: Boolean, default: false },
    sectionId: { type: Schema.Types.ObjectId, ref: "Section" },
    // Mux data - primary video source
    muxData: { type: Schema.Types.ObjectId, ref: "MuxData", default: null },
    userProgress: [{ type: Schema.Types.ObjectId, ref: "UserProgress" }],
  },
  { timestamps: true }
);

const Video = models?.Video || model("Video", VideoSchema);
export default Video;
