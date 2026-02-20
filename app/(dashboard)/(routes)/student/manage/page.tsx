import ProtectedRoute from "@/components/shared/ProtectedRoute";
import React from "react";
import { LeftSideBar } from "@/components/shared";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/actions";
import { redirect } from "next/navigation";
import { TUser } from "@/types/models.types";
import ProfileForm from "@/app/(dashboard)/(routes)/(student)/manage/_components/ProfileForm";
import UserDebugLogger from "@/components/shared/UserDebugLogger";

export const dynamic = "force-dynamic";

const ManagePage = async () => {
  const { userId } = auth();
  console.log("🔑 [Student/Manage Page] Clerk userId:", userId);
  
  if (!userId) return redirect("/sign-in");

  console.log("🔍 [Student/Manage Page] Fetching user from MongoDB...");
  const student = await getUserByClerkId({ clerkId: userId! });
  
  console.log("👤 [Student/Manage Page] Student data:", {
    hasStudent: !!student,
    studentId: student?._id,
    email: student?.email,
    isAdmin: student?.isAdmin,
    firstName: student?.firstName,
  });

  return (
    <ProtectedRoute user={student}>
      <UserDebugLogger user={student} component="Student/Manage Page" />
      <div className="flex gap-4">
        <LeftSideBar />
        <ProfileForm user={student} />
      </div>
    </ProtectedRoute>
  );
};

export default ManagePage;
