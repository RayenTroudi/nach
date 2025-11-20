import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { auth } from "@clerk/nextjs";
import ResumeRequestModel from "@/lib/models/resumeRequest.model";
import BookingModel from "@/lib/models/booking.model";
import PaymentProofModel from "@/lib/models/payment-proof.model";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete all resume requests
    const resumeResult = await ResumeRequestModel.deleteMany({});
    
    // Delete all bookings
    const bookingResult = await BookingModel.deleteMany({});
    
    // Delete all payment proofs
    const paymentProofResult = await PaymentProofModel.deleteMany({});

    return NextResponse.json({
      success: true,
      message: "Database cleaned successfully",
      deleted: {
        resumeRequests: resumeResult.deletedCount,
        bookings: bookingResult.deletedCount,
        paymentProofs: paymentProofResult.deletedCount,
      }
    });
  } catch (error: any) {
    console.error("Error cleaning database:", error);
    return NextResponse.json(
      { error: "Failed to clean database" },
      { status: 500 }
    );
  }
}
