import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { connectToDatabase } from "@/lib/mongoose";
import Booking from "@/lib/models/booking.model";
import { getUserByClerkId } from "@/lib/actions";
import { sendEmail } from "@/lib/actions/email.action";
import { nanoid } from "nanoid";
import { 
  getPaymentApprovedToUserEmail, 
  getPaymentRejectedToUserEmail 
} from "@/lib/utils/email-templates";

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const admin = await getUserByClerkId({ clerkId: userId });
    if (!admin || !admin.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { bookingId, action, adminNotes } = body;

    if (!bookingId || !action) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find the booking
    const booking = await Booking.findById(bookingId)
      .populate("userId", "firstName lastName email")
      .populate("hostId", "firstName lastName email");

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    if (action === "approve") {
      // Generate meeting link (Jitsi room)
      const meetingId = nanoid(12);
      const meetingLink = `${process.env.NEXT_PUBLIC_SERVER_URL}/meet/${meetingId}`;

      // Update booking status
      booking.paymentStatus = "paid";
      booking.meetingLink = meetingLink;
      booking.meetingId = meetingId;
      if (adminNotes) {
        booking.adminNotes = adminNotes;
      }
      await booking.save();

      // Send confirmation email to user
      const startDate = new Date(booking.startAt);
      const endDate = new Date(booking.endAt);
      const formattedTime = `${startDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${endDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })} (${booking.timezone})`;

      const emailHtml = getPaymentApprovedToUserEmail({
        userName: booking.userId.firstName,
        itemType: "meeting",
        itemNames: ["Consultation Meeting"],
        amount: booking.price || 0,
        accessUrl: meetingLink,
        meetingLink: meetingLink,
        meetingDate: startDate,
        meetingTime: formattedTime,
        adminNotes,
      });

      await sendEmail({
        to: booking.userId.email,
        subject: "✅ Meeting Confirmed - Payment Approved",
        html: emailHtml,
      });

      return NextResponse.json({
        success: true,
        message: "Booking approved and confirmation email sent",
        booking,
      });
    } else {
      // Reject the booking
      booking.status = "cancelled";
      booking.paymentStatus = "rejected";
      if (adminNotes) {
        booking.adminNotes = adminNotes;
      }
      await booking.save();

      // Send rejection email
      await sendEmail({
        to: booking.userId.email,
        subject: "Meeting Payment Review - Action Required",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #dc2626; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Payment Review Required</h1>
            </div>
            
            <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                Hi ${booking.userId.firstName},
              </p>
              
              <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                We've reviewed your payment proof for the meeting scheduled on ${new Date(booking.startAt).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}, and unfortunately we couldn't verify it.
              </p>
              
              ${adminNotes ? `
                <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                  <p style="color: #92400e; margin: 0;">
                    <strong>Reason:</strong> ${adminNotes}
                  </p>
                </div>
              ` : ''}
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #1f2937; margin-top: 0;">What's Next?</h3>
                <p style="color: #374151; margin-bottom: 10px;">
                  Please submit a clearer payment proof or make a new booking:
                </p>
                <ul style="color: #374151; line-height: 1.6;">
                  <li>Ensure the transaction reference includes your booking ID</li>
                  <li>Upload a clear image of your payment receipt</li>
                  <li>Make sure the amount matches: ${booking.price} TND</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/contact/meeting" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                  Book New Meeting
                </a>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                If you have any questions, please contact our support team.<br>
                The GermanyFormation Team
              </p>
            </div>
          </div>
        `,
      });

      return NextResponse.json({
        success: true,
        message: "Booking rejected and notification email sent",
        booking,
      });
    }
  } caconst resubmitUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/contact/meeting`;

      const emailHtml = getPaymentRejectedToUserEmail({
        userName: booking.userId.firstName,
        itemType: "meeting",
        itemNames: ["Consultation Meeting"],
        amount: booking.price || 0,
        adminNotes,
        resubmitUrl,
      });

      await sendEmail({
        to: booking.userId.email,
        subject: "⚠️ Meeting Payment Review - Action Required",
        html: emailHtml