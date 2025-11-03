"use client";
import React, { FormEvent, useState, useMemo } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useTheme } from "@/contexts/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/shared";
import { studentCourseExists } from "@/lib/actions/purchase.action";
import { scnToast } from "@/components/ui/use-toast";
import { TCourse } from "@/types/models.types";

interface Props {
  courses: TCourse[];
  clientSecret: string;
  currency: string;
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY! as string
);

const CheckoutForm = ({ courses, clientSecret, currency }: Props) => {
  const { mode } = useTheme();
  const total = courses.reduce((acc, course) => acc + (course.price ?? 0), 0);
  return (
    <Elements
      options={{
        clientSecret,
        appearance: {
          theme: mode === "dark" ? "night" : "stripe",
          labels: "floating",
          variables: {
            colorBackground: mode === "dark" ? "#0f172a" : "#f1f5f9",
            colorPrimary: "#FF782D",
            colorText: mode === "dark" ? "#f8fafc" : "#020617",
          },
        },
      }}
      stripe={stripePromise}
    >
      <Form
        courseIds={courses.map((course) => course._id)}
        total={total}
        currency={currency}
      />
    </Elements>
  );
};

export default CheckoutForm;

interface FormProps {
  courseIds: string[];
  total: number;
  currency: string;
}

const Form = ({ courseIds, total, currency }: FormProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const stripe = useStripe();
  const elements = useElements();
  const memoizedPaymentElement = useMemo(() => <PaymentElement />, []);

  const onSubmitHandler = (e: FormEvent) => {
    e.preventDefault();
    if (stripe === null || elements === null) return;
    setIsLoading(true);

    // Check for existing student enrolled courses
    const alreadyPurchased = courseIds.some(
      (courseId) => !studentCourseExists(courseId)
    );
    if (alreadyPurchased) {
      setErrorMessage(
        "You have already purchased one or more of these courses, please check your learning page."
      );
      setIsLoading(false);
      scnToast({
        variant: "warning",
        title: "Warning!",
        description:
          "You have already purchased one or more of these courses, please check your learning page.",
      });
      return;
    }

    stripe
      .confirmPayment({
        elements,
        confirmParams: {
          return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/stripe/purchase`,
        },
      })
      .then(({ error }) => {
        if (error) {
          if (
            error.type === "card_error" ||
            error.type === "validation_error"
          ) {
            setErrorMessage(error.message!);
          } else {
            setErrorMessage("An unknown error occurred. Please try again.");
          }
        }
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <form onSubmit={onSubmitHandler}>
      {memoizedPaymentElement}
      {errorMessage && (
        <p className="text-sm text-red-600 mt-2">{errorMessage}</p>
      )}
      <Button
        type="submit"
        disabled={stripe === null || elements === null || isLoading}
        className="w-full bg-slate-950 dark:bg-slate-200 dark:hover:opacity-90 transition-all duration-300 ease-in-out mt-2 rounded-sm text-md font-bold"
      >
        {isLoading ? (
          <Spinner size={15} />
        ) : (
          `Purchase - ${currency}${total.toFixed(2)}`
        )}
      </Button>
    </form>
  );
};
