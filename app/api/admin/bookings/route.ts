import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { connectToDatabase } from "@/lib/mongoose";
import Booking from "@/lib/models/booking.model";
import { getUserByClerkId } from "@/lib/actions";

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await getUserByClerkId({ clerkId: userId });
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Get pagination params
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const skip = (page - 1) * limit;

    // Fetch all bookings with populated user and host data
    const bookings = await Booking.find({})
      .populate({
        path: "userId",
        select: "clerkId firstName lastName email picture",
      })
      .populate({
        path: "hostId",
        select: "firstName lastName email",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const totalBookings = await Booking.countDocuments({});

    return NextResponse.json({
      success: true,
      bookings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalBookings / limit),
        totalBookings,
        hasMore: skip + bookings.length < totalBookings,
      },
    });
  } catch (error: any) {
    console.error("Error fetching admin bookings:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
