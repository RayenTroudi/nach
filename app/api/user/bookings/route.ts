import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserBookings } from "@/lib/actions/booking.action";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await getUserBookings();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      bookings: result.bookings,
    });
  } catch (error: any) {
    console.error("Error fetching user bookings:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
