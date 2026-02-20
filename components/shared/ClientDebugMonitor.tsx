"use client";
import { useEffect } from "react";

/**
 * Add this to _app or layout to monitor page loads and authentication state
 */
export default function ClientDebugMonitor() {
  useEffect(() => {
    console.log("🌐 [ClientDebugMonitor] Page loaded/navigation occurred");
    console.log("🌐 [ClientDebugMonitor] Current URL:", window.location.href);
    console.log("🌐 [ClientDebugMonitor] Pathname:", window.location.pathname);
    
    // Check if Clerk is loaded
    const checkClerk = setInterval(() => {
      // @ts-ignore
      if (window.Clerk) {
        console.log("✅ [ClientDebugMonitor] Clerk is loaded");
        // @ts-ignore
        console.log("🔑 [ClientDebugMonitor] Clerk session:", {
          // @ts-ignore
          userId: window.Clerk.user?.id,
          // @ts-ignore
          email: window.Clerk.user?.primaryEmailAddress?.emailAddress,
        });
        clearInterval(checkClerk);
      }
    }, 100);

    // Clear after 5 seconds if Clerk doesn't load
    setTimeout(() => clearInterval(checkClerk), 5000);

    // Add a global function to check debug info
    // @ts-ignore
    window.debugUserInfo = async () => {
      console.log("🔍 Fetching debug info from API...");
      try {
        const response = await fetch("/api/debug/user");
        const data = await response.json();
        console.log("🔍 Debug API Response:", data);
        return data;
      } catch (error) {
        console.error("❌ Failed to fetch debug info:", error);
        return null;
      }
    };

    console.log("💡 [ClientDebugMonitor] You can call window.debugUserInfo() in console to check user data");
  }, []);

  return null;
}
