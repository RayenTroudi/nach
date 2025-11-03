"use client";
import Integration from "@/components/integrations/Integration";
import NoTransaction from "@/components/shared/animations/NoTransaction";
import TransactionsHistory from "@/components/shared/TransactionsHistory";
import { IntegrationType } from "@/types";
import { TUser } from "@/types/models.types";
import React from "react";

type Props = {
  user: TUser;
  integrationData: IntegrationType;
};

const TransactionsScreen = ({ user, integrationData }: Props) => {
  return (
    <div className="w-full mx-auto flex flex-col gap-y-4">
      <Integration
        integrationData={integrationData}
        user={user}
        alreadyConnected={true}
      />

      {user!.withdrawTransactions!.length ? (
        <TransactionsHistory transactions={user.withdrawTransactions!} />
      ) : (
        <div className="w-full flex flex-col gap-y-2 items-center justify-center">
          <NoTransaction />
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
            No transactions yet
          </p>
        </div>
      )}
    </div>
  );
};

export default TransactionsScreen;
