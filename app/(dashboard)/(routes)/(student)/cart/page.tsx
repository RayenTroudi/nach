"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from "react";
import dynamicImport from "next/dynamic";
import { LeftSideBar } from "@/components/shared";
const EmptyCartAnimation = dynamicImport(() => import("@/components/shared/animations/EmptyCart"), { ssr: false });
import { Button } from "@/components/ui/button";
import { TCourse } from "@/types/models.types";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import CourseCard from "./_components/CourseCard";
import { Separator } from "@/components/ui/separator";
import { CreditCard } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import axios from "axios";
import { useRouter } from "next/navigation";
import { scnToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/shared";
import { useTranslations } from "next-intl";

const CartPage = () => {
  const t = useTranslations("dashboard.student.cart");
  const { cartItems } = useCart();
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [courseIds, setCourseIds] = useState<string[]>([]);

  useEffect(() => {
    const ids = cartItems.map((item) => item._id);
    setCourseIds(ids);
  }, [cartItems]);

  const total = cartItems.reduce((acc, item) => acc + (item.price || 0), 0);
  const totalInDinar = total * 3.3;

  const handleCheckout = async () => {
    if (courseIds.length === 0) {
      console.error("No course IDs found");
      return;
    }

    try {
      setIsPurchasing(true);
      const {
        data: { data },
      } = await axios.post(
        "/api/payment_flouci",
        {
          amount: totalInDinar.toFixed(2),
          courseIds,
        }
      );

      router.push(data.link);
    } catch (error: any) {
      console.error("Error during checkout:", error);
      scnToast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to process checkout",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="flex gap-4">
      <LeftSideBar />
      <div className="flex flex-col lg:flex-row w-full">
        <div className="p-6 w-full">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center">
              <EmptyCartAnimation className="h-[300px] md:h-[500px]" />
              <h1 className="text-center text-xl md:text-3xl text-slate-950 dark:text-slate-50 font-bold">
                {t("noCoursesInCart")}
              </h1>
              <Link href={"/"} className="w-full md:w-1/2 md:mx-auto">
                <Button className="w-full bg-brand-red-500 rounded-sm font-bold text-slate-50 mt-2 hover:opacity-90 hover:bg-brand-red-600 duration-300 transition-all ease-in-out">
                  {t("startBrowsing")}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-y-3">
              <div className="w-full flex items-center justify-between py-3">
                <h2 className="text-3xl font-bold text-slate-950 dark:text-slate-200">
                  {cartItems.length} {cartItems.length > 1 ? t("courses") : t("course")} {t("coursesInCart")}
                </h2>

                <Button
                  className="bg-brand-red-500 hover:bg-brand-red-600 flex items-center justify-center gap-x-2 text-slate-50 font-bold"
                  onClick={handleCheckout}
                  disabled={isPurchasing}
                >
                  {isPurchasing ? (
                    <Spinner size={20} />
                  ) : (
                    <>
                      <CreditCard size={20} />
                      <span>{t("checkoutWithFlouci")}</span>
                    </>
                  )}
                </Button>
              </div>
              <Separator />
              <div className="w-full flex flex-col gap-y-6 p-2">
                {cartItems.map((course: TCourse, index: number) => (
                  <Link
                    key={index}
                    href={`/course/${course._id}`}
                    className="relative"
                  >
                    <CourseCard course={course} />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;
