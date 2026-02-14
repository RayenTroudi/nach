import { TUser, TWithdrawTransaction } from "@/types/models.types";
import React from "react";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "@/lib/utils";

type Props = {
  transactions: TWithdrawTransaction[];
};

const TransactionsHistory = ({ transactions }: Props) => {
  const totalTransactions = transactions.reduce(
    (acc, transaction) => acc + transaction.amount,
    0
  );

  console.log("transactions", transactions);
  return (
    <Table className="overflow-auto">
      <TableCaption>A list of your recent withdraws.</TableCaption>
      <TableHeader>
        <TableRow className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-slate-800">
          <TableHead className="w-[200px] text-white dark:text-slate-100">
            Transaction ID
          </TableHead>
          <TableHead className="w-[200px] text-white dark:text-slate-100">
            Account ID
          </TableHead>
          <TableHead className="text-white dark:text-slate-100">Type</TableHead>
          <TableHead className="text-white dark:text-slate-100">Date</TableHead>
          <TableHead className="text-right text-white dark:text-slate-100">
            Amount
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody className="">
        {transactions.map((transaction) => (
          <TableRow key={transaction._id}>
            <TableCell className="font-medium">
              {transaction.transferId}
            </TableCell>
            <TableCell className="font-medium">
              {transaction.stripeId}
            </TableCell>
            <TableCell>Transfer</TableCell>
            <TableCell>{format(transaction.createdAt)}</TableCell>
            <TableCell className="text-right">${transaction.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter className="">
        <TableRow className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-slate-800">
          <TableCell colSpan={4} className="text-white dark:text-slate-100">
            Total
          </TableCell>
          <TableCell className="text-right text-white dark:text-slate-100">
            ${totalTransactions.toFixed(2)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};

export default TransactionsHistory;
