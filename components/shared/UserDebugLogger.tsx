"use client";
import { TUser } from "@/types/models.types";
import { useEffect } from "react";

interface UserDebugLoggerProps {
  user: TUser;
  component: string;
}

/**
 * Client-side component that logs user data to browser console
 * This helps debug what data is being passed from server to client
 */
export default function UserDebugLogger({ user, component }: UserDebugLoggerProps) {
  useEffect(() => {
    console.log(`🔍 [${component}] User data received from server:`, {
      hasUser: !!user,
      userId: user?._id,
      clerkId: user?.clerkId,
      email: user?.email,
      firstName: user?.firstName,
      lastName: user?.lastName,
      isAdmin: user?.isAdmin,
      username: user?.username,
      picture: user?.picture,
      wallet: user?.wallet,
      enrolledCoursesCount: user?.enrolledCourses?.length || 0,
      createdCoursesCount: user?.createdCourses?.length || 0,
      fullUserObject: user,
    });

    if (!user) {
      console.error(`❌ [${component}] User object is NULL or UNDEFINED!`);
    } else if (!user._id) {
      console.error(`❌ [${component}] User object exists but _id is missing!`, user);
    } else {
      console.log(`✅ [${component}] User object is valid with _id:`, user._id);
    }
  }, [user, component]);

  return null; // This component doesn't render anything
}
