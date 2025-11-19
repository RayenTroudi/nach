# Meeting Booking System

A complete meeting booking system with video conferencing integration using Jitsi.

## Features

✅ **Complete Booking Flow**
- Beautiful shadcn calendar component for date selection
- Time slot grid with 30-minute intervals
- Instant booking confirmation
- Automatic conflict prevention (no double bookings)
- Timezone support

✅ **Email Notifications**
- Booking confirmation email with meeting link
- Reminder 30 minutes before meeting
- Reminder at meeting start time
- Cancellation notifications

✅ **Video Conferencing**
- Integrated Jitsi video calls
- Embedded directly in platform
- No external apps needed
- Secure unique room names

✅ **User Experience**
- Modern shadcn UI calendar component
- Responsive design for mobile and desktop
- Real-time availability checking
- Optional meeting notes
- Easy cancellation
- Intuitive date and time selection

## Setup Instructions

### 1. Environment Variables

Add the following to your `.env.local`:

```env
# Required for email notifications (already configured)
RESEND_API_KEY=your_resend_api_key

# Required for meeting links in emails
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Optional: For securing cron job endpoint
CRON_SECRET=your_random_secret_key
```

### 2. Database

The booking system uses two MongoDB collections:

- **bookings** - Stores meeting bookings
- **availabilities** - Stores host availability schedules (not yet implemented, currently using default 9-5 schedule)

Models are automatically created when you first use the booking feature.

### 3. Deployment

#### Vercel Deployment

The `vercel.json` file is already configured to run the reminder cron job every 5 minutes.

**Important:** If using the CRON_SECRET environment variable for security, add it to your Vercel project settings:

```bash
vercel env add CRON_SECRET
```

#### Alternative Cron Services

If not using Vercel, you can use services like:
- **Cron-job.org** - Free HTTP cron jobs
- **EasyCron** - Reliable cron service
- **AWS EventBridge** - For AWS deployments

Configure them to call: `https://your-domain.com/api/cron/meeting-reminders` every 5 minutes.

## Usage

### For Students/Users

1. Navigate to `/book-meeting` or use the `<BookMeetingButton>` component
2. Select a date using the navigation arrows
3. Choose an available time slot
4. Optionally add notes about topics to discuss
5. Confirm the booking
6. Check email for confirmation and meeting link
7. Join the meeting via the link when it's time

### For Developers

#### Using the BookMeetingButton Component

```tsx
import { BookMeetingButton } from "@/components/shared";

// Basic usage
<BookMeetingButton 
  hostId="675b6eb1a0d2a4e540c1d7f0" 
  hostName="John Doe"
/>

// Custom styling
<BookMeetingButton
  hostId="675b6eb1a0d2a4e540c1d7f0"
  hostName="Expert Advisor"
  variant="outline"
  size="lg"
  className="w-full"
/>
```

#### Server Actions

```tsx
import { createBooking, getAvailableSlots, cancelBooking } from "@/lib/actions/booking.action";

// Get available slots
const result = await getAvailableSlots({
  hostId: "instructor_mongodb_id",
  date: new Date("2024-01-15"),
});

// Create a booking
const booking = await createBooking({
  hostId: "instructor_mongodb_id",
  startAt: new Date("2024-01-15T10:00:00Z"),
  endAt: new Date("2024-01-15T10:30:00Z"),
  timezone: "Europe/Berlin",
  notes: "Discussing visa requirements",
});

// Cancel a booking
await cancelBooking("booking_id");
```

#### API Routes

- **GET /api/availability?hostId=xxx&date=2024-01-15** - Get available slots
- **POST /api/book** - Create a booking
- **GET /api/bookings/[id]** - Get booking details
- **DELETE /api/bookings/[id]** - Cancel a booking

## How It Works

### Booking Flow

1. **User Selects Time** → Frontend calls `/api/availability` to fetch available slots
2. **User Confirms** → Frontend calls `/api/book` with selected time
3. **Server Validates** → Checks for overlapping bookings
4. **Room Generated** → Creates unique Jitsi room name (e.g., `meet-a1b2c3d4e5`)
5. **Email Sent** → Sends confirmation email with meeting link
6. **Database Saved** → Stores booking in MongoDB

### Reminder System

Every 5 minutes, the cron job (`/api/cron/meeting-reminders`) runs:

1. Finds bookings starting in 30 minutes without 30-min reminder sent
2. Sends reminder emails and updates `reminderSent30Min` flag
3. Finds bookings starting in 5 minutes without start reminder sent
4. Sends start emails and updates `reminderSentStart` flag

### Video Conferencing

When a user joins the meeting:

1. Click "Join Meeting" in email → Opens `/meet/[room]`
2. Page loads Jitsi External API script
3. Initializes Jitsi iframe with room name
4. User joins video call directly in the platform

## Customization

### Change Available Hours

Currently hardcoded to 9 AM - 5 PM with 30-minute slots. To customize, edit:

```typescript
// lib/actions/booking.action.ts
const workStart = 9; // Change start hour
const workEnd = 17;   // Change end hour
const slotDuration = 30; // Change duration in minutes
```

### Implement Custom Availability

For host-specific availability schedules:

1. Create availability entries in the `availabilities` collection
2. Modify `getAvailableSlots()` to query the Availability model
3. Filter time slots based on host's custom schedule

### Customize Email Templates

Edit the email HTML in:
- `sendBookingConfirmationEmail()` - Confirmation emails
- `send30MinReminderEmail()` - 30-minute reminders
- `sendStartReminderEmail()` - Start reminders
- `sendBookingCancellationEmail()` - Cancellation emails

### Change Video Platform

To use a different platform instead of Jitsi:

1. Edit `/app/meet/[room]/page.tsx`
2. Replace Jitsi integration with your preferred service (Zoom SDK, Google Meet, etc.)
3. Update room URL generation in booking actions

## Database Schema

### Booking Model

```typescript
{
  userId: ObjectId,           // Who booked the meeting
  hostId: ObjectId,           // Who is hosting (instructor/advisor)
  startAt: Date,              // Meeting start time
  endAt: Date,                // Meeting end time
  roomName: String (unique),  // Jitsi room identifier
  status: Enum,               // scheduled | completed | cancelled | no-show
  timezone: String,           // User's timezone
  notes: String,              // Optional meeting notes
  reminderSent30Min: Boolean, // Reminder flag
  reminderSentStart: Boolean, // Reminder flag
  createdAt: Date,
  updatedAt: Date
}
```

### Availability Model

```typescript
{
  userId: ObjectId,   // Host user
  dayOfWeek: Number,  // 0-6 (Sun-Sat)
  startTime: String,  // "09:00"
  endTime: String,    // "17:00"
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Troubleshooting

### Emails Not Sending

1. Verify RESEND_API_KEY is set correctly
2. Check Resend dashboard for delivery status
3. Look for errors in server logs

### Cron Job Not Running

1. Verify `vercel.json` is deployed
2. Check Vercel Logs → Cron tab for execution logs
3. Manually test: `curl https://your-domain.com/api/cron/meeting-reminders`

### Meeting Link Not Working

1. Ensure NEXT_PUBLIC_APP_URL is set correctly
2. Check browser console for Jitsi script loading errors
3. Verify room name is being passed correctly

### Double Bookings Occurring

1. Check database indexes are created properly
2. Verify time comparison logic in `createBooking()`
3. Add additional validation in API route

## Future Enhancements

- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Custom availability schedules per host
- [ ] Recurring meetings
- [ ] Meeting recordings
- [ ] Host dashboard to manage bookings
- [ ] Rescheduling functionality
- [ ] SMS reminders via Twilio
- [ ] Multi-language email templates
- [ ] Meeting notes/summary after call

## License

Part of the Germany Formation platform.
