import { NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/actions/booking.action";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hostId = searchParams.get("hostId");
    const date = searchParams.get("date");

    if (!hostId || !date) {
      return NextResponse.json(
        { error: "Missing hostId or date" },
        { status: 400 }
      );
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
