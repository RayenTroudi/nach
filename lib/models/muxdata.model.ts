import { models, model, Schema, Document } from "mongoose";

export interface IMuxData extends Document {
  assetId: string;
  playbackId?: string;
  video: Schema.Types.ObjectId;
}

export const MuxDataSchema = new Schema(
  {
    assetId: { type: String, required: true },
    playbackId: { type: String, default: "" },
    video: { type: Schema.Types.ObjectId, ref: "Video" },
  },
  { timestamps: true }
);

const MuxData = models?.MuxData || model("MuxData", MuxDataSchema);
export default MuxData;
