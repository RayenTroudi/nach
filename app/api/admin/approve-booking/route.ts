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
      const resubmitUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/contact/meeting`;

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
        html: emailHtml,
      });

      return NextResponse.json({
        success: true,
        message: "Booking rejected and notification email sent",
        booking,
      });
    }
  } catch (error: any) {
    console.error("Error processing booking approval:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
