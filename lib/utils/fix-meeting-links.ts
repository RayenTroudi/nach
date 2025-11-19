/**
 * Migration Script: Fix Meeting Links
 * 
 * This script updates all existing bookings in the database
 * that have the old `/meeting/` path to use the new `/meet/` path
 * 
 * Run this once to fix existing bookings
 */

import { connectToDatabase } from "@/lib/mongoose";
import Booking from "@/lib/models/booking.model";

export async function fixMeetingLinks() {
  try {
    await connectToDatabase();

    // Find all bookings with the old meeting link pattern
    const bookingsToUpdate = await Booking.find({
      meetingLink: { $regex: /\/meeting\// }
    });

    console.log(`Found ${bookingsToUpdate.length} bookings to update`);

    let updated = 0;
    for (const booking of bookingsToUpdate) {
      if (booking.meetingLink) {
        // Replace /meeting/ with /meet/
        booking.meetingLink = booking.meetingLink.replace('/meeting/', '/meet/');
        await booking.save();
        updated++;
        console.log(`Updated booking ${booking._id}: ${booking.meetingLink}`);
      }
    }

    console.log(`Successfully updated ${updated} bookings`);
    return { success: true, updated };
  } catch (error) {
    console.error("Error fixing meeting links:", error);
    return { success: false, error };
  }
}
