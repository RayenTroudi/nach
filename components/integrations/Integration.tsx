"use client";
import { IntegrationType } from "@/types";
import Image from "next/image";

import IntegrationModal from "./IntegrationModal";
import { TUser } from "@/types/models.types";
import { cn } from "@/lib/utils";
import ConnectButton from "./ConnectButton";
import {
  AtSign,
  CheckCircle2Icon,
  CircleDollarSign,
  FingerprintIcon,
  LucideIcon,
  User,
  WalletIcon,
} from "lucide-react";
import { Separator } from "../ui/separator";

type Props = {
  integrationData: IntegrationType;
  user: TUser;
  alreadyConnected?: boolean;
};

import { scnToast } from "../ui/use-toast";
import { usePageLoader } from "@/contexts/PageLoaderProvider";
import { useRouter } from "next/navigation";
import { createWithdrawTransaction } from "@/lib/actions/withdraw-transactions";

const InstructorStripeAccountInformation = ({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) => {
  return (
    <div className="flex flex-col gap-y-1 w-full px-4 py-2 border rounded-md line-clamp-1">
      <div className="flex items-center gap-2">
        <Icon size={20} />
        <p className="font-semibold text-md">{label}</p>
      </div>
      <span className=" pl-2 font-thin">{value}</span>
    </div>
  );
};

const Integration = ({
  integrationData,
  user,
  alreadyConnected = false,
}: Props) => {
  const { setIsLoading } = usePageLoader();
  const router = useRouter();
  const onWithdrawEarnings = async () => {
    try {
      setIsLoading(true);

      console.log(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/stripe/transfer`);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/stripe/transfer`,
        {
          method: "POST",
          body: JSON.stringify({
            instructor: user,
            amount: user.wallet,
          }),
        }
      );

      const { status, message, data } = await response.json();

      if (status === "error") {
        throw new Error(message);
      }

      const withdrawTransaction = await createWithdrawTransaction({
        user: user._id,
        amount: data.amount / 100,
        stripeId: user.stripeId!,
        transferId: data.id,
      });

      scnToast({
        title: "Success",
        description: "Withdrawal successful.",
        variant: "success",
      });

      console.log(data);
    } catch (error: any) {
      scnToast({
        title: "Error",
        description:
          "An error occurred when creating the transfer. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);

        router.refresh();
      }, 500);
    }
  };
  return (
    <div
      className={cn(
        "w-full   min-h-[100px] p-4 rounded-md animate-shimmer bg-[linear-gradient(110deg,#ffffff,45%,#ede9fe,55%,#ffffff)]  dark:bg-[linear-gradient(110deg,#0f172a,45%,#3c07647a,55%,#0f172a)] bg-[length:200%_100%] bg-white border shadow-lg dark:bg-slate-900  flex justify-between"
      )}
    >
      <div className="flex flex-1 flex-col gap-y-4 justify-between ">
        <div className="w-full flex items-center justify-between ">
          <div className="flex items-center gap-2">
            <Image
              src={integrationData.icon}
              alt={integrationData.platform}
              width={50}
              height={50}
            />
            <p className="font-bold text-2xl md:text-3xl ">
              {integrationData.platform}
            </p>
          </div>

          {alreadyConnected ? (
            <>
              <ConnectButton
                icon={CheckCircle2Icon}
                buttonTitle="connected"
                buttonClassName="pointer-events-none text-green-600 bg-transparent rounded-md"
                isConnected={true}
              />

              <CheckCircle2Icon
                size={30}
                className="text-green-600 md:hidden"
              />
            </>
          ) : (
            <IntegrationModal
              buttonClassName="hidden md:block"
              {...integrationData}
              user={user}
            />
          )}
        </div>

        {alreadyConnected ? (
          <>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InstructorStripeAccountInformation
                icon={FingerprintIcon}
                value={user.stripeId!}
                label="Stripe Account ID"
              />
              <InstructorStripeAccountInformation
                icon={AtSign}
                value={user.email!}
                label="User Email"
              />
              <InstructorStripeAccountInformation
                icon={User}
                value={user.username!}
                label="User name"
              />
              <InstructorStripeAccountInformation
                icon={WalletIcon}
                value={`$ ${user.wallet!.toFixed(2)}`}
                label="Wallet Balance"
              />
            </div>

            <IntegrationModal
              buttonClassName={cn(
                "block md:block",
                user.wallet! === 0 || user.wallet! < 50
                  ? "pointer-events-none text-slate-500"
                  : ""
              )}
              buttonIcon={CircleDollarSign}
              buttonText={
                user.wallet! === 0
                  ? "No money to withdraw"
                  : user.wallet! < 50
                  ? "Minimum amount is $50"
                  : "Withdraw Money"
              }
              {...integrationData}
              description="Withdraw your earnings from your stripe account to your bank account."
              user={user}
            >
              <ConnectButton
                icon={CircleDollarSign}
                buttonTitle={
                  user.wallet! === 0
                    ? "No money to withdraw"
                    : user.wallet! < 50
                    ? "Minimum amount is $50"
                    : "Withdraw Money"
                }
                buttonClassName={cn(
                  "block md:block",
                  user.wallet === 0 || user.wallet! < 50
                    ? "pointer-events-none text-slate-500"
                    : ""
                )}
                onClick={onWithdrawEarnings}
                disabled={user.wallet === 0}
              />
            </IntegrationModal>
          </>
        ) : null}

        <div className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 font-thin line-clamp-3">
          {alreadyConnected ? null : integrationData.description}
        </div>

        {!alreadyConnected ? (
          <IntegrationModal
            buttonClassName="block md:hidden"
            {...integrationData}
            user={user}
          />
        ) : null}
      </div>
    </div>
  );
};

export default Integration;
