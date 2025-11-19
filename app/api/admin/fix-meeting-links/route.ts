import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongoose";
import Booking from "@/lib/models/booking.model";
import User from "@/lib/models/user.model";

/**
 * Migration endpoint to fix existing meeting links
 * GET /api/admin/fix-meeting-links
 * 
 * Updates all bookings with /meeting/ to /meet/
 */
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

    // Verify admin access
    const user = await User.findOne({ clerkId: userId });
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    // Find and update bookings with old meeting links
    const bookingsToUpdate = await Booking.find({
      meetingLink: { $regex: /\/meeting\// }
    });

    console.log(`Found ${bookingsToUpdate.length} bookings to update`);

    let updated = 0;
    const results = [];

    for (const booking of bookingsToUpdate) {
      if (booking.meetingLink) {
        const oldLink = booking.meetingLink;
        booking.meetingLink = booking.meetingLink.replace('/meeting/', '/meet/');
        await booking.save();
        updated++;
        
        results.push({
          bookingId: booking._id,
          oldLink,
          newLink: booking.meetingLink
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updated} bookings`,
      updated,
      total: bookingsToUpdate.length,
      results
    });

  } catch (error) {
    console.error("Error fixing meeting links:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
