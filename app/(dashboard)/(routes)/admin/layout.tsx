import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { getUserByClerkId } from "@/lib/actions";
import { TUser } from "@/types/models.types";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";
import UserDebugLogger from "@/components/shared/UserDebugLogger";

export const dynamic = "force-dynamic";

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const { userId } = auth();
  console.log("🔑 [Admin Layout] Clerk userId:", userId);

  if (!userId) return redirect("/sign-in");

  console.log("🔍 [Admin Layout] Fetching user from MongoDB...");
  const user = await getUserByClerkId({ clerkId: userId! });
  
  console.log("👤 [Admin Layout] User data:", {
    hasUser: !!user,
    userId: user?._id,
    email: user?.email,
    isAdmin: user?.isAdmin,
    firstName: user?.firstName,
  });
  
  return (
    <ProtectedRoute user={user}>
      <UserDebugLogger user={user} component="Admin Layout" />
      {children}
    </ProtectedRoute>
  );
};

export default AdminLayout;
