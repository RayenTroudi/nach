"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle, Video, Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

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
  const [jitsiApi, setJitsiApi] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

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
    if (!roomName || isInitialized) {
      if (!roomName) {
        setError("Invalid meeting room");
        setLoading(false);
      }
      return;
    }

    setIsInitialized(true);

    // Load Jitsi script
    const script = document.createElement("script");
    script.src = "https://8x8.vc/vpaas-magic-cookie-1dbdb84c5a08439c9f587946d3c3c35d/external_api.js";
    script.async = true;
    script.onload = () => {
      // Wait for DOM to be ready before initializing
      setTimeout(() => {
        const container = document.querySelector("#jitsi-container");
        if (container && !jitsiApi) {
          initializeJitsi();
        } else if (!container) {
          setError("Meeting container not found");
          setLoading(false);
        }
      }, 100);
    };
    script.onerror = () => {
      setError("Failed to load meeting interface. Please check your internet connection.");
      setLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup Jitsi when component unmounts
      if (jitsiApi) {
        jitsiApi.dispose();
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [roomName]);

  const initializeJitsi = () => {
    try {
      if (!window.JitsiMeetExternalAPI) {
        setError("Meeting interface not available");
        setLoading(false);
        return;
      }

      // Check if container already has Jitsi iframe
      const container = document.querySelector("#jitsi-container");
      if (container?.querySelector("iframe")) {
        console.log("Jitsi already initialized, skipping...");
        setLoading(false);
        return;
      }

      const domain = "8x8.vc";
      const options = {
        roomName: `vpaas-magic-cookie-1dbdb84c5a08439c9f587946d3c3c35d/GermanyFormation-${roomName}`,
        width: "100%",
        height: "100%",
        parentNode: container,
        userInfo: {
          displayName: user?.fullName || user?.firstName || "Guest",
          email: user?.primaryEmailAddress?.emailAddress || "",
        },
        configOverwrite: {
          prejoinPageEnabled: false,
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          enableWelcomePage: false,
          enableClosePage: false,
          disableDeepLinking: true,
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          DEFAULT_BACKGROUND: "#1e293b",
          TOOLBAR_BUTTONS: [
            "microphone",
            "camera",
            "closedcaptions",
            "desktop",
            "fullscreen",
            "fodeviceselection",
            "hangup",
            "chat",
            "recording",
            "livestreaming",
            "settings",
            "raisehand",
            "videoquality",
            "filmstrip",
            "stats",
            "shortcuts",
            "tileview",
            "help",
          ],
        },
      };

      const api = new window.JitsiMeetExternalAPI(domain, options);

      api.addEventListener("readyToClose", () => {
        api.dispose();
        router.push("/");
      });

      api.addEventListener("videoConferenceJoined", () => {
        console.log("Successfully joined the meeting");
      });

      api.addEventListener("participantLeft", (participant: any) => {
        console.log("Participant left:", participant);
      });

      setJitsiApi(api);
      setLoading(false);
    } catch (err) {
      console.error("Jitsi initialization error:", err);
      setError("Failed to initialize meeting. Please try again.");
      setLoading(false);
    }
  };

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

  return (
    <>
      {loading && (
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 absolute inset-0 z-50">
          <div className="text-center max-w-md px-6">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 border-4 border-brand-red-500/20 rounded-full"></div>
              </div>
              <Loader2 className="w-12 h-12 animate-spin text-brand-red-500 mx-auto relative z-10" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Connecting to Meeting</h2>
            <p className="text-slate-400 mb-6">
              Please wait while we set up your video call...
            </p>
            
            {booking && (
              <div className="bg-slate-800/50 rounded-lg p-4 text-left border border-slate-700">
                <div className="flex items-center gap-3 mb-3">
                  <Video className="w-5 h-5 text-brand-red-500" />
                  <span className="text-white font-medium">Meeting Details</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDateTime(booking.startAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <User className="w-4 h-4" />
                    <span>
                      {user?.primaryEmailAddress?.emailAddress === booking.userId.email ? 
                        `With ${booking.hostId.name}` : 
                        `With ${booking.userId.name}`
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="h-screen w-screen bg-black">
        <div id="jitsi-container" className="w-full h-full" />
      </div>
    </>
  );
};

export default MeetingPage;
