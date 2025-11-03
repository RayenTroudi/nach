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
        <TableRow className="bg-black dark:bg-white hover:bg-black dark:hover:bg-white">
          <TableHead className="w-[200px] text-white dark:text-black">
            Transaction ID
          </TableHead>
          <TableHead className="w-[200px] text-white dark:text-black">
            Account ID
          </TableHead>
          <TableHead className="text-white dark:text-black">Type</TableHead>
          <TableHead className="text-white dark:text-black">Date</TableHead>
          <TableHead className="text-right text-white dark:text-black">
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
        <TableRow className="bg-black dark:bg-white hover:bg-black dark:hover:bg-white">
          <TableCell colSpan={4} className="text-white dark:text-black">
            Total
          </TableCell>
          <TableCell className="text-right text-white dark:text-black">
            ${totalTransactions.toFixed(2)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};

export default TransactionsHistory;
