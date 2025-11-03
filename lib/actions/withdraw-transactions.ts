"use server";

import { TWithdrawTransaction } from "@/types/models.types";
import WithdrawTransaction from "../models/withdraw-transaction";
import { connectToDatabase } from "../mongoose";
import { withdrawEarnings } from "./user.action";

export const createWithdrawTransaction = async (params: {
  user: string;
  amount: number;
  stripeId: string;
  transferId: string;
}) => {
  try {
    await connectToDatabase();

    const newTransaction: TWithdrawTransaction =
      await WithdrawTransaction.create(params);

    if (!newTransaction) {
      throw new Error("Failed to create withdraw transaction.");
    }

    await withdrawEarnings(params.user, params.stripeId, newTransaction._id);

    return JSON.parse(JSON.stringify(newTransaction));
  } catch (error: any) {
    console.log("error", error.message);
    throw new Error(error.message);
  }
};

export const getAllTransactions = async () => {
  try {
    await connectToDatabase();

    const transactions = await WithdrawTransaction.find().populate({
      path: "user",
      model: "User",
    });
    return JSON.parse(JSON.stringify(transactions));
  } catch (error: any) {
    console.log("error", error.message);
    throw new Error(error.message);
  }
};
