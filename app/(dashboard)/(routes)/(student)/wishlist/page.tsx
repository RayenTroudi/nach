"use client";
import Course from "@/components/shared/Course";
import LeftSideBar from "@/components/shared/LeftSideBar";
import EmptyWishList from "@/components/shared/animations/EmptyWishlist";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/WishlistContext";
import Link from "next/link";

const WishlistPage = () => {
  const { wishlist, removeFromWishlist } = useWishlist();

  const handleRemoveFromWishlist = (courseId: string) => {
    removeFromWishlist(courseId);
  };

  return (
    <div className="flex  gap-4 min-h-screen">
      <LeftSideBar />

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {wishlist.map((course) => (
            <Link key={course._id} href={`/course/${course._id}`}>
              <Course course={course} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="flex flex-col items-center justify-center space-y-4">
            <EmptyWishList className="h-[250px] md:h-[450px] mt-0 md:mt-0" />
            <h1 className="text-xl md:text-3xl text-slate-950 dark:text-slate-50 font-bold text-center">
              No Courses In Your WishList.
            </h1>
            <Link href="/" className="w-full md:w-1/2 md:mx-auto">
              <Button className="w-full bg-[#FF782D] rounded-sm font-bold text-slate-50 mt-2 hover:opacity-90 hover:bg-[#FF782D] duration-300 transition-all ease-in-out">
                Start Browsing
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
