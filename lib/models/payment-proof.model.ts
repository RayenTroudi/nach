import { Schema, model, models, Document } from "mongoose";

export interface IPaymentProof extends Document {
  userId: Schema.Types.ObjectId;
  courseIds: string[];
  amount: number;
  proofUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  adminNotes?: string;
  reviewedBy?: Schema.Types.ObjectId;
  reviewedAt?: Date;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentProofSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseIds: {
      type: [String],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    proofUrl: {
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
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
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
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
PaymentProofSchema.index({ userId: 1, status: 1 });
PaymentProofSchema.index({ status: 1, uploadedAt: -1 });

const PaymentProof = models.PaymentProof || model<IPaymentProof>("PaymentProof", PaymentProofSchema);

export default PaymentProof;
