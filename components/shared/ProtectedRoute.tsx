"use client";
import { TUser } from "@/types/models.types";
import React from "react";
import { useClerk } from "@clerk/clerk-react";
import { redirect, useRouter } from "next/navigation";
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

  if (!user) {
    scnToast({
      variant: "warning",
      title: "Something went wrong",
      description: "No account found, please sign up to continue.",
    });
    signOut(() => router.push("/sign-up"));
    redirect("/sign-up");
  }

  // Check if admin access is required
  if (requireAdmin && !user.isAdmin) {
    scnToast({
      variant: "destructive",
      title: "Access Denied",
      description: "Only administrators can access instructor features.",
    });
    router.push("/");
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
