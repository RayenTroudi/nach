import mongoose, { Schema, model, models } from "mongoose";

export interface IAvailability {
  _id: string;
  userId: Schema.Types.ObjectId;
  date: Date; // Full date for the availability
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc. (kept for backward compatibility)
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
    date: {
      type: Date,
      required: true,
    },
    dayOfWeek: {
      type: Number,
      required: false, // Optional for backward compatibility
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
availabilitySchema.index({ userId: 1, date: 1, isActive: 1 });

const Availability =
  models.Availability || model<IAvailability>("Availability", availabilitySchema);

export default Availability;
