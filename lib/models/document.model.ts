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
  // Pricing fields for individual document sales
  price?: number;
  currency?: string;
  isForSale?: boolean;
  purchases?: Schema.Types.ObjectId[]; // References to DocumentPurchase
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
    // Pricing fields for individual document sales
    price: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      enum: ['usd', 'tnd', 'eur'],
      default: 'usd',
    },
    isForSale: {
      type: Boolean,
      default: false,
    },
    purchases: [
      {
        type: Schema.Types.ObjectId,
        ref: "DocumentPurchase",
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  }
);

const DocumentModel = models.Document || model<IDocument>("Document", DocumentSchema);

export default DocumentModel;
