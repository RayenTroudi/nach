import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongoose";
import Availability from "@/lib/models/availability.model";
import User from "@/lib/models/user.model";

// GET - Fetch teacher's availability (Public - no auth required)
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Find Talel Jouini's user account to get his availability
    const talelUser = await User.findOne({
      $or: [
        { username: /talel.*jouini/i },
        { username: /jouini.*talel/i }
      ]
    });

    if (!talelUser) {
      return NextResponse.json(
        { success: false, error: "Teacher not found" },
        { status: 404 }
      );
    }

    const availability = await Availability.find({ userId: talelUser._id })
      .sort({ date: 1, startTime: 1 })
      .lean();

    // Ensure dates are properly formatted as ISO strings
    const formattedAvailability = availability.map((slot: any) => ({
      ...slot,
      date: slot.date ? new Date(slot.date).toISOString() : null
    }));

    return NextResponse.json(
      {
        success: true,
        availability: formattedAvailability,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Add new availability slot
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { date, startTime, endTime } = body;

    if (!date || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Parse date string in UTC to avoid timezone shifts
    // Ensure the date is treated as UTC midnight by appending time
    const dateString = date.includes('T') ? date : `${date}T00:00:00.000Z`;
    const availabilityDate = new Date(dateString);
    
    if (isNaN(availabilityDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid date format" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is Talel Jouini
    const isTalelJouini = user.username.toLowerCase().includes("talel") && 
                          user.username.toLowerCase().includes("jouini");
    
    if (!isTalelJouini) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Only Talel Jouini can manage availability" },
        { status: 403 }
      );
    }

    // Check for overlapping slots on the same date
    const overlapping = await Availability.findOne({
      userId: user._id,
      date: availabilityDate,
      isActive: true,
      $or: [
        { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
        { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
        { startTime: { $gte: startTime }, endTime: { $lte: endTime } },
      ],
    });

    if (overlapping) {
      return NextResponse.json(
        { success: false, error: "This time slot overlaps with existing availability" },
        { status: 400 }
      );
    }

    const availability = await Availability.create({
      userId: user._id,
      date: availabilityDate,
      dayOfWeek: availabilityDate.getDay(), // Store day of week for convenience
      startTime,
      endTime,
      isActive: true,
    });

    // Format the response with ISO date string
    const formattedAvailability = {
      ...availability.toObject(),
      date: availability.date.toISOString()
    };

    return NextResponse.json(
      {
        success: true,
        availability: formattedAvailability,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating availability:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Remove availability slot
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const slotId = searchParams.get("id");

    if (!slotId) {
      return NextResponse.json(
        { success: false, error: "Slot ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is Talel Jouini
    const isTalelJouini = user.username.toLowerCase().includes("talel") && 
                          user.username.toLowerCase().includes("jouini");
    
    if (!isTalelJouini) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Only Talel Jouini can manage availability" },
        { status: 403 }
      );
    }

    const deleted = await Availability.findOneAndDelete({
      _id: slotId,
      userId: user._id,
    });

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Availability slot not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Availability slot deleted",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting availability:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
