"use client";

import React, { useState, useEffect } from "react";
import { LeftSideBar } from "@/components/shared";
import EmptyCartAnimation from "@/components/shared/animations/EmptyCart";
import { Button } from "@/components/ui/button";
import { TCourse } from "@/types/models.types";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import CourseCard from "./_components/CourseCard";
import { Separator } from "@/components/ui/separator";
import { CreditCard } from "lucide-react";
import PurchaseClient from "./multipurchase/_components/PurchaseClient";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import axios from "axios";

const CartPage = () => {
  const { cartItems } = useCart();
  const [showDialog, setShowDialog] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [courses, setCourses] = useState<TCourse[]>([]);
  const [currency, setCurrency] = useState<string>("USD");
  const [flouciSession, setFlouciSession] = useState<string | null>(null);
  const [courseIds, setCourseIds] = useState<string[]>([]);

  useEffect(() => {
    const ids = cartItems.map((item) => item._id);
    setCourseIds(ids);
    setCourses(cartItems);
  }, [cartItems]);

  const total = cartItems.reduce((acc, item) => acc + (item.price || 0), 0);

  const handleCheckout = async () => {
    if (courseIds.length === 0) {
      console.error("No course IDs found");
      return;
    }

    try {
      const { data } = await axios.post("/api/payment_stripe", {
        amount: total,
        courseIds,
      });
      setClientSecret(data.clientSecret);

      const flouciResponse = await axios.post("/api/payment_flouci", {
        amount: total.toFixed(2),
        courseIds,
      });
      const flouciData = flouciResponse.data;
      if (flouciData.data) {
        setFlouciSession(flouciData.data.payment_link);
      } else {
        console.error("No payment link returned from Flouci");
      }

      setShowDialog(true);
    } catch (error) {
      console.error("Error during checkout:", error);
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
                No Courses In Your Cart.
              </h1>
              <Link href={"/"} className="w-full md:w-1/2 md:mx-auto">
                <Button className="w-full bg-[#FF782D] rounded-sm font-bold text-slate-50 mt-2 hover:opacity-90 hover:bg-[#FF782D] duration-300 transition-all ease-in-out">
                  Start Browsing
                </Button>
              </Link>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-y-3">
              <div className="w-full flex items-center justify-between py-3">
                <h2 className="text-3xl font-bold text-slate-950 dark:text-slate-200">
                  {cartItems.length} Course{cartItems.length > 1 && "s"} In Your
                  Cart
                </h2>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-primaryColor hover:bg-primaryColor flex items-center justify-center gap-x-2 text-slate-50 font-bold"
                      onClick={handleCheckout}
                    >
                      <CreditCard size={20} />
                      <span>Checkout</span>
                    </Button>
                  </DialogTrigger>
                  {showDialog && clientSecret && (
                    <DialogContent className="sm:max-w-[425px] md:max-w-[625px] p-6 bg-slate-100 dark:bg-slate-950">
                      <PurchaseClient
                        courses={courses}
                        clientSecret={clientSecret}
                        currency={currency}
                        flouciSession={flouciSession}
                        courseIds={courseIds}
                      />
                    </DialogContent>
                  )}
                </Dialog>
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
