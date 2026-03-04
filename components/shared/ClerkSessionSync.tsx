"use client";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Component to force Clerk session sync and handle post-sign-in state
 * This ensures the client-side Clerk state matches the server-side session
 */
export default function ClerkSessionSync() {
  const { isLoaded, userId, sessionId } = useAuth();
  const router = useRouter();
  const hasSyncedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      hasSynced: hasSyncedRef.current,
    });

    // If we have a session and haven't synced yet, schedule a refresh
    // Use setTimeout to ensure component tree is fully mounted before state update
    if (sessionId && userId && !hasSyncedRef.current) {
      console.log("✅ [ClerkSessionSync] Session active - scheduling router refresh");
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Delay the refresh to ensure component tree is mounted
      timeoutRef.current = setTimeout(() => {
        if (!hasSyncedRef.current) {
          hasSyncedRef.current = true;
          router.refresh();
        }
      }, 100);
    }

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoaded, userId, sessionId, router]);

  return null;
}
