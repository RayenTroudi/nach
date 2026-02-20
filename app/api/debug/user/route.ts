import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserByClerkId } from "@/lib/actions";

export const dynamic = "force-dynamic";

/**
 * Debug endpoint to check user data
 * Access at: /api/debug/user
 */
export async function GET() {
  try {
    console.log("🔍 [Debug API] Request received");
    
    const { userId } = auth();
    console.log("🔍 [Debug API] Clerk userId:", userId);

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: "Not authenticated",
        clerkUserId: null,
        clerkUser: null,
        mongoUser: null,
      });
    }

    // Get Clerk user data
    const clerkUser = await currentUser();
    console.log("🔍 [Debug API] Clerk user:", clerkUser?.emailAddresses?.[0]?.emailAddress);

    // Try to get MongoDB user
    let mongoUser = null;
    let mongoError = null;
    try {
      mongoUser = await getUserByClerkId({ clerkId: userId });
      console.log("🔍 [Debug API] MongoDB user found:", {
        _id: mongoUser?._id,
        email: mongoUser?.email,
        isAdmin: mongoUser?.isAdmin,
      });
    } catch (error: any) {
      mongoError = error.message;
      console.error("🔍 [Debug API] MongoDB error:", error.message);
    }

    return NextResponse.json({
      success: true,
      clerkUserId: userId,
      clerkUser: {
        id: clerkUser?.id,
        email: clerkUser?.emailAddresses?.[0]?.emailAddress,
        firstName: clerkUser?.firstName,
        lastName: clerkUser?.lastName,
        username: clerkUser?.username,
        imageUrl: clerkUser?.imageUrl,
      },
      mongoUser: mongoUser ? {
        _id: mongoUser._id,
        clerkId: mongoUser.clerkId,
        email: mongoUser.email,
        firstName: mongoUser.firstName,
        lastName: mongoUser.lastName,
        username: mongoUser.username,
        isAdmin: mongoUser.isAdmin,
        picture: mongoUser.picture,
        wallet: mongoUser.wallet,
        enrolledCoursesCount: mongoUser.enrolledCourses?.length || 0,
        createdCoursesCount: mongoUser.createdCourses?.length || 0,
      } : null,
      mongoError,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("🔍 [Debug API] Fatal error:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch user info",
      },
      { status: 500 }
    );
  }
}
