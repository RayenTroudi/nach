import { LeftSideBar, MobileSideBar } from "@/components/shared";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { getUserByClerkId } from "@/lib/actions";
import { TUser } from "@/types/models.types";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";
import UserDebugLogger from "@/components/shared/UserDebugLogger";

export const dynamic = "force-dynamic";

const TeacherLayout = async ({ children }: { children: React.ReactNode }) => {
  const { userId } = auth();
  console.log("🔑 [Teacher Layout] Clerk userId:", userId);

  if (!userId) return redirect("/sign-in");

  console.log("🔍 [Teacher Layout] Fetching user from MongoDB...");
  const user = await getUserByClerkId({ clerkId: userId! });
  
  console.log("👤 [Teacher Layout] User data:", {
    hasUser: !!user,
    userId: user?._id,
    email: user?.email,
    isAdmin: user?.isAdmin,
    firstName: user?.firstName,
  });
  
  // Only admins can access teacher/instructor routes
  if (!user.isAdmin) {
    console.log("❌ [Teacher Layout] Access denied: User is not an admin");
    return redirect("/");
  }

  return (
    <ProtectedRoute user={user} requireAdmin={true}>
      <UserDebugLogger user={user} component="Teacher Layout" />
      {children}
    </ProtectedRoute>
  );
};

export default TeacherLayout;
