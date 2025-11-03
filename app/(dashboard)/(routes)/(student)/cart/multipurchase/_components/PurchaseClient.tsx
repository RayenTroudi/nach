"use client";
import React, { useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { TCourse } from "@/types/models.types";
import { Spinner } from "@/components/shared";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AlignCenterVertical } from "lucide-react";
import { CheckoutForm } from "@/app/(landing-page)/course/[courseId]/_components";
import axios from "axios";
import { useRouter } from "next/navigation";
import { scnToast } from "@/components/ui/use-toast";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY! as string
);

interface PurchaseClientProps {
  courses: TCourse[];
  clientSecret: string;
  currency: string;
  flouciSession: string | null;
  courseIds: string[];
}

const PurchaseClient = ({
  courses,
  clientSecret,
  currency,
  flouciSession,
  courseIds,
}: PurchaseClientProps) => {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const router = useRouter();

  if (!clientSecret) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Spinner size={100} />
      </div>
    );
  }

  const totalPriceInDinar = courses.reduce(
    (acc, course) => acc + (course.price ?? 0) * 3,
    0
  );

  const handlePurchaseWithFlouci = async () => {
    try {
      setIsPurchasing(true);

      const {
        data: { data },
      } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/payment_flouci`,
        {
          amount: totalPriceInDinar.toFixed(2),
          courseIds, // Include courseIds in the request
        }
      );

      router.push(data.link);
    } catch (error: any) {
      scnToast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="flex flex-col gap-y-2">
      {courses.map((course, index) => (
        <div key={index} className="flex gap-x-3">
          <Image
            src={course.thumbnail!}
            alt="course-thumbnail"
            width={120}
            height={150}
            className="rounded-sm w-[120px] lg:w-[150px] object-cover"
          />
          <div className="flex flex-1 flex-col gap-y-2 justify-between">
            <h2 className="text-sm md:text-xl font-bold line-clamp-2">
              {course.title}
            </h2>
            <div className="hidden md:flex gap-x-2 items-center w-full ">
              <p className="font-bold text-[12px] text-slate-500 flex gap-x-1 items-end">
                <span className="text-[#FF782D] text-sm flex items-center gap-x-1">
                  <AlignCenterVertical size={12} />
                  <span>{course.sections!.length}</span>
                </span>
                sections
              </p>
              <Separator orientation="vertical" className="h-[17px] w-[2px]" />
              <p className="flex items-center gap-x-1 font-bold text-[12px] text-slate-500">
                <Image
                  src={"/icons/level.svg"}
                  width={12}
                  height={12}
                  alt="level"
                  className="object-cover"
                />
                <span>
                  {course.level![0].toUpperCase()}
                  {course.level!.slice(1)}
                </span>
              </p>
              <Separator orientation="vertical" className="h-[17px] w-[2px]" />
              <p className="flex items-center gap-x-1 font-bold text-[12px] text-slate-500">
                <Image
                  src={"/icons/language.svg"}
                  width={12}
                  height={12}
                  alt="language"
                  className="object-cover"
                />
                <span>
                  {course.language![0].toUpperCase()}
                  {course.language!.slice(1)}
                </span>
              </p>
            </div>
            <div className="flex gap-x-2 items-center">
              <Image
                src={course.instructor.picture || "/images/default_profile.avif"}
                width={25}
                height={25}
                alt="instructor"
                className="rounded-full object-cover"
              />
              <p className="flex items-center gap-x-2 text-[12px] font-bold text-slate-700 dark:text-slate-400">
                {course.instructor.username}
              </p>
            </div>
          </div>
        </div>
      ))}
      <Separator />
      <Tabs defaultValue="stripe" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-fit">
          <TabsTrigger value="stripe" className="flex items-center gap-x-2">
            <Image
              src={"/icons/stripe.svg"}
              width={30}
              height={30}
              alt="stripe"
              className="object-cover rounded-none"
            />
            <p className="font-bold text-lg">Stripe</p>
          </TabsTrigger>
          <TabsTrigger value="flouci" className="flex items-center gap-x-2">
            <Image
              src={"/icons/tunisia-flag.svg"}
              width={30}
              height={30}
              alt="flouci"
              className="object-cover rounded-none"
            />
            <p className="relative font-bold text-lg">
              Flouci
              <span className="text-xs text-slate-500 absolute -top-1 -right-4 font-semibold">
                TN
              </span>
            </p>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="stripe">
          <Elements
            options={{
              clientSecret,
              appearance: {
                theme: "stripe",
              },
            }}
            stripe={stripePromise}
          >
            <CheckoutForm
              courses={courses}
              clientSecret={clientSecret}
              currency={currency}
            />
          </Elements>
        </TabsContent>
        <TabsContent value="flouci">
          <Button
            name="flouci"
            onClick={handlePurchaseWithFlouci}
            disabled={isPurchasing}
            className="w-full bg-slate-950 dark:bg-slate-200 dark:hover:opacity-90 transition-all duration-300 ease-in-out mt-2 rounded-sm text-md font-bold flex items-center justify-center"
          >
            <div className="flex items-center gap-x-2">
              {isPurchasing ? (
                <Spinner size={15} />
              ) : (
                <>
                  <p>Purchase -</p>
                  <p> {totalPriceInDinar.toFixed(2)} DT </p>
                  <Image
                    src={"/images/dinar.png"}
                    width={20}
                    height={20}
                    alt="dinar"
                    className="object-cover"
                  />
                </>
              )}
            </div>
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PurchaseClient;
