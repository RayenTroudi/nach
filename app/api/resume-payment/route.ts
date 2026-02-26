import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import ResumeRequestModel from "@/lib/models/resumeRequest.model";
import { auth } from "@clerk/nextjs/server";
import { sendEmail } from "@/lib/actions/email.action";
import { getPaymentRequestToAdminEmail } from "@/lib/utils/email-templates";

const ADMIN_EMAIL = "talel.jouini02@gmail.com";

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

    // Validate proofUrl is present and is a valid string
    if (!proofUrl || typeof proofUrl !== 'string' || proofUrl.trim() === '') {
      console.error("❌ Invalid or missing proofUrl:", { proofUrl, bookingId });
      return NextResponse.json(
        { error: "Payment proof URL is required and must be valid" },
        { status: 400 }
      );
    }
    
    if (!bookingId || typeof bookingId !== 'string') {
      console.error("❌ Invalid or missing bookingId:", { proofUrl, bookingId });
      return NextResponse.json(
        { error: "Booking ID is required and must be valid" },
        { status: 400 }
      );
    }
    
    console.log("✅ Valid payment proof submission:", { 
      proofUrl: proofUrl.substring(0, 50) + '...', 
      bookingId,
      userId 
    });
    
    const resumeRequest = await ResumeRequestModel.findById(bookingId);

    if (!resumeRequest) {
      return NextResponse.json(
        { error: "Resume request not found" },
        { status: 404 }
      );
    }
    resumeRequest.paymentProofUrl = proofUrl;
    resumeRequest.paymentStatus = "pending";
    resumeRequest.price = amount || 100; // Use the amount from request or default to 100
    
    if (notes) {
      resumeRequest.additionalInfo = resumeRequest.additionalInfo 
        ? `${resumeRequest.additionalInfo}\n\nPayment Notes: ${notes}`
        : `Payment Notes: ${notes}`;
    }
    
    await resumeRequest.save();

    // Send notification email to admin
    try {
      const emailHtml = getPaymentRequestToAdminEmail({
        userName: resumeRequest.name || "User",
        userEmail: resumeRequest.email,
        itemType: "resume",
        itemNames: ["Professional Resume Service"],
        amount: Number(amount || resumeRequest.price || 49),
        paymentProofUrl: proofUrl,
        proofId: bookingId,
        submittedAt: new Date(),
        userNotes: notes,
      });

      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `🔔 New Resume Service Payment Request - ${resumeRequest.name}`,
        html: emailHtml,
      });

      console.log("✅ Admin notification email sent to:", ADMIN_EMAIL);
    } catch (emailError) {
      console.error("❌ Error sending admin notification email:", emailError);
      // Continue even if email fails
    }

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
