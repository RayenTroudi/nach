import { Schema, models, model, Document } from "mongoose";

export interface IDocument extends Document {
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  category: string;
  tags?: string[];
  uploadedBy: Schema.Types.ObjectId;
  isPublic: boolean;
  downloads: number;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Visa",
        "Application",
        "Language",
        "Certificate",
        "Guide",
        "Template",
        "Other",
      ],
    },
    tags: [{
      type: String,
    }],
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    downloads: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const DocumentModel = models.Document || model<IDocument>("Document", DocumentSchema);

export default DocumentModel;
