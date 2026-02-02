import { NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/actions/booking.action";
import { connectToDatabase } from "@/lib/mongoose";
import User from "@/lib/models/user.model";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let hostId = searchParams.get("hostId");
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Missing date parameter" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // If no hostId provided or if requesting, find Talel Jouini
    if (!hostId) {
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

      hostId = talelJouini._id.toString();
    }

    const result = await getAvailableSlots({
      hostId,
      date: new Date(date),
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ slots: result.slots });
  } catch (error: any) {
    console.error("Availability API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
