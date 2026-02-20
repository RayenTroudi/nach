"use server";

import { connectToDatabase } from "../mongoose";
import Booking from "../models/booking.model";
import { sendEmail } from "./email.action";
import { getUserByClerkId } from "./user.action";
import { auth } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";

interface CreateBookingParams {
  hostId: string;
  startAt: Date;
  endAt: Date;
  timezone: string;
  notes?: string;
  price?: number;
  paymentStatus?: "pending" | "paid" | "free";
  paymentMethod?: "stripe" | "bank_transfer" | "free";
}

interface GetAvailableSlotsParams {
  hostId: string;
  date: Date;
  timezone?: string;
}

/**
 * Create a new meeting booking
 */
export async function createBooking(params: CreateBookingParams) {
  try {
    await connectToDatabase();
    const { userId } = auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await getUserByClerkId({ clerkId: userId });
    
    if (!user || !user._id) {
      throw new Error("User not found");
    }

    const { hostId, startAt, endAt, timezone, notes, price, paymentStatus, paymentMethod } = params;

    // Check for overlapping bookings
    const overlapping = await Booking.findOne({
      hostId,
      status: "scheduled",
      $or: [
        {
          startAt: { $lt: endAt },
          endAt: { $gt: startAt },
        },
      ],
    });

    if (overlapping) {
      throw new Error("This time slot is already booked");
    }

    // Generate unique room name
    const roomName = `meet-${nanoid(10)}`;

    // Create booking
    const booking = await Booking.create({
      userId: user._id,
      hostId,
      startAt,
      endAt,
      roomName,
      timezone,
      notes,
      status: "scheduled",
      price: price || 0,
      paymentStatus: paymentStatus || "free",
      paymentMethod: paymentMethod || "free",
    });

    // Send confirmation email
    // Only send if payment is not required or already paid
    if (paymentStatus === "free" || paymentStatus === "paid") {
      await sendBookingConfirmationEmail(booking._id.toString());
    }

    return {
      success: true,
      booking: JSON.parse(JSON.stringify(booking)),
    };
  } catch (error: any) {
    console.error("Create booking error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get available time slots for a specific date
 */
export async function getAvailableSlots(params: GetAvailableSlotsParams) {
  try {
    await connectToDatabase();
    const { hostId, date } = params;

    // Get all bookings for this host on this date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      hostId,
      status: "scheduled",
      startAt: { $gte: startOfDay, $lte: endOfDay },
    }).select("startAt endAt");

    // Default availability: 8 AM to 12 AM (midnight) in 30-minute slots
    const slots = [];
    const workStart = 8; // 8 AM
    const workEnd = 24; // 12 AM (midnight)
    const slotDuration = 30; // minutes

    for (let hour = workStart; hour < workEnd; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

        // Check if slot is in the past
        if (slotStart < new Date()) {
          continue;
        }

        // Check if slot overlaps with existing bookings
        const isBooked = bookings.some((booking) => {
          return (
            (slotStart >= booking.startAt && slotStart < booking.endAt) ||
            (slotEnd > booking.startAt && slotEnd <= booking.endAt) ||
            (slotStart <= booking.startAt && slotEnd >= booking.endAt)
          );
        });

        if (!isBooked) {
          slots.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            available: true,
          });
        }
      }
    }

    return {
      success: true,
      slots,
    };
  } catch (error: any) {
    console.error("Get available slots error:", error);
    return {
      success: false,
      error: error.message,
      slots: [],
    };
  }
}

/**
 * Get user's bookings
 */
export async function getUserBookings() {
  try {
    await connectToDatabase();
    const { userId } = auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await getUserByClerkId({ clerkId: userId });
    
    if (!user || !user._id) {
      console.error("User not found in getUserBookings");
      return {
        success: false,
        error: "User not found",
        bookings: [],
      };
    }

    // Fetch all bookings regardless of status
    const bookings = await Booking.find({
      userId: user._id,
    })
      .populate({
        path: "userId",
        select: "firstName lastName email",
      })
      .populate({
        path: "hostId",
        select: "firstName lastName email",
      })
      .sort({ startAt: -1 }) // Sort by recent first
      .lean();

    // Filter out bookings where populate failed and log them
    const validBookings = bookings.filter((booking: any) => {
      if (!booking.userId) {
        console.warn(`Booking ${booking._id} has invalid userId`);
        return false;
      }
      // Keep bookings even if hostId is null - we'll handle it in the UI
      return true;
    });

    return {
      success: true,
      bookings: JSON.parse(JSON.stringify(validBookings)),
    };
  } catch (error: any) {
    console.error("Get user bookings error:", error);
    return {
      success: false,
      error: error.message,
      bookings: [],
    };
  }
}

/**
 * Get booking by ID
 */
export async function getBookingById(bookingId: string) {
  try {
    await connectToDatabase();

    const booking = await Booking.findById(bookingId)
      .populate("userId", "firstName lastName email")
      .populate("hostId", "firstName lastName email")
      .lean();

    if (!booking) {
      throw new Error("Booking not found");
    }

    return {
      success: true,
      booking: JSON.parse(JSON.stringify(booking)),
    };
  } catch (error: any) {
    console.error("Get booking error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Cancel a booking
 */
export async function cancelBooking(bookingId: string) {
  try {
    await connectToDatabase();
    const { userId } = auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await getUserByClerkId({ clerkId: userId });

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Only the user or host can cancel
    if (
      booking.userId.toString() !== user._id.toString() &&
      booking.hostId.toString() !== user._id.toString()
    ) {
      throw new Error("Unauthorized to cancel this booking");
    }

    booking.status = "cancelled";
    await booking.save();

    // Send cancellation email
    await sendBookingCancellationEmail(bookingId);

    return {
      success: true,
      message: "Booking cancelled successfully",
    };
  } catch (error: any) {
    console.error("Cancel booking error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Send booking confirmation email
 */
async function sendBookingConfirmationEmail(bookingId: string) {
  try {
    const booking = await Booking.findById(bookingId)
      .populate("userId", "firstName lastName email")
      .populate("hostId", "firstName lastName email");

    if (!booking) {
      console.log("Booking not found for email:", bookingId);
      return;
    }

    const user: any = booking.userId;
    const host: any = booking.hostId;

    if (!user || !host) {
      console.log("User or host not found for booking:", bookingId);
      return;
    }

    if (!user.firstName || !user.email) {
      console.log("User data incomplete:", user);
      return;
    }

    const meetingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/meet/${booking.roomName}`;

    const formatDate = (date: Date) => {
      return new Date(date).toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      });
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #ef4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #555; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Meeting Confirmed!</h1>
            </div>
            <div class="content">
              <p>Hi ${user.firstName},</p>
              <p>Your meeting with <strong>${host.firstName} ${host.lastName}</strong> has been confirmed!</p>
              
              <div class="details">
                <div class="detail-row">
                  <span class="detail-label">📅 Date & Time:</span><br/>
                  ${formatDate(booking.startAt)}
                </div>
                <div class="detail-row">
                  <span class="detail-label">⏱️ Duration:</span><br/>
                  ${Math.round((booking.endAt.getTime() - booking.startAt.getTime()) / (1000 * 60))} minutes
                </div>
                ${
                  booking.notes
                    ? `
                <div class="detail-row">
                  <span class="detail-label">📝 Notes:</span><br/>
                  ${booking.notes}
                </div>
                `
                    : ""
                }
              </div>

              <center>
                <a href="${meetingUrl}" class="button">
                  Join Meeting
                </a>
              </center>

              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                💡 <strong>Tip:</strong> You'll receive reminder emails 30 minutes before and at the meeting start time.<br/>
                Add this meeting to your calendar to stay on track!
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: `Meeting Confirmed with ${host.firstName} ${host.lastName}`,
      html,
    });
  } catch (error) {
    console.error("Error sending confirmation email:", error);
  }
}

/**
 * Send booking cancellation email
 */
async function sendBookingCancellationEmail(bookingId: string) {
  try {
    const booking = await Booking.findById(bookingId)
      .populate("userId", "firstName lastName email")
      .populate("hostId", "firstName lastName email");

    if (!booking) return;

    const user: any = booking.userId;
    const host: any = booking.hostId;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Meeting Cancelled</h1>
            </div>
            <div class="content">
              <p>Hi ${user.firstName},</p>
              <p>Your meeting with <strong>${host.firstName} ${host.lastName}</strong> has been cancelled.</p>
              <p>If you'd like to reschedule, please book a new meeting.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: "Meeting Cancelled",
      html,
    });
  } catch (error) {
    console.error("Error sending cancellation email:", error);
  }
}

/**
 * Send reminder emails for upcoming meetings
 * This should be called by a cron job
 */
export async function sendMeetingReminders() {
  try {
    await connectToDatabase();

    const now = new Date();
    const in30Minutes = new Date(now.getTime() + 30 * 60 * 1000);
    const in5Minutes = new Date(now.getTime() + 5 * 60 * 1000);

    // Find bookings starting in 30 minutes
    const bookings30Min = await Booking.find({
      status: "scheduled",
      reminderSent30Min: false,
      startAt: {
        $gte: now,
        $lte: in30Minutes,
      },
    })
      .populate("userId", "firstName lastName email")
      .populate("hostId", "firstName lastName email");

    for (const booking of bookings30Min) {
      await send30MinReminderEmail(booking);
      booking.reminderSent30Min = true;
      await booking.save();
    }

    // Find bookings starting in 5 minutes
    const bookingsStart = await Booking.find({
      status: "scheduled",
      reminderSentStart: false,
      startAt: {
        $gte: now,
        $lte: in5Minutes,
      },
    })
      .populate("userId", "firstName lastName email")
      .populate("hostId", "firstName lastName email");

    for (const booking of bookingsStart) {
      await sendStartReminderEmail(booking);
      booking.reminderSentStart = true;
      await booking.save();
    }

    console.log(
      `✅ Sent ${bookings30Min.length} 30-min reminders and ${bookingsStart.length} start reminders`
    );

    return {
      success: true,
      sent30Min: bookings30Min.length,
      sentStart: bookingsStart.length,
    };
  } catch (error: any) {
    console.error("Send reminders error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

async function send30MinReminderEmail(booking: any) {
  const user = booking.userId;
  const host = booking.hostId;
  const meetingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/meet/${booking.roomName}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>⏰ Meeting in 30 Minutes!</h2>
          <p>Hi ${user.firstName},</p>
          <p>Your meeting with <strong>${host.firstName} ${host.lastName}</strong> starts in 30 minutes.</p>
          <p><a href="${meetingUrl}" style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">Join Meeting</a></p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: user.email,
    subject: "Meeting Reminder - Starting in 30 Minutes",
    html,
  });
}

async function sendStartReminderEmail(booking: any) {
  const user = booking.userId;
  const host = booking.hostId;
  const meetingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/meet/${booking.roomName}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>🚀 Your Meeting is Starting Now!</h2>
          <p>Hi ${user.firstName},</p>
          <p>Your meeting with <strong>${host.firstName} ${host.lastName}</strong> is starting now.</p>
          <p><a href="${meetingUrl}" style="display: inline-block; background: #ef4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-size: 18px;">Join Meeting Now</a></p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: user.email,
    subject: "Meeting Starting Now! 🚀",
    html,
  });
}
