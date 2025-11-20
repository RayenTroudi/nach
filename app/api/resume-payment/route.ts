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
    const { proofUrl, bookingId, amount, notes } = body;

    if (!proofUrl || !bookingId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const resumeRequest = await ResumeRequestModel.findById(bookingId);

    if (!resumeRequest) {
      return NextResponse.json(
        { error: "Resume request not found" },
        { status: 404 }
      );
    }
    resumeRequest.paymentProofUrl = proofUrl;
    resumeRequest.paymentStatus = "pending";
    resumeRequest.price = 49;
    
    if (notes) {
      resumeRequest.additionalInfo = resumeRequest.additionalInfo 
        ? `${resumeRequest.additionalInfo}\n\nPayment Notes: ${notes}`
        : `Payment Notes: ${notes}`;
    }
    
    await resumeRequest.save();

    return NextResponse.json({
      success: true,
      message: "Payment proof submitted successfully"
    });
  } catch (error: any) {
    console.error("Error in resume payment API:", error);
    return NextResponse.json(
      { error: "Failed to submit payment proof" },
      { status: 500 }
    );
  }
}
