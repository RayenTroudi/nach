import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import ResumeRequestModel from "@/lib/models/resumeRequest.model";
import { auth } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { requestId, completedResumeUrl, completedMotivationLetterUrl } = body;

    if (!requestId || !completedResumeUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update the resume request with the completed resume and motivation letter URLs
    const updateData: any = {
      completedResumeUrl: completedResumeUrl,
      status: "completed",
    };

    if (completedMotivationLetterUrl) {
      updateData.completedMotivationLetterUrl = completedMotivationLetterUrl;
    }

    const updatedRequest = await ResumeRequestModel.findByIdAndUpdate(
      requestId,
      updateData,
      { new: true }
    );

    if (!updatedRequest) {
      return NextResponse.json(
        { error: "Resume request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Resume delivered successfully",
    });
  } catch (error: any) {
    console.error("Error completing resume:", error);
    return NextResponse.json(
      { error: "Failed to complete resume" },
      { status: 500 }
    );
  }
}
