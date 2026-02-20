import ProtectedRoute from "@/components/shared/ProtectedRoute";
import React from "react";
import { LeftSideBar } from "@/components/shared";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/actions";
import { redirect } from "next/navigation";
import { TUser } from "@/types/models.types";
import ProfileForm from "./_components/ProfileForm";

const page = async () => {
  const { userId } = auth();
  if (!userId) return redirect("/sign-in");

  let student: TUser = {} as TUser;

  try {
    student = await getUserByClerkId({ clerkId: userId! });
  } catch (error: any) {}

  return (
    <ProtectedRoute user={student}>
      <div className="flex gap-4">
        <LeftSideBar />
        <ProfileForm user={student} />
      </div>
    </ProtectedRoute>
  );
};

export default page;
