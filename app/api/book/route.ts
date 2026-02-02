import { NextResponse } from "next/server";
import { createBooking } from "@/lib/actions/booking.action";
import { connectToDatabase } from "@/lib/mongoose";
import User from "@/lib/models/user.model";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { hostId, startAt, endAt, timezone, notes, price, paymentStatus, paymentMethod } = body;

    if (!startAt || !endAt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find Talel Jouini as the designated consultant/teacher
    const talelJouini = await User.findOne({
      $or: [
        { username: /talel.*jouini/i },
        { username: /jouini.*talel/i },
      ]
    });

    if (!talelJouini) {
      return NextResponse.json(
        { error: "Consultant not available" },
        { status: 404 }
      );
    }

    // Use Talel Jouini as the host for all meetings
    hostId = talelJouini._id.toString();

    const result = await createBooking({
      hostId,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      timezone: timezone || "UTC",
      notes,
      price,
      paymentStatus,
      paymentMethod,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.booking);
  } catch (error: any) {
    console.error("Book API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
