"use client";
import { useState } from "react";
import { Calendar, Clock, Video, CheckCircle, XCircle, HourglassIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

interface Booking {
  _id: string;
  hostId?: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  startAt: string;
  endAt: string;
  timezone: string;
  notes?: string;
  price?: number;
  paymentStatus: "pending" | "paid" | "free";
  status: "scheduled" | "completed" | "cancelled";
  meetingLink?: string;
  meetingId?: string;
  createdAt: string;
}

interface MyMeetingsProps {
  bookings: Booking[];
}

export default function MyMeetings({ bookings: initialBookings }: MyMeetingsProps) {
  const t = useTranslations("dashboard.student.myMeetings");
  const locale = useLocale();
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [filter, setFilter] = useState<"upcoming" | "past" | "all">("upcoming");

  const now = new Date();

  const filteredBookings = bookings.filter((booking) => {
    const meetingDate = new Date(booking.startAt);
    
    if (filter === "upcoming") {
      return meetingDate >= now && booking.status !== "cancelled";
    } else if (filter === "past") {
      return meetingDate < now || booking.status === "completed";
    }
    return true;
  });

  const formatDate = (dateString: string) => {
    const localeMap: Record<string, string> = {
      'en': 'en-US',
      'de': 'de-DE',
      'ar': 'ar-EG-u-nu-latn'
    };
    
    return new Date(dateString).toLocaleDateString(localeMap[locale] || 'en-US', {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const localeMap: Record<string, string> = {
      'en': 'en-US',
      'de': 'de-DE',
      'ar': 'ar-EG-u-nu-latn'
    };
    
    return new Date(dateString).toLocaleTimeString(localeMap[locale] || 'en-US', {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (booking: Booking) => {
    if (booking.status === "cancelled") {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="w-3 h-3" />
          {t("cancelled")}
        </Badge>
      );
    }

    if (booking.paymentStatus === "pending") {
      return (
        <Badge className="gap-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
          <HourglassIcon className="w-3 h-3" />
          {t("paymentPending")}
        </Badge>
      );
    }

    if (booking.paymentStatus === "paid" || booking.paymentStatus === "free") {
      const meetingDate = new Date(booking.startAt);
      if (meetingDate < now) {
        return (
          <Badge className="gap-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            <CheckCircle className="w-3 h-3" />
            {t("completed")}
          </Badge>
        );
      }
      return (
        <Badge className="gap-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
          <CheckCircle className="w-3 h-3" />
          {t("confirmed")}
        </Badge>
      );
    }

    return null;
  };

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
    if (!booking.meetingLink && !booking.meetingId) return false;
    if (booking.status === "cancelled") return false;
    if (booking.paymentStatus === "pending") return false;

    const startTime = new Date(booking.startAt);
    const endTime = new Date(booking.endAt);
    const fifteenMinutesBefore = new Date(startTime.getTime() - 15 * 60 * 1000);

    return now >= fifteenMinutesBefore && now <= endTime;
  };

  if (bookings.length === 0) {
    return (
      <div className="w-full">
        <div className="bg-white dark:bg-slate-900 rounded-lg border-2 border-slate-200 dark:border-slate-800 p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <h3 className="text-xl font-semibold text-slate-950 dark:text-slate-200 mb-2">
            {t("noMeetingsScheduled")}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {t("noMeetingsBooked")}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/contact/meeting">
              <Button className="bg-brand-red-500 hover:bg-brand-red-600 text-white">
                {t("bookConsultation")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );t(filter)
  }

  return (
    <div className="flex flex-col gap-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-950 dark:text-slate-200">
            {t("title")}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {filteredBookings.length} {filter} {filteredBookings.length === 1 ? t("meetingCount") : t("meetingsCount")}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <Button
            variant={filter === "upcoming" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("upcoming")}
            className={filter === "upcoming" 
              ? "bg-brand-red-500 hover:bg-brand-red-600 text-white shadow-md" 
              : "border-2 border-slate-200 dark:border-slate-800 hover:border-brand-red-500 dark:hover:border-brand-red-500 bg-white dark:bg-slate-900"
            }
          >
            {t("upcoming")}
          </Button>
          <Button
            variant={filter === "past" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("past")}
            className={filter === "past" 
              ? "bg-brand-red-500 hover:bg-brand-red-600 text-white shadow-md" 
              : "border-2 border-slate-200 dark:border-slate-800 hover:border-brand-red-500 dark:hover:border-brand-red-500 bg-white dark:bg-slate-900"
            }
          >
            {t("past")}
          </Button>
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className={filter === "all" 
              ? "bg-brand-red-500 hover:bg-brand-red-600 text-white shadow-md" 
              : "border-2 border-slate-200 dark:border-slate-800 hover:border-brand-red-500 dark:hover:border-brand-red-500 bg-white dark:bg-slate-900"
            }
          >
            {t("all")}
          </Button>
        </div>
      </div>

      {/* Meetings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-lg border-2 border-slate-200 dark:border-slate-800 p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            {t("noMeetingsFound")} {filter}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white dark:bg-slate-900 rounded-lg border-2 border-slate-200 dark:border-slate-800 p-6 hover:shadow-md hover:border-brand-red-500 dark:hover:border-brand-red-500 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Status Badge */}
                  <div className="mb-4">
                    {getStatusBadge(booking)}
                  </div>

                  {/* Meeting Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Calendar className="w-4 h-4" />
                      <span className="font-semibold">{formatDate(booking.startAt)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>
                        {formatTime(booking.startAt)} - {formatTime(booking.endAt)} ({booking.timezone})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Video className="w-4 h-4" />
                      <span>
                        {booking.hostId 
                          ? `${booking.hostId.firstName} ${booking.hostId.lastName}`
                          : t("withAdvisor")
                        }
                      </span>
                    </div>

                    {booking.price && (
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {t("amount")}: {booking.price} TND
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {booking.notes && (
                    <>
                      <Separator className="my-4" />
                      <div className="bg-slate-50 dark:bg-slate-800 rounded p-3 border-l-4 border-brand-red-500">
                        <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                          &quot;{booking.notes}&quot;
                        </p>
                      </div>
                    </>
                  )}

                  {/* Payment Pending Message */}
                  {booking.paymentStatus === "pending" && (
                    <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        {t("paymentVerifying")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Join Button */}
                <div className="flex-shrink-0">
                  {canJoinMeeting(booking) ? (
                    <Link href={getMeetingPageUrl(booking) || '#'}>
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        <Video className="w-4 h-4 mr-2" />
                        {t("joinMeeting")}
                      </Button>
                    </Link>
                  ) : (booking.meetingLink || booking.meetingId) && booking.paymentStatus === "paid" && new Date(booking.startAt) > now ? (
                    <div className="text-center">
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                        {t("availableBefore")}
                      </p>
                      <Button variant="outline" disabled className="border-2 border-slate-200 dark:border-slate-800">
                        <Video className="w-4 h-4 mr-2" />
                        {t("joinMeeting")}
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Book More Button */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg border-2 border-slate-200 dark:border-slate-800 p-6 text-center">
        <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-200 mb-2">
          {t("needMoreGuidance")}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          {t("bookAnotherSession")}
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/contact/meeting">
            <Button className="bg-brand-red-500 hover:bg-brand-red-600 text-white">
              {t("bookConsultation")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
