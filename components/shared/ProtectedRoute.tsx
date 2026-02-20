"use client";
import { TUser } from "@/types/models.types";
import React from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { scnToast } from "../ui/use-toast";

const ProtectedRoute = ({
  user,
  children,
  requireAdmin = false,
}: {
  user: TUser;
  children: React.ReactNode;
  requireAdmin?: boolean;
}) => {
  const { signOut } = useClerk();
  const router = useRouter();

  console.log("🛡️ ProtectedRoute - Checking user:", {
    hasUser: !!user,
    hasUserId: !!user?._id,
    userEmail: user?.email,
    isAdmin: user?.isAdmin,
    requireAdmin,
    firstName: user?.firstName,
    clerkId: user?.clerkId,
  });

  if (!user || !user._id) {
    console.error("❌ ProtectedRoute - User validation failed:", {
      user,
      hasUser: !!user,
      hasUserId: !!user?._id,
    });
    scnToast({
      variant: "warning",
      title: "Something went wrong",
      description: "No account found, please sign up to continue.",
    });
    signOut(() => router.push("/sign-up"));
    return null;
  }

  // Check if admin access is required
  if (requireAdmin && !user.isAdmin) {
    console.warn("⚠️ ProtectedRoute - Admin access denied:", {
      requireAdmin,
      isAdmin: user.isAdmin,
      userEmail: user.email,
    });
    scnToast({
      variant: "destructive",
      title: "Access Denied",
      description: "Only administrators can access instructor features.",
    });
    router.push("/");
    return null;
  }

  console.log("✅ ProtectedRoute - Access granted");
  return <>{children}</>;
};

export default ProtectedRoute;
