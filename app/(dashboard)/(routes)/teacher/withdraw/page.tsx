import Integration from "@/components/integrations/Integration";
import { LeftSideBar } from "@/components/shared";
import NoTransaction from "@/components/shared/animations/NoTransaction";
import TransactionsHistory from "@/components/shared/TransactionsHistory";
import { getUserByClerkId } from "@/lib/actions";
import { IntegrationType } from "@/types";
import { TUser } from "@/types/models.types";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";
import TransactionsScreen from "./_components/TransactionsScreen";

const integrationData: IntegrationType = {
  icon: "/icons/stripe.svg",
  platform: "Stripe",
  description:
    "Connect your stripe account to withdraw your earnings, securely and easily. used by millions of businesses worldwide, stripe is the best way to receive payments online.",
  showCase: [
    "/icons/amazon.svg",
    "/icons/google.svg",
    "/icons/figma.svg",
    "/icons/shopify.svg",
    "/icons/notion.svg",
  ],
};

const WithdrawPage = async () => {
  const { userId } = auth();

  if (!userId) redirect("/sign-in");

  let user: TUser = {} as TUser;

  try {
    user = await getUserByClerkId({ clerkId: userId! });
  } catch (error: any) {
    console.log("error", error.message);
  }

  return (
    <div className="w-full h-full flex ">
      <LeftSideBar />
      <div className="flex-1  p-6 ">
        {!user.stripeId ? (
          <div className="w-[90%] md:w-[70%] mx-auto h-full flex flex-col gap-y-2 md:gap-y-6 ">
            <h1 className="text-3xl md:text-6xl leading-loose font-bold text-center ">
              No Account Connected
            </h1>
            <p className="w-[90%] md:w-[80%] mx-auto text-center text-slate-500 dark:text-slate-400 font-medium text-lg md:text-xl">
              Connect your account to any of the following platforms to withdraw
              your earnings
            </p>
            <Integration integrationData={integrationData} user={user} />
          </div>
        ) : (
          <TransactionsScreen user={user} integrationData={integrationData} />
        )}
      </div>
    </div>
  );
};

export default WithdrawPage;
