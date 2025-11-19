"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

const MeetingPage = () => {
  const params = useParams();
  const router = useRouter();
  const roomName = params.room as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    // Load Jitsi script
    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    script.onload = () => initializeJitsi();
    script.onerror = () => {
      setError("Failed to load meeting interface");
      setLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [roomName]);

  const initializeJitsi = () => {
    try {
      const domain = "meet.jit.si";
      const options = {
        roomName: `GermanyFormation-${roomName}`,
        width: "100%",
        height: "100%",
        parentNode: document.querySelector("#jitsi-container"),
        configOverwrite: {
          prejoinPageEnabled: false,
          startWithAudioMuted: false,
          startWithVideoMuted: false,
        },
        interfaceConfigOverwrite: {
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
            "etherpad",
            "sharedvideo",
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
        router.push("/");
      });

      setLoading(false);
    } catch (err) {
      console.error("Jitsi initialization error:", err);
      setError("Failed to initialize meeting");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-semibold">Loading meeting room...</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please wait while we connect you
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Unable to Join Meeting</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => router.push("/")}>Return Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black">
      <div id="jitsi-container" className="w-full h-full" />
    </div>
  );
};

export default MeetingPage;
