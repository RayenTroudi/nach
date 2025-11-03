import { models, model, Schema, Document } from "mongoose";
import { unique } from "next/dist/build/utils";

export interface IStripeCustomer extends Document {
  userId: Schema.Types.ObjectId;
  stripeCustomerId: string;
}

export const StripeCustomerSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", unique: true },
    stripeCustomerId: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);
