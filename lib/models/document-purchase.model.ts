import { models, model, Schema, Document } from "mongoose";

/**
 * Document Purchase Model
 * Tracks purchases of both individual documents and document bundles
 */
export interface IDocumentPurchase extends Document {
  userId: Schema.Types.ObjectId; // Reference to User
  itemType: "document" | "bundle"; // Type of purchase
  itemId: Schema.Types.ObjectId; // Reference to Document or DocumentBundle
  itemModelName: "Document" | "DocumentBundle"; // Model name for population
  amount: number;
  currency: string;
  paymentMethod?: "stripe" | "bank_transfer";
  paymentStatus: "pending" | "completed" | "rejected";
  paymentProofUrl?: string;
  notes?: string; // Student notes
  adminNotes?: string; // Admin notes for rejection reason
  reviewedBy?: Schema.Types.ObjectId; // Admin who reviewed
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const DocumentPurchaseSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    itemType: {
      type: String,
      enum: ["document", "bundle"],
      required: true,
    },
    itemModelName: {
      type: String,
      enum: ["Document", "DocumentBundle"],
      required: true,
    },
    itemId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "itemModelName", // Dynamic reference based on itemModelName
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      enum: ['usd', 'tnd'],
      default: 'usd',
    },
    paymentMethod: {
      type: String,
      enum: ["stripe", "bank_transfer"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "rejected"],
      default: "completed",
    },
    paymentProofUrl: {
      type: String,
    },
    notes: {
      type: String,
      default: "",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
DocumentPurchaseSchema.index({ userId: 1 });
DocumentPurchaseSchema.index({ itemType: 1, itemId: 1 });
DocumentPurchaseSchema.index({ paymentStatus: 1 });

const DocumentPurchase =
  models?.DocumentPurchase ||
  model("DocumentPurchase", DocumentPurchaseSchema);

export default DocumentPurchase;
