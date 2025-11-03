"use client";

import { Banner, Footer, Spinner } from "@/components/shared";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { scnToast } from "@/components/ui/use-toast";
import { getCourseById, getUserByClerkId } from "@/lib/actions";
import {
  createPurchase,
  studentCourseExists,
} from "@/lib/actions/purchase.action";
import { TCourse, TUser } from "@/types/models.types";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { ArrowUpRightFromCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import ProtectedRoute from "@/components/shared/ProtectedRoute";

const FlouciPurchaseSuccessPage = () => {
  const { userId } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();

  const [purchasedCourses, setPurchasedCourses] = useState<TCourse[]>([]);
  const [mongoDbUser, setMongoDbUser] = useState<TUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const courseIdsParam = searchParams.get("courseIds");
        const paymentId = searchParams.get("payment_id");

        if (!courseIdsParam || !paymentId) {
          throw new Error(
            "Missing courseIds or payment_id in the URL parameters"
          );
        }

        const courseIds = courseIdsParam.split(",");

        console.log("Course IDs from URL:", courseIds);
        console.log("Payment ID from URL:", paymentId);

        const alreadyPurchasedCourses = await Promise.all(
          courseIds.map((courseId) => studentCourseExists(courseId))
        );

        console.log("Already purchased courses:", alreadyPurchasedCourses);

        const notPurchasedCourseIds = courseIds.filter(
          (courseId, index) => !alreadyPurchasedCourses[index]
        );

        if (notPurchasedCourseIds.length === 0) {
          return router.push(`/my-learning`);
        }

        const {
          data: { success, result },
        } = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/payment_flouci/verify_payment`,
          { paymentId }
        );

        console.log("Verification result:", result);

        if (!success || result.status !== "SUCCESS") {
          scnToast({
            title: "Payment Failed",
            description: "Your payment was not successful",
            variant: "destructive",
          });

          return router.push(`/`);
        }

        const user: TUser = await getUserByClerkId({ clerkId: userId! });
        console.log("User fetched from database:", user);
        setMongoDbUser(user);

        const courses: TCourse[] = await Promise.all(
          notPurchasedCourseIds.map((courseId) => getCourseById({ courseId }))
        );

        console.log("Courses fetched from database:", courses);

        setPurchasedCourses(courses);

        await Promise.all(
          courses.map((course) =>
            createPurchase({
              courseId: course._id,
              userId: user._id!,
            })
          )
        );

        clearCart(); // Clear the cart after successful purchase

        setLoading(false);
      } catch (error: any) {
        console.error("Error during verification:", error);
        scnToast({
          title: "Payment Failed",
          description: "Your payment was not successful",
          variant: "destructive",
        });
        setLoading(false);
        router.push(`/`);
      }
    };

    verifyPayment();
  }, [searchParams, router, userId, clearCart]);

  if (loading) {
    return (
      <div className="absolute top-0 left-0 bottom-0 w-full h-full flex items-center justify-center">
        <Spinner size={100} />
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ProtectedRoute user={mongoDbUser!}>
        <Banner
          label={`Hey ${mongoDbUser?.username!}, Congratulations on your purchase. The following course(s) are now available in your learning list.`}
          variant={"success"}
        />
        <div className="p-4">
          {purchasedCourses.map((course) => (
            <div
              key={course._id}
              className="w-full md:w-[800px] lg:w-[1000px] mx-auto mt-4 rounded-md border border-input"
            >
              <div className="flex flex-col gap-y-2 md:flex-row md:gap-x-4">
                <Image
                  src={course?.thumbnail!}
                  alt={course?.title!}
                  width={400}
                  height={200}
                  className="w-full h-[200px] md:w-[400px] md:h-[200px] object-cover"
                />
                <div className="flex flex-col justify-around gap-y-4 p-4 md:p-0">
                  <h1 className="text-lg font-bold md:text-2xl lg:text-4xl">
                    {course.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-2">
                    <div className="flex items-center gap-x-2 text-slate-500 font-semibold text-[11px] md:text-md">
                      <Image
                        src="/icons/level.svg"
                        alt="level"
                        width={16}
                        height={16}
                      />
                      <span>
                        {course.level![0].toUpperCase()}
                        {course.level!.slice(1)}
                      </span>
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-x-2 text-slate-500 font-semibold text-[11px] md:text-md">
                      <Image
                        src="/icons/sections.svg"
                        alt="sections"
                        width={16}
                        height={16}
                      />
                      <span>
                        <span className="text-[#FF782D]">
                          {course.sections!.length}
                        </span>
                        Section(s)
                      </span>
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-x-2 text-slate-500 font-semibold text-[11px] md:text-md">
                      <Image
                        src="/icons/students.svg"
                        alt="students"
                        width={16}
                        height={16}
                      />
                      <span>
                        <span className="text-[#FF782D]">
                          {course.students!.length}
                        </span>
                        Student(s)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-x-2">
                    <Image
                      src={course.instructor.picture || "/images/default_profile.avif"}
                      alt={course.instructor.username!}
                      width={40}
                      height={40}
                      className="rounded-md object-cover"
                    />
                    <div className="text-slate-500 font-semibold flex items-center gap-x-1 text-[11px] md:text-md">
                      <span className="text-[#FF782D] font-bold">
                        {course.instructor.username}
                      </span>
                      <div className="w-fit px-4 py-1 text-[11px] font-bold rounded-full bg-blue-700/20 text-center text-blue-700">
                        Instructor
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Link href={`/my-learning`}>
                <Button className="w-full rounded-none rounded-b-sm mt-2 flex items-center gap-x-2">
                  <span>Start your learning journey</span>
                  <ArrowUpRightFromCircle size={15} />
                </Button>
              </Link>
            </div>
          ))}
        </div>
        <Footer />
      </ProtectedRoute>
    </div>
  );
};

export default FlouciPurchaseSuccessPage;
