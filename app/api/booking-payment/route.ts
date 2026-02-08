import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Booking from "@/lib/models/booking.model";
import { auth } from "@clerk/nextjs";
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

    if (!proofUrl || !bookingId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the booking
    const booking = await Booking.findById(bookingId).populate(
      "userId",
      "firstName lastName email"
    );

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Update booking with payment proof
    booking.paymentProof = proofUrl;
    booking.paymentMethod = "bank_transfer";
    booking.paymentStatus = "pending"; // Admin will verify
    await booking.save();

    // Send confirmation email
    const user: any = booking.userId;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .detail-row { padding: 10px 0; border-bottom: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Payment Proof Received</h1>
            </div>
            <div class="content">
              <p>Hi ${user.firstName},</p>
              <p>We've received your payment proof for your meeting booking.</p>
              
              <div class="detail-row">
                <strong>Booking ID:</strong> ${bookingId}
              </div>
              <div class="detail-row">
                <strong>Amount:</strong> ${amount.toFixed(2)} TND
              </div>
              ${notes ? `<div class="detail-row"><strong>Notes:</strong> ${notes}</div>` : ""}
              
              <p style="margin-top: 20px;">
                We'll verify your payment within 24-48 hours and send you a confirmation email with your meeting link.
              </p>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                If you have any questions, please contact us at support@nachdeutschland.de
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: "Payment Proof Received - Meeting Booking",
      html,
    });

    // Send notification to admin
    try {
      const startDate = new Date(booking.startAt);
      const meetingDetails = `${startDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })} at ${startDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;

      const adminEmailHtml = getPaymentRequestToAdminEmail({
        userName: `${user.firstName} ${user.lastName}`.trim(),
        userEmail: user.email,
        itemType: "meeting",
        itemNames: [`Meeting on ${meetingDetails}`],
        amount: Number(amount || booking.price || 0),
        paymentProofUrl: proofUrl,
        proofId: bookingId,
        submittedAt: new Date(),
        userNotes: notes,
      });

      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `🔔 New Meeting Payment Request - ${user.firstName} ${user.lastName}`,
        html: adminEmailHtml,
      });

      console.log("✅ Admin notification email sent to:", ADMIN_EMAIL);
    } catch (emailError) {
      console.error("❌ Error sending admin notification email:", emailError);
      // Continue even if admin email fails
    }

    return NextResponse.json({
      success: true,
      message: "Payment proof submitted successfully",
    });
  } catch (error: any) {
    console.error("Booking payment error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
