import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import ResumeRequestModel from "@/lib/models/resumeRequest.model";
import { auth } from "@clerk/nextjs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status, paymentStatus, adminNotes, completedResumeUrl } = body;

    await connectToDatabase();

    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (completedResumeUrl !== undefined) updateData.completedResumeUrl = completedResumeUrl;

    const updatedRequest = await ResumeRequestModel.findByIdAndUpdate(
      params.id,
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
      resumeRequest: updatedRequest,
    });
  } catch (error: any) {
    console.error("Error updating resume request:", error);
    return NextResponse.json(
      { error: "Failed to update resume request" },
      { status: 500 }
    );
  }
}
