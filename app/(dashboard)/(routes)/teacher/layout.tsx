import { LeftSideBar, MobileSideBar } from "@/components/shared";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { getUserByClerkId } from "@/lib/actions";
import { TUser } from "@/types/models.types";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

export const dynamic = "force-dynamic";

const TeacherLayout = async ({ children }: { children: React.ReactNode }) => {
  const { userId } = auth();

  if (!userId) return redirect("/sign-in");

  let user: TUser = {} as TUser;

  try {
    user = await getUserByClerkId({ clerkId: userId! });
    
    // Only admins can access teacher/instructor routes
    if (!user.isAdmin) {
      console.log("Access denied: User is not an admin");
      return redirect("/");
    }
  } catch (error: any) {
    console.log("TeacherLayout Error: ", error.message);
    return redirect("/");
  }

  return <ProtectedRoute user={user} requireAdmin={true}>{children}</ProtectedRoute>;
};

export default TeacherLayout;
