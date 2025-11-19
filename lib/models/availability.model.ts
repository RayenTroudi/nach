import mongoose, { Schema, model, models } from "mongoose";

export interface IAvailability {
  _id: string;
  userId: Schema.Types.ObjectId;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const availabilitySchema = new Schema<IAvailability>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for quick availability lookups
availabilitySchema.index({ userId: 1, dayOfWeek: 1, isActive: 1 });

const Availability =
  models.Availability || model<IAvailability>("Availability", availabilitySchema);

export default Availability;
