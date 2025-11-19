"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle, Video, Calendar, User, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";

interface BookingDetails {
  _id: string;
  userId: {
    name: string;
    email: string;
    picture?: string;
  };
  hostId: {
    name: string;
    email: string;
  };
  startAt: string;
  endAt: string;
  roomName: string;
  notes?: string;
}

const MeetingPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const roomName = params.room as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [meetingUrl, setMeetingUrl] = useState("");

  // Fetch booking details
  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await fetch(`/api/meeting/${roomName}`);
        if (response.ok) {
          const data = await response.json();
          setBooking(data.booking);
        }
      } catch (err) {
        console.error("Error fetching booking details:", err);
      }
    };

    if (roomName) {
      fetchBookingDetails();
    }
  }, [roomName]);

  useEffect(() => {
    if (!roomName) {
      setError("Invalid meeting room");
      setLoading(false);
      return;
    }

    // Generate meeting URL using kMeet - try different formats to skip app dialog
    // Try adding config.prejoinPageEnabled=false to skip join page
    const generatedMeetingUrl = `https://kmeet.infomaniak.com/GermanyFormation-${roomName}#config.prejoinPageEnabled=false&config.disableDeepLinking=true`;
    setMeetingUrl(generatedMeetingUrl);
    setLoading(false);
  }, [roomName]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openInNewTab = () => {
    window.open(meetingUrl, "_blank", "noopener,noreferrer");
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center max-w-md px-6">
          <div className="bg-red-500/10 border-2 border-red-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Unable to Join Meeting</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Try Again
            </Button>
            <Button 
              onClick={() => router.push("/")}
              className="bg-brand-red-500 hover:bg-brand-red-600 text-white"
            >
              Return Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center max-w-md px-6">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 border-4 border-brand-red-500/20 rounded-full"></div>
            </div>
            <Loader2 className="w-12 h-12 animate-spin text-brand-red-500 mx-auto relative z-10" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Preparing Meeting</h2>
          <p className="text-slate-400">Setting up your consultation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 dark:bg-slate-950">
      {/* Top Bar - Redesigned */}
      <div className="flex-shrink-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b-2 border-brand-red-500/30 px-8 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-brand-red-500/10 p-2.5 rounded-lg border-2 border-brand-red-500/50">
              <Video className="w-5 h-5 text-brand-red-500" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">Video Consultation</h1>
              {booking && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {formatDateTime(booking.startAt)} • {" "}
                  <span className="text-brand-red-400">
                    {user?.primaryEmailAddress?.emailAddress === booking.userId.email
                      ? booking.hostId.name
                      : booking.userId.name}
                  </span>
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={openInNewTab}
              variant="outline"
              size="sm"
              className="border-2 border-slate-700 bg-slate-800/50 text-slate-200 hover:bg-slate-700 hover:border-brand-red-500 hover:text-white transition-all duration-200"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              New Tab
            </Button>
            <Button
              onClick={() => router.push("/")}
              size="sm"
              className="bg-brand-red-500 hover:bg-brand-red-600 text-white border-2 border-brand-red-500 hover:border-brand-red-400 transition-all duration-200 shadow-md"
            >
              Exit Meeting
            </Button>
          </div>
        </div>
      </div>

      {/* Meeting Iframe - Full Screen */}
      <div className="flex-1 relative bg-black">
        <iframe
          src={meetingUrl}
          className="absolute inset-0 w-full h-full border-0"
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          allowFullScreen
        />
      </div>

      {/* CSS to hide kMeet logo and branding */}
      <style jsx global>{`
        iframe {
          pointer-events: auto;
        }
        /* Attempt to hide kMeet watermark/logo - may not work due to CORS */
        .watermark,
        .powered-by,
        [class*="watermark"],
        [class*="logo"],
        [data-testid*="watermark"],
        [data-testid*="logo"] {
          display: none !important;
          visibility: hidden !important;
        }
      `}</style>
    </div>
  );
};

export default MeetingPage;
