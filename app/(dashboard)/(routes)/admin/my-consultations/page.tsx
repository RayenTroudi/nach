"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Loader2, Video } from "lucide-react";
import ConsultantMeetings from "@/components/shared/ConsultantMeetings";
import { LeftSideBar } from "@/components/shared";

const MyConsultationsPage = () => {
  const { userId, isLoaded } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const res = await fetch("/api/admin/my-consultations");
        if (res.ok) {
          const data = await res.json();
          setBookings(data.bookings || []);
        }
      } catch (error) {
        console.error("Error fetching consultations:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && userId) {
      fetchConsultations();
    }
  }, [userId, isLoaded]);

  if (!isLoaded || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-red-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen">
      <LeftSideBar />
      <div className="flex-1 p-6">
        <div className="mb-6 flex items-center gap-3">
          <Video className="h-8 w-8 text-brand-red-500" />
          <div>
            <h1 className="text-3xl font-bold">My Consultations</h1>
            <p className="text-muted-foreground">
              Manage and join your scheduled consultation meetings
            </p>
          </div>
        </div>
        <ConsultantMeetings bookings={bookings} />
      </div>
    </div>
  );
};

export default MyConsultationsPage;
