import { Schema, model, models, Document } from "mongoose";

export interface IResumeRequest extends Document {
  userId?: Schema.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  currentRole?: string;
  targetRole?: string;
  experience?: string;
  education?: string;
  skills?: string;
  additionalInfo?: string;
  documentUrl?: string;
  price: number;
  paymentProofUrl?: string;
  paymentStatus: "pending" | "paid" | "rejected";
  status: "pending" | "in_progress" | "completed" | "rejected";
  adminNotes?: string;
  completedResumeUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeRequestSchema = new Schema<IResumeRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    currentRole: String,
    targetRole: String,
    experience: String,
    education: String,
    skills: String,
    additionalInfo: String,
    documentUrl: String,
    price: {
      type: Number,
      required: true,
      default: 49,
    },
    paymentProofUrl: String,
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "rejected"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "rejected"],
      default: "pending",
    },
    adminNotes: String,
    completedResumeUrl: String,
  },
  { timestamps: true }
);

const ResumeRequestModel =
  models.ResumeRequest || model<IResumeRequest>("ResumeRequest", ResumeRequestSchema);

export default ResumeRequestModel;
