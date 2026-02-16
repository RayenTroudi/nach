import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongoose";
import Booking from "@/lib/models/booking.model";
import User from "@/lib/models/user.model";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Find the user
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is Talel Jouini (the designated consultant/teacher)
    const isTalelJouini = user.username.toLowerCase().includes("talel") && 
                          user.username.toLowerCase().includes("jouini");
    
    if (!isTalelJouini) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Only Talel Jouini can access consultations" },
        { status: 403 }
      );
    }

    // Fetch bookings where this teacher is the host
    const bookings = await Booking.find({ hostId: user._id })
      .populate("userId", "username firstName lastName email picture")
      .populate("hostId", "username firstName lastName email")
      .sort({ startAt: 1 }); // Sort by start time (earliest first)

    return NextResponse.json(
      {
        success: true,
        bookings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching consultations:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
