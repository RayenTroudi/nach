import { NextResponse } from "next/server";
import { sendMeetingReminders } from "@/lib/actions/booking.action";

export const dynamic = "force-dynamic";

/**
 * Cron job endpoint to send meeting reminders
 * This should be called every 5 minutes by a cron service like Vercel Cron
 * 
 * In vercel.json, add cron configuration for this endpoint
 */
export async function GET(request: Request) {
  try {
    // Verify the request is from Vercel Cron (optional security measure)
    const authHeader = request.headers.get("authorization");
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await sendMeetingReminders();

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      sent30Min: result.sent30Min,
      sentStart: result.sentStart,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
