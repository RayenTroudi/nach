import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import ResumeRequestModel from "@/lib/models/resumeRequest.model";
import UserModel from "@/lib/models/user.model";
import { auth, currentUser } from "@clerk/nextjs";

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the full Clerk user to access email
    const clerkUser = await currentUser();
    const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress;

    if (!userEmail) {
      return NextResponse.json({ 
        resumeRequests: [],
        hasInProgress: false,
        hasPending: false
      });
    }

    await connectToDatabase();

    // Find user by clerkId
    const user = await UserModel.findOne({ clerkId: userId });

    // Build query: Always check by email, and if user exists in UserModel, also check by userId
    const query: any = { email: userEmail };
    
    if (user) {
      // Also match by userId (MongoDB ObjectId)
      query.$or = [
        { email: userEmail },
        { userId: user._id }
      ];
      delete query.email;
    }

    // Find all resume requests for this user
    const resumeRequests = await ResumeRequestModel.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Calculate helper flags
    const hasInProgress = resumeRequests.some(req => req.status === "in_progress");
    const hasPending = resumeRequests.some(req => req.paymentStatus === "pending");

    console.log(`[Resume Requests] User: ${userEmail}, Found: ${resumeRequests.length}, InProgress: ${hasInProgress}`);

    return NextResponse.json({ 
      success: true,
      resumeRequests,
      hasInProgress,
      hasPending
    });
  } catch (error: any) {
    console.error("Error fetching resume requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch resume requests" },
      { status: 500 }
    );
  }
}
