import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import ResumeRequestModel from "@/lib/models/resumeRequest.model";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { requestId, completedResumeUrl, completedMotivationLetterUrl, completedMotivationLetter2Url } = body;

    console.log("Resume complete API - Received data:", { requestId, completedResumeUrl, completedMotivationLetterUrl, completedMotivationLetter2Url });

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

    if (completedMotivationLetter2Url) {
      updateData.completedMotivationLetter2Url = completedMotivationLetter2Url;
    }

    console.log("Resume complete API - Update data:", updateData);

    const updatedRequest = await ResumeRequestModel.findByIdAndUpdate(
      requestId,
      updateData,
      { new: true }
    );

    console.log("Resume complete API - Updated document:", updatedRequest);

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
