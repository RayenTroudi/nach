"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Calendar, Clock, DollarSign, User, Video, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Booking {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    picture?: string;
  };
  hostId: {
    _id: string;
    name: string;
    email: string;
  };
  startAt: string;
  endAt: string;
  roomName: string;
  price: number;
  paymentProof?: string;
  paymentStatus: "pending" | "paid" | "rejected" | "free";
  meetingLink?: string;
  meetingId?: string;
  adminNotes?: string;
  notes?: string;
}

interface ConsultantMeetingsProps {
  bookings: Booking[];
}

type FilterType = "upcoming" | "past" | "all";

const ConsultantMeetings = ({ bookings }: ConsultantMeetingsProps) => {
  const t = useTranslations("admin.consultations");
  const [filter, setFilter] = useState<FilterType>("upcoming");
  const router = useRouter();

  const now = new Date();

  const filteredBookings = bookings.filter((booking) => {
    const startTime = new Date(booking.startAt);
    const endTime = new Date(booking.endAt);

    if (filter === "upcoming") {
      return endTime > now && booking.paymentStatus === "paid";
    } else if (filter === "past") {
      return endTime <= now;
    }
    return true; // all
  });

  // Get meeting page URL from meeting link or meetingId
  const getMeetingPageUrl = (booking: Booking) => {
    let roomId = booking.meetingId;
    
    // If no meetingId, try to extract from meetingLink
    if (!roomId && booking.meetingLink) {
      const match = booking.meetingLink.match(/\/meet\/([^/?]+)/);
      roomId = match ? match[1] : undefined;
    }
    
    if (!roomId) return null;
    
    // Return internal meeting page URL
    return `/meet/${roomId}`;
  };

  const canJoinMeeting = (booking: Booking) => {
    if (!booking.meetingLink || booking.paymentStatus !== "paid") return false;

    const startTime = new Date(booking.startAt);
    const endTime = new Date(booking.endAt);
    const joinWindow = new Date(startTime.getTime() - 15 * 60000); // 15 min before

    return now >= joinWindow && now <= endTime;
  };

  const getStatusBadge = (booking: Booking) => {
    const endTime = new Date(booking.endAt);
    const isPast = endTime < now;

    if (booking.paymentStatus === "pending") {
      return (
        <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <AlertCircle className="h-4 w-4" />
          Payment Pending
        </span>
      );
    }

    if (booking.paymentStatus === "rejected") {
      return (
        <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
          <XCircle className="h-4 w-4" />
          Cancelled
        </span>
      );
    }

    if (isPast) {
      return (
        <span className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200">
          <CheckCircle2 className="h-4 w-4" />
          Completed
        </span>
      );
    }

    if (canJoinMeeting(booking)) {
      return (
        <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
          <Video className="h-4 w-4" />
          Active - Can Join
        </span>
      );
    }

    return (
      <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
        <CheckCircle2 className="h-4 w-4" />
        Confirmed
      </span>
    );
  };

  const handleJoinMeeting = (booking: Booking) => {
    const meetingUrl = getMeetingPageUrl(booking);
    if (meetingUrl) {
      router.push(meetingUrl);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeUntilMeeting = (startAt: string) => {
    const start = new Date(startAt);
    const diff = start.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (diff < 0) return "Meeting started";
    if (hours > 24) return `${Math.floor(hours / 24)} days`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes} minutes`;
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setFilter("upcoming")}
          className={`pb-3 text-sm font-medium transition-colors ${
            filter === "upcoming"
              ? "border-b-2 border-brand-red-500 text-brand-red-500"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
        >
          {t('upcoming')} ({bookings.filter((b) => new Date(b.endAt) > now && b.paymentStatus === "paid").length})
        </button>
        <button
          onClick={() => setFilter("past")}
          className={`pb-3 text-sm font-medium transition-colors ${
            filter === "past"
              ? "border-b-2 border-brand-red-500 text-brand-red-500"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
        >
          {t('past')} ({bookings.filter((b) => new Date(b.endAt) <= now).length})
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`pb-3 text-sm font-medium transition-colors ${
            filter === "all"
              ? "border-b-2 border-brand-red-500 text-brand-red-500"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
        >
          {t('all')} ({bookings.length})
        </button>
      </div>

      {/* Meetings List */}
      {filteredBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 p-12 dark:border-slate-800">
          <Video className="mb-4 h-12 w-12 text-slate-400" />
          <h3 className="mb-2 text-lg font-semibold">{t('noConsultationsFound')}</h3>
          <p className="text-center text-sm text-slate-500">
            {filter === "upcoming"
              ? t('noUpcomingConsultations')
              : filter === "past"
              ? t('noPastConsultations')
              : t('noConsultationsYet')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking._id}
              className="rounded-lg border-2 border-slate-200 bg-white p-6 transition-all hover:border-brand-red-500 dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                {/* Left Section - Meeting Details */}
                <div className="flex-1 space-y-3">
                  {/* Student Info */}
                  <div className="flex items-center gap-3">
                    {booking.userId?.picture ? (
                      <Image
                        src={booking.userId.picture}
                        alt={booking.userId.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-red-500 text-white">
                        <User className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{booking.userId?.name || "Unknown Student"}</h3>
                      <p className="text-sm text-slate-500">{booking.userId?.email}</p>
                    </div>
                  </div>

                  {/* Meeting Time */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(booking.startAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Clock className="h-4 w-4" />
                      <span>
                        {formatTime(booking.startAt)} - {formatTime(booking.endAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <DollarSign className="h-4 w-4" />
                      <span>{booking.price === 0 ? "Free" : `$${booking.price}`}</span>
                    </div>
                  </div>

                  {/* Student Notes */}
                  {booking.notes && (
                    <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Student Notes:</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{booking.notes}</p>
                    </div>
                  )}

                  {/* Admin Notes */}
                  {booking.adminNotes && (
                    <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Your Notes:</p>
                      <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">{booking.adminNotes}</p>
                    </div>
                  )}
                </div>

                {/* Right Section - Actions */}
                <div className="flex flex-col items-end gap-3">
                  {/* Status Badge */}
                  {getStatusBadge(booking)}

                  {/* Time Until Meeting */}
                  {booking.paymentStatus === "paid" && new Date(booking.endAt) > now && (
                    <div className="text-right text-sm text-slate-500">
                      Starts in: <span className="font-semibold">{getTimeUntilMeeting(booking.startAt)}</span>
                    </div>
                  )}

                  {/* Join Button */}
                  {(booking.meetingLink || booking.meetingId) && (
                    <button
                      onClick={() => handleJoinMeeting(booking)}
                      disabled={!canJoinMeeting(booking)}
                      className={`flex items-center gap-2 rounded-lg px-6 py-2.5 font-semibold transition-all ${
                        canJoinMeeting(booking)
                          ? "bg-brand-red-500 text-white hover:bg-brand-red-600"
                          : "cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
                      }`}
                    >
                      <Video className="h-5 w-5" />
                      {canJoinMeeting(booking) ? "Join Meeting" : "Not Available Yet"}
                    </button>
                  )}

                  {/* Payment Pending Message */}
                  {booking.paymentStatus === "pending" && (
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      Waiting for payment approval
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConsultantMeetings;
