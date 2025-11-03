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
import CheckoutForm from "./CheckoutForm";
import { useUser } from "@clerk/nextjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { TCourse, TSection, TVideo } from "@/types/models.types";
import { scnToast } from "@/components/ui/use-toast";
import Video from "next-video";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";

import { VidSyncPlayer } from "vidsync";

interface Props {
  course: TCourse;
  clientSecret: string;
  isEnrolled: boolean;
  isCourseOwner: boolean;
}

const PurchaseCourseCard = ({
  course,
  clientSecret,
  isEnrolled,
  isCourseOwner,
}: Props) => {
  const router = useRouter();
  const priceInDinar = course.price! * 3.3;
  const { addToCart, removeFromCart, cartItems } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [videoToPreview, setVideoToPreview] = useState<TVideo | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currencies, setCurrencies] = useState<{ label: string; value: any }[]>(
    []
  );
  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
  const [isFilled, setIsFilled] = useState(() =>
    wishlist.some((item: TCourse) => item._id === course._id)
  );
  const { user } = useUser();
  const [isInCart, setIsInCart] = useState(() =>
    cartItems.some((item: TCourse) => item._id === course._id)
  );
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

  const handlePurchaseWithFlouci = async () => {
    try {
      setIsPurchasing(true);
      const {
        data: { data },
      } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/payment_flouci`,
        {
          amount: priceInDinar.toFixed(2),
          courseIds: [course._id],
        }
      );

      router.push(data.link);
    } catch (error: any) {
      console.log("ERROR FLOUCI : ", error.message);
      scnToast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsPurchasing(false);
    }
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

  useEffect(() => {
    const fetchCurrencies = async () => {
      const { data } = await axios.get(
        "https://openexchangerates.org/api/currencies.json"
      );

      const currenciesArray = Object.entries(data).map(([label, value]) => ({
        label: `${label} - ${(value as string).toUpperCase()}`,
        value: label.toLowerCase() as string,
      }));

      setCurrencies(currenciesArray);
    };

    fetchCurrencies();
  }, []);

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
            height={100}
            className="rounded-sm"
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
                  className="bg-[#FF782D] w-full text-lg font-bold text-slate-50 hover:bg-[#FF782D] hover:opacity-90 duration-300 ease-in-out rounded-sm"
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
                      className="w-full bg-[#ff782d] hover:bg-[#ff782d] hover:opacity-90 text-slate-50 transition-all duration-300 ease-in-out rounded-sm text-md font-bold"
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
                  <Dialog>
                    <DialogTrigger asChild className="">
                      <Button
                        name="buy-now"
                        className="w-full bg-slate-950 dark:bg-slate-200 dark:hover:opacity-90 transition-all duration-300 ease-in-out  mt-2 rounded-sm text-md font-bold"
                      >
                        Buy now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className=" sm:max-w-[425px] md:max-w-[625px] p-6 bg-slate-100 dark:bg-slate-950">
                      <div className="flex flex-col gap-y-2">
                        <div className="flex  gap-x-3">
                          <Image
                            src={course.thumbnail!}
                            alt="course-thumbnail"
                            width={120}
                            height={150}
                            className="rounded-sm w-[120px]  lg:w-[150px]  object-cover"
                          />
                          <div className="flex flex-1 flex-col gap-y-2 justify-between ">
                            <h2 className="text-sm md:text-xl font-bold">
                              {" "}
                              {course.title}{" "}
                            </h2>
                            <div className="hidden md:flex gap-x-2 items-center w-full  ">
                              <p className="font-bold text-[12px] text-slate-500 flex gap-x-1 items-end">
                                <span className="text-[#FF782D] text-sm flex items-center gap-x-1">
                                  <AlignCenterVertical size={12} />
                                  <span>{course!.sections!.length}</span>
                                </span>{" "}
                                sections
                              </p>

                              <Separator
                                orientation="vertical"
                                className="h-[17px] w-[2px]"
                              />

                              <p className="font-bold text-[12px] text-slate-500 flex gap-x-1 items-end">
                                <span className="text-[#FF782D] text-sm flex items-center gap-x-1">
                                  <LucideVideo size={12} />
                                  <span>{allVideos.length}</span>
                                </span>{" "}
                                videos
                              </p>
                              <Separator
                                orientation="vertical"
                                className="h-[17px] w-[2px]"
                              />
                              <p className="flex items-center gap-x-1 font-bold text-[12px] text-slate-500 ">
                                <Image
                                  src={"/icons/level.svg"}
                                  width={12}
                                  height={12}
                                  alt="level"
                                  className="object-cover"
                                />
                                <span>
                                  {" "}
                                  {course!.level![0].toUpperCase()}
                                  {course!.level!.slice(1)}
                                </span>
                              </p>
                              <Separator
                                orientation="vertical"
                                className="h-[17px] w-[2px]"
                              />
                              <p className="flex items-center gap-x-1 font-bold text-[12px] text-slate-500 ">
                                <Image
                                  src={"/icons/language.svg"}
                                  width={12}
                                  height={12}
                                  alt="level"
                                  className="object-cover"
                                />
                                <span>
                                  {course!.language![0].toUpperCase()}
                                  {course!.language!.slice(1)}
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
                        <div className="flex md:hidden gap-x-2 items-center w-full flex-wrap ">
                          <p className="font-bold text-[12px] text-slate-500 flex gap-x-1 items-end">
                            <span className="text-[#FF782D] text-sm flex items-center gap-x-1">
                              <AlignCenterVertical size={12} />
                              <span>{course.sections!.length}</span>
                            </span>{" "}
                            sections
                          </p>

                          <Separator
                            orientation="vertical"
                            className="h-[17px] w-[2px]"
                          />

                          <p className="font-bold text-[12px] text-slate-500 flex gap-x-1 items-end">
                            <span className="text-[#FF782D] text-sm flex items-center gap-x-1">
                              <LucideVideo size={12} />
                              <span>{allVideos.length}</span>
                            </span>{" "}
                            videos
                          </p>
                          <Separator
                            orientation="vertical"
                            className="h-[17px] w-[2px]"
                          />
                          <p className="flex items-center gap-x-1 font-bold text-[12px] text-slate-500 ">
                            <Image
                              src={"/icons/level.svg"}
                              width={12}
                              height={12}
                              alt="level"
                              className="object-cover"
                            />
                            <span>
                              {" "}
                              {course!.level![0].toUpperCase()}
                              {course!.level!.slice(1)}
                            </span>
                          </p>
                          <Separator
                            orientation="vertical"
                            className="h-[17px] w-[2px]"
                          />
                          <p className="flex items-center gap-x-1 font-bold text-[12px] text-slate-500 ">
                            <Image
                              src={"/icons/language.svg"}
                              width={12}
                              height={12}
                              alt="level"
                              className="object-cover"
                            />
                            <span>
                              {course!.language![0].toUpperCase()}
                              {course!.language!.slice(1)}
                            </span>
                          </p>
                        </div>
                      </div>
                      <Separator />

                      <Tabs defaultValue="account" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-fit">
                          <TabsTrigger
                            value="stripe"
                            className="flex items-center gap-x-2"
                          >
                            <Image
                              src={"/icons/stripe.svg"}
                              width={30}
                              height={30}
                              alt="stripe"
                              className="object-cover rounded-none"
                            />
                            <p className="font-bold text-lg">Stripe</p>
                          </TabsTrigger>
                          <TabsTrigger
                            value="flouci"
                            className="flex items-center gap-x-2"
                          >
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
                          <CheckoutForm
                            clientSecret={clientSecret}
                            courses={[course]}
                            currency={transformCurrencyToSymbol(
                              course!.currency!.toUpperCase()
                            )}
                          />
                        </TabsContent>
                        <TabsContent value="flouci">
                          <Button
                            name="flouci"
                            onClick={() => handlePurchaseWithFlouci()}
                            className="w-full bg-slate-950 dark:bg-slate-200 dark:hover:opacity-90 transition-all duration-300 ease-in-out  mt-2 rounded-sm text-md font-bold flex items-center justify-center"
                          >
                            {isPurchasing ? (
                              <Spinner className="text-[#FF782D]" />
                            ) : (
                              <div className="flex items-center gap-x-2">
                                <p>Purchase -</p>
                                <p> {priceInDinar.toFixed(2)} DT </p>
                                <Image
                                  src={"/images/dinar.png"}
                                  width={20}
                                  height={20}
                                  alt="dinar"
                                  className="object-cover"
                                />
                              </div>
                            )}
                          </Button>
                        </TabsContent>
                      </Tabs>
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
                    className="contrast-100 hover:opacity-90  w-full h-[40px]  bg-[#0071DC]/10 text-[#FF782D] dark:bg-slate-900 md:dark:bg-slate-950 font-medium hover:bg-[#0071DC]/10 transition-all duration-300 ease-in-out"
                  >
                    Sign Up
                  </Button>
                </Link>

                <Link href="/sign-in">
                  <Button
                    name="Login"
                    className="contrast-100 bg-[#FF782D] text-white w-full h-[40px] hover:bg-[#FF782D] hover:opacity-90 transition-all duration-300 ease-in-out"
                  >
                    Login
                  </Button>
                </Link>
              </div>
            </SignedOut>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default PurchaseCourseCard;
