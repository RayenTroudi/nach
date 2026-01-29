import { Schema, models, model, Document } from "mongoose";

/**
 * Document Bundle Model
 * Represents a collection of documents grouped together for sale
 */
export interface IDocumentBundle extends Document {
  title: string;
  description?: string;
  price: number;
  currency: string; // 'usd', 'tnd', or 'eur'
  thumbnail?: string;
  documents: Schema.Types.ObjectId[]; // References to Document model
  uploadedBy: Schema.Types.ObjectId; // Reference to User (instructor)
  isPublished: boolean;
  category: string;
  tags?: string[];
  purchases?: Schema.Types.ObjectId[]; // References to DocumentPurchase
  createdAt: Date;
  updatedAt: Date;
}

const DocumentBundleSchema = new Schema(
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
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      required: true,
      enum: ['usd', 'tnd', 'eur'],
      default: 'usd',
    },
    thumbnail: {
      type: String,
      default: "",
    },
    documents: [
      {
        type: Schema.Types.ObjectId,
        ref: "Document",
        default: [],
      },
    ],
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
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
    tags: [
      {
        type: String,
        default: [],
      },
    ],
    purchases: [
      {
        type: Schema.Types.ObjectId,
        ref: "DocumentPurchase",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

// Index for faster queries
DocumentBundleSchema.index({ uploadedBy: 1 });
DocumentBundleSchema.index({ isPublished: 1 });
DocumentBundleSchema.index({ category: 1 });

const DocumentBundle =
  models.DocumentBundle || model<IDocumentBundle>("DocumentBundle", DocumentBundleSchema);

export default DocumentBundle;
