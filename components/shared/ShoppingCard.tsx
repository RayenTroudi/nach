"use client";
import React from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeProvider";
import { useCart } from "@/contexts/CartContext";
const EmptyCartAnimation = dynamic(() => import("./animations/EmptyCart"), {
  ssr: false,
});
import { Button } from "../ui/button";
import { TCourse } from "@/types/models.types";
import { Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { Skeleton } from "../ui/skeleton";

const ShoppingCard: React.FC = () => {
  const { mode } = useTheme();
  const { cartItems, removeFromCart } = useCart();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex-shrink-0 relative w-[20px] h-[20px] md:w-[35px] md:h-[35px] hover:bg-[#FF782D]/10 rounded-full flex items-center justify-center cursor-pointer enabled:border-none">
        <Image
          src={
            mode === "dark" ? "/icons/shopping-dark.svg" : "/icons/shopping.svg"
          }
          alt="shopping"
          width={20}
          height={20}
        />
        <span className="absolute top-0 -right-2 w-[18px] h-[18px] bg-[#FF782D] flex items-center justify-center text-[10px] text-slate-200 font-bold rounded-full">
          {cartItems.length}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="absolute top-8 -right-36 lg:-right-4 w-[400px] max-h-[320px] overflow-y-auto shadow-lg flex flex-col gap-2">
        <DropdownMenuLabel className="flex items-center justify-between">
          <p>Shopping Cart</p>
          <div className="cursor-pointer flex items-center">
            <Link
              href="/cart"
              className="text-[11px] primary-color hover:underline"
            >
              See all
            </Link>
            <Image
              src="/icons/right-arrow.svg"
              alt="arrow-right"
              width={16}
              height={16}
            />
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {cartItems.length > 0 ? (
          cartItems.map((item: TCourse, key: number) => (
            <DropdownMenuItem
              key={key}
              className="flex justify-between gap-2 cursor-pointer"
            >
              <Link href={`/course/${item._id}`}>
                <div className="flex items-center gap-x-2">
                  <Image
                    src={
                      item.thumbnail || "/images/default-course-thumbnail.jpg"
                    }
                    className="rounded-md border border-input"
                    alt="course-thumbnail"
                    width={100}
                    height={100}
                  />
                  <div className="flex-1 w-full flex flex-col space-y-1">
                    <h2 className="font-bold text-md text-slate-950 dark:text-slate-50">
                      {item.title.length > 20
                        ? `${item.title.slice(0, 20)}...`
                        : item.title}
                    </h2>
                    <div className="font-semibold text-slate-500 dark:text-slate-400 text-xs flex items-center gap-x-1">
                      <Avatar className="w-4 h-4">
                        <AvatarImage
                          src={item.instructor.picture || "/images/default_profile.avif"}
                          alt="instructor-picture"
                          className=" object-contain"
                        />

                        <AvatarFallback className="">
                          <Skeleton className="w-4 h-4 rounded-full" />
                        </AvatarFallback>
                      </Avatar>
                      {item.instructor.username.length > 20
                        ? `${item.instructor.username.slice(0, 20)}...`
                        : item.instructor.username}
                    </div>
                  </div>
                </div>
              </Link>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  removeFromCart(item._id);
                }}
                className="p-0 siz-[30px] bg-transparent hover:bg-transparent group flex items-center justify-center cursor-pointer"
              >
                <Trash2
                  size={20}
                  className="text-slate-950 dark:text-slate-50 group-hover:text-destructive "
                />
              </Button>
            </DropdownMenuItem>
          ))
        ) : (
          <>
            <EmptyCartAnimation className="h-[200px]" />
            <Button className="text-slate-50 w-full bg-[#FF782D] hover:bg-[#FF782D] opacity-90 hover:opacity-100 transition-all duration-300 ease-in-out">
              Start by adding some
            </Button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShoppingCard;
