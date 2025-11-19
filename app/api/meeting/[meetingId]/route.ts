import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import Booking from "@/lib/models/booking.model";

export async function GET(
  req: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  try {
    const { meetingId } = params;

    if (!meetingId) {
      return NextResponse.json(
        { success: false, error: "Meeting ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find booking by meetingId
    const booking = await Booking.findOne({ meetingId })
      .populate("userId", "name email picture")
      .populate("hostId", "name email");

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Meeting not found" },
        { status: 404 }
      );
    }

    // Check if meeting is valid (not cancelled)
    if (booking.paymentStatus === "rejected") {
      return NextResponse.json(
        { success: false, error: "This meeting has been cancelled" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        booking: {
          _id: booking._id,
          userId: booking.userId,
          hostId: booking.hostId,
          startAt: booking.startAt,
          endAt: booking.endAt,
          roomName: booking.roomName,
          notes: booking.notes,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching meeting details:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
