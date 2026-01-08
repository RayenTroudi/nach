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
import { useTranslations } from 'next-intl';

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { TCourse, TSection, TVideo } from "@/types/models.types";
import { scnToast } from "@/components/ui/use-toast";
import { useCart } from "@/contexts/CartContext";
// import { useWishlist } from "@/contexts/WishlistContext"; // TODO: Create WishlistContext
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
  const t = useTranslations('course.purchase');
  
  // Move all hooks to the top, before any conditional returns
  const { addToCart, removeFromCart, cartItems } = useCart();
  // const { wishlist, addToWishlist, removeFromWishlist } = useWishlist(); // TODO: Create WishlistContext
  const [videoToPreview, setVideoToPreview] = useState<TVideo | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFilled, setIsFilled] = useState(false);
  const { user } = useUser();
  const [isInCart, setIsInCart] = useState(false);

  // Update wishlist and cart state when they change
  useEffect(() => {
    if (course) {
      // setIsFilled(wishlist.some((item: TCourse) => item._id === course._id)); // TODO: Enable when WishlistContext exists
      setIsInCart(cartItems.some((item: TCourse) => item._id === course._id));
    }
  }, [cartItems, course]); // Removed wishlist dependency
  
  // Add null check for course - AFTER all hooks
  if (!course || !course._id) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">{t('courseNotFound')}</p>
          <p className="text-slate-600 dark:text-slate-400">
            {t('courseNotFoundDesc')}
          </p>
          <Button
            onClick={() => router.push("/courses")}
            className="mt-4 bg-brand-red-500 hover:bg-brand-red-600"
          >
            {t('browseCourses')}
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
    // TODO: Implement wishlist functionality when WishlistContext is created
    /*
    if (isFilled) {
      removeFromWishlist(course._id);
      setIsFilled(false);
    } else {
      addToWishlist(course);
      setIsFilled(true);
    }
    */
    console.log("Wishlist functionality temporarily disabled");
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
        title: t('removedFromCart'),
        description: t('removedFromCartDesc'),
      });
    } else {
      addToCart(course);
      setIsInCart(true);
      scnToast({
        variant: "success",
        title: t('addedToCart'),
        description: t('addedToCartDesc'),
      });
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Video Preview Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Video Player */}
        {isLoading ? (
          <div className="w-full aspect-video bg-slate-200 dark:bg-slate-950 flex items-center justify-center">
            <Spinner size={50} />
          </div>
        ) : (
          <div className="relative w-full aspect-video">
            <VidSyncPlayer
              src={
                videoToPreview
                  ? videoToPreview.videoUrl!
                  : allFreeVideos[0]?.videoUrl || course?.thumbnail || ""
              }
              poster={course?.thumbnail!}
              containerStyles={{
                borderRadius: "0 !important",
              }}
              videoStyles={{
                borderRadius: "0 !important",
              }}
            />
          </div>
        )}

        {/* Card Content */}
        <div className="p-6 space-y-6">
          {/* Price Section */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
            <Image
              src={course.thumbnail!}
              alt="course-thumbnail"
              width={80}
              height={53}
              className="rounded-lg shadow-md"
              style={{ width: 'auto', height: 'auto', maxWidth: '80px' }}
            />
            {course!.price! > 0 ? (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-brand-red-500">
                  {transformCurrencyToSymbol(course?.currency!.toUpperCase())}{course.price}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-green-500">{t('free')}</span>
              </div>
            )}
          </div>

          {/* Free Preview Videos */}
          {allFreeVideos.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <LucideVideo size={20} className="text-brand-red-500" />
                {t('previewVideos')}
              </h3>
              <div className="space-y-2">
                {allFreeVideos.map((video: TVideo | undefined, key: number) => (
                  <button
                    onClick={() => onChangeVideoToPreviewHandler(video!)}
                    key={key}
                    className={`w-full p-3 rounded-lg flex items-center gap-3 transition-all duration-200 ${
                      videoToPreview?._id === video?._id || (!videoToPreview && allFreeVideos[0]?._id === video?._id)
                        ? "bg-brand-red-50 dark:bg-brand-red-950/30 border-2 border-brand-red-500"
                        : "bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border-2 border-transparent"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      videoToPreview?._id === video?._id || (!videoToPreview && allFreeVideos[0]?._id === video?._id)
                        ? "bg-brand-red-500"
                        : "bg-slate-300 dark:bg-slate-700"
                    }`}>
                      <LucideVideo size={16} className="text-white" />
                    </div>
                    <p className="flex-1 text-left text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-1">
                      {video?.title}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          {course.price! > 0 ? (
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              {!isCourseOwner && !isEnrolled ? (
                <div className="flex gap-3">
                  <Button
                    name="add-to-cart"
                    className="flex-1 h-12 bg-brand-red-500 text-white hover:bg-brand-red-600 font-semibold text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={handleAddToCart}
                  >
                    {isInCart ? t('removeFromCart') : t('addToCart')}
                  </Button>

                  <Button
                    name="add-to-wishlist"
                    onClick={toggleHeart}
                    className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <LucideHeart
                      size={20}
                      fill={isFilled ? "white" : "none"}
                      stroke={isFilled ? "transparent" : "white"}
                      className="transition-all duration-300"
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
                      {t('manageYourCourse')}
                    </Button>
                  </Link>
                </div>
              ) : isEnrolled ? (
                <Link href={`/my-learning/${course._id}`}>
                  <Button
                    name="continue_learning"
                    className="w-full bg-slate-950 dark:bg-slate-200 dark:hover:opacity-90 transition-all mt2 duration-300 ease-in-out rounded-sm text-md font-bold"
                  >
                    {t('continueLearning')}
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
                        {t('buyNow')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] md:max-w-[700px] p-6 bg-slate-100 dark:bg-slate-950 max-h-[90vh] overflow-y-auto">
                      <div className="flex flex-col gap-y-4">
                        <h2 className="text-2xl font-bold">{t('completePurchase')}</h2>
                        
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
                              title: t('uploadSuccessful'),
                              description: t('uploadSuccessfulDesc'),
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
                    {t('signUp')}
                  </Button>
                </Link>

                <Link href="/sign-in">
                  <Button
                    name="Login"
                    className="contrast-100 bg-brand-red-500 text-white w-full h-[40px] hover:bg-brand-red-600 hover:shadow-button-hover transition-all duration-300 ease-in-out rounded-button shadow-button"
                  >
                    {t('login')}
                  </Button>
                </Link>
              </div>
            </SignedOut>
            </div>
          ) : (
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
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
                          title: t('enrolledSuccessfully'),
                          description: t('enrolledSuccessfullyDesc'),
                        });
                        router.push(`/my-learning/${course._id}`);
                        router.refresh();
                      }
                    } catch (error: any) {
                      console.error("Enrollment error:", error);
                      scnToast({
                        variant: "destructive",
                        title: t('enrollmentFailed'),
                        description: error.response?.data?.message || t('enrollmentFailed'),
                      });
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                  className="w-full bg-brand-red-500 hover:bg-brand-red-600 hover:shadow-button-hover text-white transition-all duration-300 ease-in-out rounded-button shadow-button text-md font-bold"
                >
                  {isLoading ? <Spinner className="text-white" /> : t('enrollForFree')}
                </Button>
              ) : isCourseOwner ? (
                <div className="w-full flex flex-col gap-y-1">
                  <Link href={`/my-learning/${course._id}`}>
                    <Button
                      name="watch-course"
                      className="w-full bg-brand-red-500 hover:bg-brand-red-600 hover:shadow-button-hover text-white transition-all duration-300 ease-in-out rounded-button shadow-button text-md font-bold"
                    >
                      {t('watchYourCourse')}
                    </Button>
                  </Link>

                  <Link href={`/teacher/courses/manage/${course._id}`}>
                    <Button
                      name="manage-course"
                      className="w-full bg-slate-950 dark:bg-slate-200 dark:hover:opacity-90 transition-all duration-300 ease-in-out  rounded-sm text-md font-bold"
                    >
                      {t('manageYourCourse')}
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
                    {t('signUpToEnroll')}
                  </Button>
                </Link>

                <Link href="/sign-in">
                  <Button
                    name="Login"
                    className="contrast-100 bg-brand-red-500 text-white w-full h-[40px] hover:bg-brand-red-600 hover:shadow-button-hover transition-all duration-300 ease-in-out rounded-button shadow-button"
                  >
                    {t('login')}
                  </Button>
                </Link>
              </div>
            </SignedOut>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseCourseCard;
