"use client";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Component to force Clerk session sync and handle post-sign-in state
 * This ensures the client-side Clerk state matches the server-side session
 */
export default function ClerkSessionSync() {
  const { isLoaded, userId, sessionId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) {
      console.log("🔄 [ClerkSessionSync] Clerk not loaded yet");
      return;
    }

    console.log("🔐 [ClerkSessionSync] Session state:", {
      isLoaded,
      userId,
      sessionId,
      hasSession: !!sessionId,
    });

    // If we have a session but it just loaded, refresh to ensure all components update
    if (sessionId && userId) {
      console.log("✅ [ClerkSessionSync] Session active - forcing router refresh");
      // Force a refresh to ensure all components see the new auth state
      router.refresh();
    }
  }, [isLoaded, userId, sessionId, router]);

  return null;
}
