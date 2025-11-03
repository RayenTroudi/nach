"use server";

import { auth } from "@clerk/nextjs";
import React from "react";
import Stripe from "stripe";
import { Banner, Footer } from "@/components/shared";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpRightFromCircle, XCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { TCourse, TUser } from "@/types/models.types";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { getCourseById, getUserByClerkId } from "@/lib/actions";
import { createPurchase } from "@/lib/actions/purchase.action";
import ClientRemovePurchasedCourses from "./_components/ClientRemovePurchasedCourses";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY! as string);

const StripePurchasePage = async ({
  searchParams,
}: {
  searchParams: { payment_intent: string };
}) => {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  let courses: TCourse[] = [];
  let coursesIds: string[] = [];
  let user: TUser = {} as TUser;
  let paymentIntent: any = null;
  let isSuccess: boolean = false;

  try {
    user = await getUserByClerkId({ clerkId: userId! });

    paymentIntent = await stripe.paymentIntents.retrieve(
      searchParams.payment_intent
    );

    if (!paymentIntent) {
      throw new Error("Payment intent not found.");
    }

    if (!paymentIntent?.metadata?.courseId) {
      throw new Error("No course IDs found in payment intent metadata.");
    }

    const courseIds = paymentIntent.metadata.courseId.split(",");

    for (const courseId of courseIds) {
      const course = await getCourseById({ courseId });
      if (course) {
        courses.push(course);
        coursesIds.push(courseId);
      } else {
        throw new Error("Course not found");
      }
    }

    if (courses.length === 0) throw new Error("Courses not found");

    isSuccess = paymentIntent.status === "succeeded";

    if (isSuccess) {
      for (const courseId of courseIds) {
        await createPurchase({
          courseId,
          userId: user._id,
        });
      }
    }
  } catch (error: any) {}

  return (
    <ProtectedRoute user={user}>
      <Banner
        label={`Hey ${user.username}, Congratulations on your purchase. The following courses are now available in your learning list.`}
        variant={"success"}
      />
      <div className="p-4">
        <div className="w-full md:w-[800px] lg:w-[1000px] mx-auto mt-4 rounded-md border border-input">
          {isSuccess ? (
            <>
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="flex flex-col gap-y-2 md:flex-row md:gap-x-4"
                >
                  <Image
                    src={course?.thumbnail!}
                    alt={course?.title}
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
              ))}
              <ClientRemovePurchasedCourses />
              <Link href={`/my-learning`}>
                <Button className="w-full rounded-none rounded-b-sm mt-2 flex items-center gap-x-2">
                  <span>Start your learning journey</span>
                  <ArrowUpRightFromCircle size={15} />
                </Button>
              </Link>
            </>
          ) : (
            <Link href={`/cart`}>
              <Button className="w-full rounded-none rounded-b-sm mt-2 flex items-center gap-x-2">
                <span>Try Purchase Again</span>
                <XCircle size={15} />
              </Button>
            </Link>
          )}
        </div>
      </div>
      <Footer />
    </ProtectedRoute>
  );
};

export default StripePurchasePage;
