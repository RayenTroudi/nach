import { models, model, Schema, Document } from "mongoose";

export interface IPurchase extends Document {
  userId: Schema.Types.ObjectId;
  courseId: Schema.Types.ObjectId;
}

export const PurchaseSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    courseId: { type: Schema.Types.ObjectId, ref: "Course" },
  },
  { timestamps: true }
);

const Purchase = models?.Purchase || model("Purchase", PurchaseSchema);
export default Purchase;
