# Quick Start Guide - Meeting Booking System

## ✅ What Was Built

A complete meeting booking system with:
- **Booking UI** - Modern shadcn calendar with time slot selection
- **Video Conferencing** - Jitsi integration for in-platform video calls
- **Email Notifications** - Automated confirmation and reminder emails
- **API Routes** - RESTful endpoints for booking operations
- **Database Models** - MongoDB schemas for bookings and availability
- **Cron Job** - Automated reminder system

## 📁 Files Created

### Database Models
- `lib/models/booking.model.ts` - Booking schema
- `lib/models/availability.model.ts` - Availability schedule schema

### Server Actions
- `lib/actions/booking.action.ts` - All booking logic and email functions

### API Routes
- `app/api/book/route.ts` - Create bookings
- `app/api/availability/route.ts` - Get available time slots
- `app/api/bookings/[id]/route.ts` - Get/cancel specific booking
- `app/api/cron/meeting-reminders/route.ts` - Reminder email cron job

### UI Components
- `components/shared/BookMeetingButton.tsx` - Main booking button with modal
- `components/shared/BookingCalendar.tsx` - Shadcn calendar with time slot selection
- `components/ui/calendar.tsx` - Shadcn calendar component (installed via CLI)

### Pages
- `app/meet/[room]/page.tsx` - Jitsi video meeting room
- `app/(dashboard)/(routes)/(student)/book-meeting/page.tsx` - Demo booking page

### Configuration
- `vercel.json` - Cron job configuration
- `BOOKING_SYSTEM.md` - Complete documentation

## 🚀 How to Use

### 1. Set Environment Variable

Add to your `.env.local`:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production (Vercel):
```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 2. Add Booking Button Anywhere

```tsx
import { BookMeetingButton } from "@/components/shared";

<BookMeetingButton 
  hostId="instructor_mongodb_id"
  hostName="Expert Advisor"
/>
```

### 3. Test the Feature

1. Run the development server: `npm run dev`
2. Navigate to: `/book-meeting`
3. Click on a date in the calendar
4. Select a time slot from the available options
5. Confirm the booking
6. Check your email for confirmation

### 4. Join a Meeting

Users receive an email with a "Join Meeting" link that goes to:
```
/meet/[room-name]
```

The Jitsi video call loads directly in the platform.

## 📧 Email Flow

1. **Booking Confirmed** → Immediate confirmation email with meeting link
2. **30 Minutes Before** → Reminder email (if cron job is running)
3. **At Start Time** → Final reminder email (if cron job is running)
4. **Cancellation** → Notification email

## ⚙️ Cron Job Setup

### Vercel (Recommended)

Already configured in `vercel.json`. Runs automatically every 5 minutes in production.

### Manual Testing

Call the endpoint manually:
```bash
curl http://localhost:3000/api/cron/meeting-reminders
```

### Alternative Services

If not using Vercel:
1. Sign up for cron-job.org or similar
2. Add URL: `https://your-domain.com/api/cron/meeting-reminders`
3. Set interval: Every 5 minutes

## 🎯 Finding Host ID

To use the booking system, you need a host/instructor MongoDB ID:

### Option 1: From Database
```javascript
// In MongoDB Compass or shell
db.users.findOne({ isAdmin: true })._id
```

### Option 2: From API
Create a simple endpoint:
```tsx
// app/api/me/route.ts
import { getUserByClerkId } from "@/lib/actions/user.action";
import { auth } from "@clerk/nextjs";

export async function GET() {
  const { userId } = auth();
  const user = await getUserByClerkId({ clerkId: userId });
  return Response.json({ mongoId: user._id });
}
```

Visit `/api/me` to see your MongoDB ID.

### Option 3: Update Demo Page
Edit `app/(dashboard)/(routes)/(student)/book-meeting/page.tsx`:
```tsx
const DEFAULT_HOST_ID = "your_actual_mongodb_id"; // Line 8
```

## 🧪 Testing Checklist

- [ ] Booking button opens modal
- [ ] Shadcn calendar displays correctly
- [ ] Calendar prevents past dates
- [ ] Time slots load when date selected
- [ ] Booking confirmation works
- [ ] Confirmation email received
- [ ] Meeting link in email works
- [ ] Jitsi loads on /meet/[room]
- [ ] Cron job runs (check Vercel logs)
- [ ] Reminder emails sent

## 🐛 Troubleshooting

### "Cannot find module './BookingCalendar'"
This is a TypeScript cache issue. Restart VS Code or run:
```bash
rm -rf node_modules/.cache
```

### Emails Not Sending
1. Check RESEND_API_KEY is set
2. Verify email in Resend dashboard
3. Check server logs for errors

### Cron Not Running
1. Deploy to Vercel (doesn't run locally)
2. Check Vercel → Logs → Cron tab
3. Manually test the endpoint

### Meeting Won't Load
1. Check browser console for errors
2. Verify Jitsi script loads
3. Check room name is valid

## 📊 Database Queries

### View All Bookings
```javascript
db.bookings.find().sort({ startAt: 1 })
```

### Upcoming Meetings
```javascript
db.bookings.find({
  startAt: { $gte: new Date() },
  status: "scheduled"
})
```

### User's Bookings
```javascript
db.bookings.find({ 
  userId: ObjectId("user_id") 
})
```

## 🎨 Customization Tips

### Change Available Hours
Edit `lib/actions/booking.action.ts`:
```typescript
const workStart = 9;  // 9 AM
const workEnd = 17;   // 5 PM
const slotDuration = 30; // Minutes
```

### Custom Email Templates
Edit functions in `lib/actions/booking.action.ts`:
- `sendBookingConfirmationEmail()`
- `send30MinReminderEmail()`
- `sendStartReminderEmail()`

### Different Video Platform
Replace Jitsi in `app/meet/[room]/page.tsx` with:
- Zoom SDK
- Google Meet
- Microsoft Teams
- Daily.co
- Whereby

## 📝 Next Steps

1. **Add to Landing Page** - Place BookMeetingButton in hero or contact section
2. **Instructor Dashboard** - Show upcoming meetings for instructors
3. **User Dashboard** - Show user's booked meetings
4. **Calendar Integration** - Add .ics file generation
5. **Rescheduling** - Allow users to change meeting times
6. **Custom Availability** - Let hosts set their own schedules

## 📚 Full Documentation

See `BOOKING_SYSTEM.md` for complete technical documentation.

## 🆘 Need Help?

Check:
1. Server logs for errors
2. Browser console for frontend issues
3. Resend dashboard for email delivery
4. Vercel logs for cron job status
