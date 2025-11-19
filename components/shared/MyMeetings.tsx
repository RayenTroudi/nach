"use client";
import { useState } from "react";
import { Calendar, Clock, Video, CheckCircle, XCircle, HourglassIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

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
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (booking: Booking) => {
    if (booking.status === "cancelled") {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="w-3 h-3" />
          Cancelled
        </Badge>
      );
    }

    if (booking.paymentStatus === "pending") {
      return (
        <Badge className="gap-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
          <HourglassIcon className="w-3 h-3" />
          Payment Pending
        </Badge>
      );
    }

    if (booking.paymentStatus === "paid" || booking.paymentStatus === "free") {
      const meetingDate = new Date(booking.startAt);
      if (meetingDate < now) {
        return (
          <Badge className="gap-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            <CheckCircle className="w-3 h-3" />
            Completed
          </Badge>
        );
      }
      return (
        <Badge className="gap-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
          <CheckCircle className="w-3 h-3" />
          Confirmed
        </Badge>
      );
    }

    return null;
  };

  // Helper to fix old meeting links (backwards compatibility)
  const fixMeetingLink = (link: string) => {
    if (!link) return link;
    return link.replace('/meeting/', '/meet/');
  };

  const canJoinMeeting = (booking: Booking) => {
    if (!booking.meetingLink) return false;
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
            No Meetings Scheduled
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            You haven't booked any meetings yet. Schedule a consultation with our experts!
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/contact/meeting">
              <Button className="bg-brand-red-500 hover:bg-brand-red-600 text-white">
                Book Full Consultation (99 TND)
              </Button>
            </Link>
            <Link href="/contact/call">
              <Button variant="outline" className="border-2 border-slate-200 dark:border-slate-800 hover:border-brand-red-500 dark:hover:border-brand-red-500">
                Book Quick Call (49 TND)
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-950 dark:text-slate-200">
            My Meetings
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {filteredBookings.length} {filter} {filteredBookings.length === 1 ? 'meeting' : 'meetings'}
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
            Upcoming
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
            Past
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
            All
          </Button>
        </div>
      </div>

      {/* Meetings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-lg border-2 border-slate-200 dark:border-slate-800 p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            No {filter} meetings found
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
                          ? `With ${booking.hostId.firstName} ${booking.hostId.lastName}`
                          : 'With Advisor'
                        }
                      </span>
                    </div>

                    {booking.price && (
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Amount: {booking.price} TND
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {booking.notes && (
                    <>
                      <Separator className="my-4" />
                      <div className="bg-slate-50 dark:bg-slate-800 rounded p-3 border-l-4 border-brand-red-500">
                        <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                          "{booking.notes}"
                        </p>
                      </div>
                    </>
                  )}

                  {/* Payment Pending Message */}
                  {booking.paymentStatus === "pending" && (
                    <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        ⏳ Your payment proof is being verified. You'll receive a confirmation email with the meeting link once approved (usually within 24-48 hours).
                      </p>
                    </div>
                  )}
                </div>

                {/* Join Button */}
                <div className="flex-shrink-0">
                  {canJoinMeeting(booking) ? (
                    <Link href={fixMeetingLink(booking.meetingLink!)} target="_blank">
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        <Video className="w-4 h-4 mr-2" />
                        Join Meeting
                      </Button>
                    </Link>
                  ) : booking.meetingLink && booking.paymentStatus === "paid" && new Date(booking.startAt) > now ? (
                    <div className="text-center">
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                        Available 15 min before
                      </p>
                      <Button variant="outline" disabled className="border-2 border-slate-200 dark:border-slate-800">
                        <Video className="w-4 h-4 mr-2" />
                        Join Meeting
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
          Need More Guidance?
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Book another consultation session with our expert advisors
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/contact/meeting">
            <Button className="bg-brand-red-500 hover:bg-brand-red-600 text-white">
              Book Consultation
            </Button>
          </Link>
          <Link href="/contact/call">
            <Button variant="outline" className="border-2 border-slate-200 dark:border-slate-800 hover:border-brand-red-500 dark:hover:border-brand-red-500 bg-white dark:bg-slate-900">
              Quick Call
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
