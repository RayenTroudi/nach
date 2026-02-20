import ProtectedRoute from "@/components/shared/ProtectedRoute";
import React from "react";
import { LeftSideBar } from "@/components/shared";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/actions";
import { redirect } from "next/navigation";
import { TUser } from "@/types/models.types";
import ProfileForm from "@/app/(dashboard)/(routes)/(student)/manage/_components/ProfileForm";

const ManagePage = async () => {
  const { userId } = auth();
  console.log("🔑 [Locale/student/Manage Page] Clerk userId:", userId);
  
  if (!userId) return redirect("/sign-in");

  console.log("🔍 [Locale/student/Manage Page] Fetching user from MongoDB...");
  const student = await getUserByClerkId({ clerkId: userId! });
  
  console.log("👤 [Locale/student/Manage Page] Student data:", {
    hasStudent: !!student,
    studentId: student?._id,
    email: student?.email,
    isAdmin: student?.isAdmin,
    firstName: student?.firstName,
  });

  return (
    <ProtectedRoute user={student}>
      <div className="flex gap-4">
        <LeftSideBar />
        <ProfileForm user={student} />
      </div>
    </ProtectedRoute>
  );
};

export default ManagePage;
