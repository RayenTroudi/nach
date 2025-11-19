import { NextResponse } from "next/server";
import {
  getBookingById,
  cancelBooking,
} from "@/lib/actions/booking.action";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await getBookingById(params.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json(result.booking);
  } catch (error: any) {
    console.error("Get booking API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await cancelBooking(params.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ message: result.message });
  } catch (error: any) {
    console.error("Cancel booking API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
