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

    // Generate meeting URL using kMeet
    const generatedMeetingUrl = `https://kmeet.infomaniak.com/GermanyFormation-${roomName}`;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-slate-800/50 rounded-lg p-6 mb-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <Video className="w-8 h-8 text-brand-red-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">Video Consultation</h1>
                <p className="text-slate-400 text-sm">GermanyFormation Meeting Room</p>
              </div>
            </div>

            {booking && (
              <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-700">
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-5 h-5 text-brand-red-500" />
                  <div>
                    <p className="text-xs text-slate-400">Scheduled for</p>
                    <p className="font-medium">{formatDateTime(booking.startAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <User className="w-5 h-5 text-brand-red-500" />
                  <div>
                    <p className="text-xs text-slate-400">Meeting with</p>
                    <p className="font-medium">
                      {user?.primaryEmailAddress?.emailAddress === booking.userId.email
                        ? booking.hostId.name
                        : booking.userId.name}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Meeting Options */}
          <div className="bg-slate-800/50 rounded-lg p-8 border border-slate-700 text-center">
            <h2 className="text-xl font-semibold text-white mb-4">Join Your Meeting</h2>
            <p className="text-slate-400 mb-6">
              Choose how you'd like to join the video consultation
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* Open in New Tab */}
              <Button
                onClick={openInNewTab}
                className="bg-brand-red-500 hover:bg-brand-red-600 text-white px-8 py-6 text-lg"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Open in New Tab
              </Button>

              {/* Join in Browser */}
              <Button
                onClick={() => {
                  const iframe = document.getElementById("meeting-iframe") as HTMLIFrameElement;
                  if (iframe) {
                    iframe.src = meetingUrl;
                    document.getElementById("meeting-container")?.classList.remove("hidden");
                    document.getElementById("join-options")?.classList.add("hidden");
                  }
                }}
                variant="outline"
                className="border-2 border-slate-600 text-slate-200 hover:bg-slate-700 px-8 py-6 text-lg"
              >
                <Video className="w-5 h-5 mr-2" />
                Join in Browser
              </Button>
            </div>

            <p className="text-sm text-slate-500 mt-6">
              Meeting Room: <span className="text-slate-300 font-mono">{roomName}</span>
            </p>
          </div>

          {/* Iframe Container (Hidden by default) */}
          <div id="meeting-container" className="hidden mt-6">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Meeting in Progress</h3>
                <Button
                  onClick={() => {
                    document.getElementById("meeting-container")?.classList.add("hidden");
                    document.getElementById("join-options")?.classList.remove("hidden");
                    const iframe = document.getElementById("meeting-iframe") as HTMLIFrameElement;
                    if (iframe) iframe.src = "";
                  }}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300"
                >
                  Close Meeting
                </Button>
              </div>
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  id="meeting-iframe"
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  allow="camera; microphone; fullscreen; display-capture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div id="join-options" className="mt-6 bg-slate-800/30 rounded-lg p-6 border border-slate-700/50">
            <h3 className="text-white font-semibold mb-3">Meeting Instructions</h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-brand-red-500 mt-1">•</span>
                <span>Make sure your camera and microphone are working properly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-red-500 mt-1">•</span>
                <span>Use headphones for better audio quality</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-red-500 mt-1">•</span>
                <span>Find a quiet space with good lighting</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-red-500 mt-1">•</span>
                <span>Test your internet connection before joining</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingPage;
