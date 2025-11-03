import { model, models, Schema, Document } from "mongoose";

interface IWithdrawTransaction extends Document {
  user: Schema.Types.ObjectId;
  amount: number;
  stripeId: string;
  transferId: string;
}

const WithdrawTransactionSchema = new Schema<IWithdrawTransaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
    },
    stripeId: {
      type: String,
      required: true,
    },
    transferId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const WithdrawTransaction =
  models?.WithdrawTransaction ||
  model("WithdrawTransaction", WithdrawTransactionSchema);

export default WithdrawTransaction;
