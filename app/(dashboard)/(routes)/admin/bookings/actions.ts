"use server";

import { connectToDatabase } from "@/lib/mongoose";
import Booking from "@/lib/models/booking.model";

export async function getAdminBookings(page: number = 1, limit: number = 100) {
  try {
    await connectToDatabase();

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

    // Serialize the data
    const serializedBookings = (bookings as any[]).map((booking: any) => ({
      ...booking,
      _id: booking._id.toString(),
      userId: booking.userId ? {
        ...booking.userId,
        _id: booking.userId._id.toString(),
      } : null,
      hostId: booking.hostId ? {
        ...booking.hostId,
        _id: booking.hostId._id.toString(),
      } : null,
      startAt: booking.startAt.toISOString(),
      endAt: booking.endAt.toISOString(),
      createdAt: booking.createdAt.toISOString(),
    }));

    return {
      success: true,
      bookings: serializedBookings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalBookings / limit),
        totalBookings,
        hasMore: skip + bookings.length < totalBookings,
      },
    };
  } catch (error: any) {
    console.error("Error fetching admin bookings:", error);
    return { 
      success: false, 
      error: error.message || "Failed to fetch bookings" 
    };
  }
}

export async function updateBookingStatus(
  bookingId: string, 
  action: "approve" | "reject",
  adminNotes?: string
) {
  try {
    await connectToDatabase();

    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    if (action === "approve") {
      booking.paymentStatus = "paid";
      booking.status = "scheduled";
    } else if (action === "reject") {
      booking.status = "cancelled";
    }

    if (adminNotes) {
      booking.notes = adminNotes;
    }

    await booking.save();

    console.log(`✅ Booking ${action}ed:`, {
      bookingId,
      paymentStatus: booking.paymentStatus,
      status: booking.status,
    });

    return {
      success: true,
      message: `Booking ${action}ed successfully`,
      booking: {
        _id: booking._id.toString(),
        paymentStatus: booking.paymentStatus,
        status: booking.status,
      },
    };
  } catch (error: any) {
    console.error(`Error ${action}ing booking:`, error);
    return { 
      success: false, 
      error: error.message || `Failed to ${action} booking` 
    };
  }
}
