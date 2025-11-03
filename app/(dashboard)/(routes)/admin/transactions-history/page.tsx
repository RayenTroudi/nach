import NoTransaction from "@/components/shared/animations/NoTransaction";
import TransactionsHistory from "@/components/shared/TransactionsHistory";
import { getAllTransactions } from "@/lib/actions/withdraw-transactions";
import { TUser, TWithdrawTransaction } from "@/types/models.types";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";
import TransactionsHistoryInitialScreen from "./_components/TransactionsHistoryInitialScreen";
import { getAllInstructorsWithTransactions } from "@/lib/actions/user.action";

const TransactionHistoryPage = async () => {
  const { userId } = auth();

  if (!userId) redirect("/sign-in");

  let allInstructorsWithTransaction: TUser[] = [];

  try {
    allInstructorsWithTransaction = await getAllInstructorsWithTransactions();
  } catch (error: any) {
    console.log("error", error.message);
  }
  return (
    <TransactionsHistoryInitialScreen
      instructors={allInstructorsWithTransaction}
    />
  );
};

export default TransactionHistoryPage;
