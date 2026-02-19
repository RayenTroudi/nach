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
import MuxVideoPlayer, { getMuxThumbnail } from "@/components/shared/MuxVideoPlayer";

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
  
  // Only convert USD to TND, keep TND prices as-is
  const priceInDinar = course.currency?.toLowerCase() === 'usd' 
    ? (course.price || 0) * 3.3 
    : (course.price || 0);
  
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

  // Safely extract all videos from course sections
  const allVideos = course?.sections
    ?.flatMap((section: TSection) => section.videos || [])
    .filter((video): video is TVideo => Boolean(video)) ?? [];
  
  // Get only free videos with valid muxData
  const allFreeVideos = allVideos.filter(
    (video: TVideo) => video?.isFree && video?.muxData?.playbackId
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
        ) : (() => {
          // Calculate the playback ID once to avoid inconsistencies
          const previewVideo = videoToPreview || allFreeVideos[0];
          const previewPlaybackId = previewVideo?.muxData?.playbackId;
          
          // Strict validation: must be a non-empty string with valid Mux format
          const hasValidPlaybackId = Boolean(
            previewPlaybackId && 
            typeof previewPlaybackId === 'string' && 
            previewPlaybackId.trim().length > 0 &&
            previewVideo?.muxData // Ensure muxData object exists
          );
          
          // Get poster - use course thumbnail or generate from playbackId
          const posterUrl = course?.thumbnail || (hasValidPlaybackId ? getMuxThumbnail(previewPlaybackId) : undefined);

          return (
            <div className="relative w-full aspect-video">
              {/* Check if there's a valid video with Mux data to display */}
              {hasValidPlaybackId ? (
                <MuxVideoPlayer
                  playbackId={previewPlaybackId!}
                  title={previewVideo?.title || course?.title || 'Video preview'}
                  poster={posterUrl}
                  metadata={{
                    video_id: previewVideo?._id?.toString() || '',
                    video_title: previewVideo?.title || course?.title || 'Video preview',
                    course_id: course?._id?.toString() || '',
                  }}
                  showControls={true}
                  minimalHover={true}
                  onLoadedData={() => console.log('Video loaded')}
                  onError={(error) => {
                    console.error('Mux player error:', error);
                  }}
                />
              ) : (
                // Show thumbnail image when no video is available
                <div className="relative w-full h-full">
                  <Image
                    src={course?.thumbnail || '/images/placeholder.jpg'}
                    alt={course?.title || 'Course preview'}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 350px, 350px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <LucideVideo className="w-16 h-16 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{t('noPreviewAvailable')}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Card Content */}
        <div className="p-6 space-y-6">
          {/* Price Section */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
            <Image
              src={course.thumbnail || '/images/placeholder.jpg'}
              alt="course-thumbnail"
              width={80}
              height={53}
              className="rounded-lg shadow-md"
              style={{ width: 'auto', height: 'auto', maxWidth: '80px' }}
            />
            {(course.price || 0) > 0 ? (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-brand-red-500">
                  {transformCurrencyToSymbol((course.currency || 'TND').toUpperCase())}{course.price}
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
                {allFreeVideos.map((video: TVideo | undefined, key: number) => {
                  const isSelected = videoToPreview?._id === video?._id || (!videoToPreview && allFreeVideos[0]?._id === video?._id);
                  return (
                    <button
                      onClick={() => onChangeVideoToPreviewHandler(video!)}
                      key={key}
                      className={`w-full p-3 rounded-lg flex items-center gap-3 transition-all duration-200 ${
                        isSelected
                          ? "bg-brand-red-50 dark:bg-brand-red-950/30 border-2 border-brand-red-500"
                          : "bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border-2 border-transparent"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isSelected
                          ? "bg-brand-red-500"
                          : "bg-slate-300 dark:bg-slate-700"
                      }`}>
                        <LucideVideo size={16} className="text-white" />
                      </div>
                      <p className={`flex-1 text-left text-sm font-medium line-clamp-1 ${
                        isSelected
                          ? "text-brand-red-700 dark:text-brand-red-300"
                          : "text-slate-900 dark:text-slate-100"
                      }`}>
                        {video?.title}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          {course.price! > 0 ? (
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              
            <SignedIn>
              {isCourseOwner ? (
                <div className="mt-2  w-full flex flex-col gap-y-1">
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
                      className="w-full bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-100 hover:bg-slate-800 dark:hover:bg-slate-700 transition-all duration-300 ease-in-out rounded-sm text-md font-bold"
                    >
                      {t('manageYourCourse')}
                    </Button>
                  </Link>
                </div>
              ) : isEnrolled ? (
                <Link href={`/my-learning/${course._id}`}>
                  <Button
                    name="continue_learning"
                    className="w-full bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-100 hover:bg-slate-800 dark:hover:bg-slate-700 transition-all mt2 duration-300 ease-in-out rounded-sm text-md font-bold"
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
                        className="w-full bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-100 hover:bg-slate-800 dark:hover:bg-slate-700 transition-all duration-300 ease-in-out mt-2 rounded-sm text-md font-bold"
                      >
                        {t('buyNow')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] md:max-w-[700px] p-6 bg-slate-100 dark:bg-slate-950 max-h-[90vh] overflow-y-auto">
                      <div className="flex flex-col gap-y-4">
                        <h2 className="text-2xl font-bold">{t('completePurchase')}</h2>
                        
                        <div className="flex gap-x-3 p-4 bg-white dark:bg-slate-900 rounded-lg">
                          <Image
                            src={course.thumbnail || '/images/placeholder.jpg'}
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
                                src={course.instructor?.picture || "/images/default_profile.avif"}
                                width={20}
                                height={20}
                                alt="instructor"
                                className="rounded-full object-cover"
                              />
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                {course.instructor?.username || 'Instructor'}
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
                      className="w-full bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-100 hover:bg-slate-800 dark:hover:bg-slate-700 transition-all duration-300 ease-in-out rounded-sm text-md font-bold"
                    >
                      {t('manageYourCourse')}
                    </Button>
                  </Link>
                </div>
              ) : isEnrolled ? (
                <Link href={`/my-learning/${course._id}`}>
                  <Button
                    name="continue_learning"
                    className="w-full bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-100 hover:bg-slate-800 dark:hover:bg-slate-700 transition-all duration-300 ease-in-out rounded-sm text-md font-bold"
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
