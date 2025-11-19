"use client";
import { LeftSideBar } from "@/components/shared";
import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import MyMeetings from "@/components/shared/MyMeetings";
import { Spinner } from "@/components/shared";
import { useRouter } from "next/navigation";

const MyMeetingsPage = () => {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-in");
      return;
    }

    if (userId) {
      fetchBookings();
    }
  }, [userId, isLoaded, router]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/user/bookings");
      const data = await response.json();
      
      if (data.success) {
        setUserBookings(data.bookings);
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="flex gap-4">
        <LeftSideBar />
        <div className="p-6 w-full flex items-center justify-center min-h-screen">
          <Spinner />
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex gap-4">
      <LeftSideBar />
      <div className="p-6 w-full">
        <div className="flex flex-col items-start gap-6">
          <MyMeetings bookings={userBookings} />
        </div>
      </div>
    </div>
  );
};

export default MyMeetingsPage;
