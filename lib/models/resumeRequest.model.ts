import { Schema, model, models, Document } from "mongoose";

export interface IResumeRequest extends Document {
  userId?: Schema.Types.ObjectId;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  birthDate?: string;
  address?: string;
  phone: string;
  driverLicense?: string;
  germanLevel?: string;
  frenchLevel?: string;
  englishLevel?: string;
  hasBac?: string;
  bacObtainedDate?: string;
  bacStudiedDate?: string;
  bacSection?: string;
  bacHighSchool?: string;
  bacCity?: string;
  postBacStudies?: string;
  internships?: string;
  trainings?: string;
  desiredTraining?: string;
  professionalExperience?: string;
  additionalInfo?: string;
  documentUrl?: string;
  price: number;
  paymentProofUrl?: string;
  paymentStatus: "pending" | "paid" | "rejected";
  status: "pending" | "in_progress" | "completed" | "rejected";
  adminNotes?: string;
  completedResumeUrl?: string;
  completedMotivationLetterUrl?: string;  completedMotivationLetter2Url?: string;  createdAt: Date;
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
    firstName: String,
    lastName: String,
    email: {
      type: String,
      required: true,
    },
    birthDate: String,
    address: String,
    phone: {
      type: String,
      required: true,
    },
    driverLicense: String,
    germanLevel: String,
    frenchLevel: String,
    englishLevel: String,
    hasBac: String,
    bacObtainedDate: String,
    bacStudiedDate: String,
    bacSection: String,
    bacHighSchool: String,
    bacCity: String,
    postBacStudies: String,
    internships: String,
    trainings: String,
    desiredTraining: String,
    professionalExperience: String,
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
    completedMotivationLetterUrl: String,
    completedMotivationLetter2Url: String,
  },
  {
    timestamps: true,
    strict: false  // Allow fields not defined in schema
  }
);

// Delete the existing model if it exists to prevent caching issues
if (models.ResumeRequest) {
  delete models.ResumeRequest;
}

const ResumeRequestModel = model<IResumeRequest>("ResumeRequest", ResumeRequestSchema);

export default ResumeRequestModel;
