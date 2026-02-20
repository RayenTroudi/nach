import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { getUserByClerkId } from "@/lib/actions";
import { TUser } from "@/types/models.types";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

export const dynamic = "force-dynamic";

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const { userId } = auth();

  if (!userId) return redirect("/sign-in");

  let user: TUser = {} as TUser;

  try {
    user = await getUserByClerkId({ clerkId: userId! });
  } catch (error: any) {}
  return <ProtectedRoute user={user}>{children}</ProtectedRoute>;
};

export default AdminLayout;
