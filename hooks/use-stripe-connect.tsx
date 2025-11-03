"use client";
import { scnToast } from "@/components/ui/use-toast";
import { usePageLoader } from "@/contexts/PageLoaderProvider";
import { TUser } from "@/types/models.types";
import { useState } from "react";

export const useStripeConnect = (user: TUser) => {
  const { setIsLoading } = usePageLoader();
  const [stripeAccountPending, setStripeAccountPending] =
    useState<boolean>(false);

  const onStripeConnect = async () => {
    try {
      setStripeAccountPending(true);
      setIsLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/stripe/connect`,
        {
          method: "POST",

          body: JSON.stringify({
            user: user,
          }),
        }
      );

      if (res) {
        setStripeAccountPending(false);
        setIsLoading(false);

        const { status, message, data } = await res.json();

        if (status === "success") {
          scnToast({
            title: "Stripe Connected Successfully",
            description: "You have successfully connected your Stripe account",
            variant: "success",
          });

          window.location.href = data.url;
        } else {
          console.log("Stripe Connect Error", message);
          scnToast({
            title: "Error in Stripe Connection",
            description: "There was an error connecting your Stripe account",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      scnToast({
        title: "Error in Stripe Connection",
        description: "There was an error connecting your Stripe account",
        variant: "destructive",
      });
      console.log("Error in Stripe Connection", error.message);
    }
  };

  return { onStripeConnect, stripeAccountPending };
};
