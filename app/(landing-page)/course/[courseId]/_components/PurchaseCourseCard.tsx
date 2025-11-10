"use client";
import {
  AlignCenterVertical,
  LucideHeart,
  Video as LucideVideo,
} from "lucide-react";

import { Spinner } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { transformCurrencyToSymbol } from "@/lib/utils";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { TCourse, TSection, TVideo } from "@/types/models.types";
import { scnToast } from "@/components/ui/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import BankTransferUpload from "./BankTransferUpload";

import { VidSyncPlayer } from "vidsync";

interface Props {
  course: TCourse;
  isEnrolled: boolean;
  isCourseOwner: boolean;
}

const PurchaseCourseCard = ({
  course,
  isEnrolled,
  isCourseOwner,
}: Props) => {
  const router = useRouter();
  
  // Move all hooks to the top, before any conditional returns
  const { addToCart, removeFromCart, cartItems } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [videoToPreview, setVideoToPreview] = useState<TVideo | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFilled, setIsFilled] = useState(false);
  const { user } = useUser();
  const [isInCart, setIsInCart] = useState(false);

  // Update wishlist and cart state when they change
  useEffect(() => {
    if (course) {
      setIsFilled(wishlist.some((item: TCourse) => item._id === course._id));
      setIsInCart(cartItems.some((item: TCourse) => item._id === course._id));
    }
  }, [wishlist, cartItems, course]);
  
  // Add null check for course - AFTER all hooks
  if (!course || !course._id) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">Course not found</p>
          <p className="text-slate-600 dark:text-slate-400">
            The course you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button
            onClick={() => router.push("/courses")}
            className="mt-4 bg-brand-red-500 hover:bg-brand-red-600"
          >
            Browse Courses
          </Button>
        </div>
      </div>
    );
  }
  
  const priceInDinar = course.price! * 3.3;
  const toggleHeart = () => {
    if (user === null) {
      console.log("the user", user);
      return router.push("/sign-in");
    }
    if (isFilled) {
      removeFromWishlist(course._id);
      setIsFilled(false);
    } else {
      addToWishlist(course);
      setIsFilled(true);
    }
  };

  const allVideos =
    course?.sections?.map((section: TSection) => section.videos).flat() ?? [];
  const allFreeVideos = allVideos.filter(
    (video: TVideo | undefined) => video?.isFree
  );

  const onChangeVideoToPreviewHandler = (video: TVideo) => {
    setIsLoading(true);
    setVideoToPreview(video);
    setTimeout(() => {
      setIsLoading(false);
      router.refresh();
    }, 1000);
  };

  const handleAddToCart = () => {
    if (user === null) {
      return router.push("/sign-in");
    }
    if (isInCart) {
      removeFromCart(course._id);
      setIsInCart(false);
      scnToast({
        variant: "success",
        title: "Removed from Cart",
        description: "This course has been removed from your cart.",
      });
    } else {
      addToCart(course);
      setIsInCart(true);
      scnToast({
        variant: "success",
        title: "Added to Cart",
        description: "This course has been added to your cart.",
      });
    }
  };

  return (
    <div className="w-full lg:w-[350px] min-h-[400px] lg:fixed lg:top-24 lg:right-24 flex flex-col gap-y-4 shadow-xl  z-50 p-2 lg:bg-slate-50 lg:dark:bg-slate-900 rounded-md">
      {isLoading ? (
        <div className="rounded-md w-full h-[187px] bg-slate-200 dark:bg-slate-900 lg:dark:bg-slate-950 flex items-center justify-center">
          <Spinner size={50} />
        </div>
      ) : (
        <VidSyncPlayer
          src={
            videoToPreview
              ? videoToPreview.videoUrl!
              : allFreeVideos[0]?.videoUrl || course?.thumbnail || ""
          }
          poster={course?.thumbnail!}
          containerStyles={{
            borderRadius: "none !important",
          }}
          videoStyles={{
            borderRadius: "none !important",
          }}
        />
      )}

      <div className="flex flex-col gap-y-2">
        <div className="w-full flex items-center justify-between">
          <Image
            src={course.thumbnail!}
            alt="course-thumbnail"
            width={100}
            height={67}
            className="rounded-sm"
            style={{ width: 'auto', height: 'auto', maxWidth: '100px' }}
          />
          {course!.price! > 0 ? (
            <div className="flex gap-x-1 items-center ">
              <p className="text-3xl font-bold ">
                {transformCurrencyToSymbol(course?.currency!.toUpperCase())}
              </p>
              <p className="text-2xl font-bold ">{course.price} </p>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between">
              <p className="text-xl font-bold">Get it now</p>
              <p className="text-lg font-semibold text-[#16a34a]">Free</p>
            </div>
          )}
        </div>
        <Separator />

        {allFreeVideos.length > 0 && (
          <div className="w-full flex flex-col gap-y-1">
            <h2 className="text-lg text-slate-800 dark:text-slate-200 font-bold mb-2">
              Videos For Preview
            </h2>
            {allFreeVideos.map((video: TVideo | undefined, key: number) => (
              <div
                onClick={() => onChangeVideoToPreviewHandler(video!)}
              key={key}
              className={` w-full px-3 py-2 rounded-sm flex items-center gap-x-2 hover:bg-slate-200/30 dark:hover:bg-slate-950/30 cursor-pointer
            ${
              videoToPreview
                ? videoToPreview._id === video?._id
                  ? "bg-slate-200/50 dark:bg-slate-900 dark:lg:bg-slate-950 duration-300 ease-in-out pointer-events-none"
                  : ""
                : allFreeVideos[0]?._id === video?._id
                ? "bg-slate-200/50 dark:bg-slate-900 dark:lg:bg-slate-950 duration-300 ease-in-out pointer-events-none"
                : ""
            }

            `}
            >
              <LucideVideo
                size={20}
                className="text-slate-800 dark:text-slate-300"
              />
              <p className="text-[12px] text-slate-800 dark:text-slate-300 font-bold">
                {" "}
                {video?.title}{" "}
              </p>
            </div>
          ))}
          </div>
        )}
        {course.price! > 0 ? (
          <div className=" w-full flex flex-col gap-y-1 mt-5">
            {!isCourseOwner && !isEnrolled ? (
              <div className="flex items-center justify-center space-x-4  rounded-md">
                <Button
                  name="add-to-cart"
                  className="bg-brand-red-500 w-full text-lg font-bold text-white hover:bg-brand-red-600 hover:shadow-button-hover duration-300 ease-in-out rounded-button shadow-button"
                  onClick={handleAddToCart}
                >
                  {isInCart ? "Remove from cart" : "Add to cart"}
                </Button>

                <Button
                  name="add-to-wishlist"
                  onClick={toggleHeart}
                  className="bg-red-500 hover:bg-red-500"
                >
                  <LucideHeart
                    onClick={toggleHeart}
                    size={24}
                    fill={isFilled ? "white" : "none"}
                    stroke={isFilled ? "transparent" : "currentColor"}
                    className="cursor-pointer text-white hover:fill-white transition-all duration-300 ease-in-out"
                  />
                </Button>
              </div>
            ) : null}
            <SignedIn>
              {isCourseOwner ? (
                <div className="mt-2  w-full flex flex-col gap-y-1">
                  <Link href={`/my-learning/${course._id}`}>
                    <Button
                      name="watch-course"
                      className="w-full bg-brand-red-500 hover:bg-brand-red-600 hover:shadow-button-hover text-white transition-all duration-300 ease-in-out rounded-button shadow-button text-md font-bold"
                    >
                      Watch your course
                    </Button>
                  </Link>

                  <Link href={`/teacher/courses/manage/${course._id}`}>
                    <Button
                      name="manage-course"
                      className="w-full bg-slate-950 dark:bg-slate-200 dark:hover:opacity-90 transition-all duration-300 ease-in-out  rounded-sm text-md font-bold"
                    >
                      Manage your course
                    </Button>
                  </Link>
                </div>
              ) : isEnrolled ? (
                <Link href={`/my-learning/${course._id}`}>
                  <Button
                    name="continue_learning"
                    className="w-full bg-slate-950 dark:bg-slate-200 dark:hover:opacity-90 transition-all mt2 duration-300 ease-in-out rounded-sm text-md font-bold"
                  >
                    Continue Learning
                  </Button>
                </Link>
              ) : (
                <>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild className="">
                      <Button
                        name="buy-now"
                        className="w-full bg-slate-950 dark:bg-slate-200 dark:hover:opacity-90 transition-all duration-300 ease-in-out  mt-2 rounded-sm text-md font-bold"
                      >
                        Buy now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] md:max-w-[700px] p-6 bg-slate-100 dark:bg-slate-950 max-h-[90vh] overflow-y-auto">
                      <div className="flex flex-col gap-y-4">
                        <h2 className="text-2xl font-bold">Complete Your Purchase</h2>
                        
                        <div className="flex gap-x-3 p-4 bg-white dark:bg-slate-900 rounded-lg">
                          <Image
                            src={course.thumbnail!}
                            alt="course-thumbnail"
                            width={100}
                            height={75}
                            className="rounded-sm object-cover"
                          />
                          <div className="flex flex-1 flex-col gap-y-1">
                            <h3 className="text-sm md:text-base font-semibold">
                              {course.title}
                            </h3>
                            <div className="flex items-center gap-x-2">
                              <Image
                                src={course.instructor.picture || "/images/default_profile.avif"}
                                width={20}
                                height={20}
                                alt="instructor"
                                className="rounded-full object-cover"
                              />
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                {course.instructor.username}
                              </p>
                            </div>
                            <div className="flex items-center gap-x-2 mt-1">
                              <p className="text-xl font-bold text-brand-red-500">
                                {priceInDinar.toFixed(2)} DT
                              </p>
                              <Image
                                src={"/icons/tunisia-flag.svg"}
                                width={24}
                                height={24}
                                alt="tunisia"
                                className="object-cover rounded-none"
                              />
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <BankTransferUpload
                          courseIds={[course._id]}
                          amount={priceInDinar}
                          onSuccess={() => {
                            setIsDialogOpen(false);
                            scnToast({
                              variant: "success",
                              title: "Upload Successful",
                              description: "Your payment proof has been submitted. You&apos;ll receive an email once it&apos;s reviewed.",
                            });
                            router.refresh();
                          }}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </SignedIn>
            <SignedOut>
              <Separator className="h-[3px] mt-2 mb-2" />
              <div className="w-full flex flex-col gap-y-2">
                <Link href="/sign-up">
                  <Button
                    name="sign-up"
                    className="contrast-100 hover:opacity-90 w-full h-[40px] bg-slate-100 dark:bg-slate-800 text-brand-red-500 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 ease-in-out rounded-button"
                  >
                    Sign Up
                  </Button>
                </Link>

                <Link href="/sign-in">
                  <Button
                    name="Login"
                    className="contrast-100 bg-brand-red-500 text-white w-full h-[40px] hover:bg-brand-red-600 hover:shadow-button-hover transition-all duration-300 ease-in-out rounded-button shadow-button"
                  >
                    Login
                  </Button>
                </Link>
              </div>
            </SignedOut>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-y-2 mt-5">
            {/* FREE COURSE LOGIC */}
            <SignedIn>
              {!isCourseOwner && !isEnrolled ? (
                <Button
                  name="enroll-free"
                  onClick={async () => {
                    try {
                      setIsLoading(true);
                      const response = await axios.post(
                        "/api/enroll-free",
                        {
                          courseId: course._id,
                        }
                      );
                      
                      if (response.data.success) {
                        scnToast({
                          variant: "success",
                          title: "Enrolled Successfully",
                          description: "You have been enrolled in this free course!",
                        });
                        router.push(`/my-learning/${course._id}`);
                        router.refresh();
                      }
                    } catch (error: any) {
                      console.error("Enrollment error:", error);
                      scnToast({
                        variant: "destructive",
                        title: "Enrollment Failed",
                        description: error.response?.data?.message || "Failed to enroll in the course",
                      });
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                  className="w-full bg-brand-red-500 hover:bg-brand-red-600 hover:shadow-button-hover text-white transition-all duration-300 ease-in-out rounded-button shadow-button text-md font-bold"
                >
                  {isLoading ? <Spinner className="text-white" /> : "Enroll For Free"}
                </Button>
              ) : isCourseOwner ? (
                <div className="w-full flex flex-col gap-y-1">
                  <Link href={`/my-learning/${course._id}`}>
                    <Button
                      name="watch-course"
                      className="w-full bg-brand-red-500 hover:bg-brand-red-600 hover:shadow-button-hover text-white transition-all duration-300 ease-in-out rounded-button shadow-button text-md font-bold"
                    >
                      Watch your course
                    </Button>
                  </Link>

                  <Link href={`/teacher/courses/manage/${course._id}`}>
                    <Button
                      name="manage-course"
                      className="w-full bg-slate-950 dark:bg-slate-200 dark:hover:opacity-90 transition-all duration-300 ease-in-out rounded-sm text-md font-bold"
                    >
                      Manage your course
                    </Button>
                  </Link>
                </div>
              ) : isEnrolled ? (
                <Link href={`/my-learning/${course._id}`}>
                  <Button
                    name="continue_learning"
                    className="w-full bg-slate-950 dark:bg-slate-200 dark:hover:opacity-90 transition-all duration-300 ease-in-out rounded-sm text-md font-bold"
                  >
                    Continue Learning
                  </Button>
                </Link>
              ) : null}
            </SignedIn>
            <SignedOut>
              <Separator className="h-[3px] mt-2 mb-2" />
              <div className="w-full flex flex-col gap-y-2">
                <Link href="/sign-up">
                  <Button
                    name="sign-up"
                    className="contrast-100 hover:opacity-90 w-full h-[40px] bg-slate-100 dark:bg-slate-800 text-brand-red-500 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 ease-in-out rounded-button"
                  >
                    Sign Up to Enroll
                  </Button>
                </Link>

                <Link href="/sign-in">
                  <Button
                    name="Login"
                    className="contrast-100 bg-brand-red-500 text-white w-full h-[40px] hover:bg-brand-red-600 hover:shadow-button-hover transition-all duration-300 ease-in-out rounded-button shadow-button"
                  >
                    Login
                  </Button>
                </Link>
              </div>
            </SignedOut>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseCourseCard;
