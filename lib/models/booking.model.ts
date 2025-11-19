import mongoose, { Schema, model, models } from "mongoose";

export interface IBooking {
  _id: string;
  userId: Schema.Types.ObjectId;
  hostId: Schema.Types.ObjectId;
  startAt: Date;
  endAt: Date;
  roomName: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  timezone: string;
  notes?: string;
  reminderSent30Min?: boolean;
  reminderSentStart?: boolean;
  price?: number;
  paymentStatus?: "pending" | "paid" | "free" | "rejected";
  paymentProof?: string;
  paymentMethod?: "stripe" | "bank_transfer" | "free";
  meetingLink?: string;
  meetingId?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hostId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startAt: {
      type: Date,
      required: true,
      index: true,
    },
    endAt: {
      type: Date,
      required: true,
      index: true,
    },
    roomName: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "no-show"],
      default: "scheduled",
      index: true,
    },
    timezone: {
      type: String,
      required: true,
      default: "UTC",
    },
    notes: {
      type: String,
    },
    reminderSent30Min: {
      type: Boolean,
      default: false,
    },
    reminderSentStart: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "free", "rejected"],
      default: "pending",
    },
    paymentProof: {
      type: String,
    },
    paymentMethod: {
      type: String,
      enum: ["stripe", "bank_transfer", "free"],
    },
    meetingLink: {
      type: String,
    },
    meetingId: {
      type: String,
    },
    adminNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for checking availability conflicts
bookingSchema.index({ hostId: 1, startAt: 1, endAt: 1, status: 1 });
bookingSchema.index({ userId: 1, startAt: 1 });

const Booking = models.Booking || model<IBooking>("Booking", bookingSchema);

export default Booking;
