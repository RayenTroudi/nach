"use client";
import React from "react";

import {
  AlertDialog, AlertDialogCancel,
  AlertDialogContent, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { CloudIcon, LucideIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { Separator } from "../ui/separator";
import Marquee from "../magicui/marquee";
import { Button } from "../ui/button";
import ConnectButton from "./ConnectButton";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStripeConnect } from "@/hooks/use-stripe-connect";
import { TUser } from "@/types/models.types";
import { usePageLoader } from "@/contexts/PageLoaderProvider";
import { HashLoader } from "react-spinners";

type Props = {
  icon: string;
  platform: string;
  description: string;
  showCase?: string[];
  buttonClassName?: string;
  user: TUser;
  buttonIcon?: LucideIcon;
  buttonText?: string;
  children?: React.ReactNode;
};

const IntegrationModal = ({
  icon,
  platform,
  description,
  showCase,
  buttonClassName,
  user,
  children,
  buttonIcon: ButtonIcon = CloudIcon,
  buttonText = "connect",
}: Props) => {
  const { isLoading } = usePageLoader();
  const router = useRouter();
  const { onStripeConnect, stripeAccountPending } = useStripeConnect(user);
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <ConnectButton
          icon={ButtonIcon}
          buttonTitle={buttonText}
          buttonClassName={buttonClassName}
        />
      </AlertDialogTrigger>
      <AlertDialogContent className={` `}>
        {isLoading || stripeAccountPending ? (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <HashLoader color="#FF782D" size={50} />
          </div>
        ) : null}
        <div
          className={`w-[90%] mx-auto flex flex-col gap-y-8 ${
            isLoading || stripeAccountPending ? "blur-sm" : ""
          }`}
        >
          <div className="flex items-center justify-center gap-x-4">
            <Image
              src={`/icons/logo.svg`}
              alt={platform}
              width={60}
              height={60}
              className="rounded-md"
            />

            <div className="flex flex-col gap-y-2">
              <IconArrowRight size={20} />
              <IconArrowLeft size={20} />
            </div>

            <Image
              src={icon}
              alt={platform}
              width={60}
              height={60}
              className="rounded-md"
            />
          </div>

          <Separator />

          <p className="text-md text-center tracking-widest line-clamp-4">
            {description}
          </p>

          {!showCase || !showCase?.length ? null : (
            <Marquee
              className="[--duration:20s] w-[80%] mx-auto flex items-center"
              pauseOnHover
            >
              {showCase?.map((icon, index) => (
                <Image
                  key={index}
                  src={icon}
                  alt={platform}
                  width={40}
                  height={40}
                  className="rounded-md"
                />
              ))}
            </Marquee>
          )}

          <Separator />

          <AlertDialogCancel className="rounded-full size-[30px] hover:bg-transparent bg-transparent border-none absolute top-0 right-0">
            <XIcon size={20} className="flex-shrink-0" />
          </AlertDialogCancel>

          <div className="w-full flex items-center justify-between">
            <Link href={"https://stripe.com/"} target="_blank">
              <Button
                variant={"outline"}
                disabled={isLoading || stripeAccountPending}
              >
                Learn more
              </Button>
            </Link>
            {children ? (
              children
            ) : (
              <ConnectButton
                icon={CloudIcon}
                buttonTitle={
                  stripeAccountPending ? "Connecting..." : "Connect to stripe"
                }
                disabled={stripeAccountPending || isLoading}
                onClick={onStripeConnect}
              />
            )}
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default IntegrationModal;
