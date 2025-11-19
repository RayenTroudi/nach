# Meeting System - Complete Implementation Guide

## Overview
The platform now has a complete bidirectional meeting system where both consultants (admins) and students can join the same Jitsi video meetings.

## System Architecture

### Key Components

1. **Student Side**
   - Page: `/my-meetings`
   - Component: `MyMeetings.tsx`
   - Shows student's booked meetings
   - Join button becomes active 15 minutes before meeting

2. **Consultant Side**
   - Page: `/admin/my-consultations`
   - Component: `ConsultantMeetings.tsx`
   - Shows consultant's assigned meetings
   - Join button for active meetings

3. **Meeting Room**
   - Page: `/meet/[room]`
   - Jitsi video integration
   - Both parties join the same room
   - Format: `GermanyFormation-{meetingId}`

## Complete User Flow

### 1. Booking Creation
```
Student → Books meeting → Uploads payment proof → Status: Pending
```

**Files:**
- `app/api/book/route.ts` - Creates booking
- All meetings assigned to default consultant: Talel Jouini (ID: 691dd26c9196bd0bbf04cf7c)

### 2. Admin Approval
```
Admin → Reviews payment proof → Approves → Meeting link generated
```

**Process:**
- Admin visits `/admin/bookings`
- Reviews payment proof image
- Clicks "Approve" or "Reject"
- On approval:
  - Meeting ID generated (nanoid)
  - Meeting link: `${NEXT_PUBLIC_SERVER_URL}/meet/${meetingId}`
  - Confirmation email sent to student
  - Booking status: "paid"

**Files:**
- `app/(dashboard)/(routes)/admin/bookings/page.tsx`
- `app/api/admin/approve-booking/route.ts`

### 3. Meeting Access - Student
```
Student → My Meetings → Join Meeting (15 min before) → Jitsi Room
```

**Features:**
- Filter tabs: Upcoming, Past, All
- Status badges: Pending, Confirmed, Active, Completed, Cancelled
- Join button activates 15 minutes before start time
- Disabled if payment pending

**Files:**
- `app/(dashboard)/(routes)/(student)/my-meetings/page.tsx`
- `components/shared/MyMeetings.tsx`
- `app/api/user/bookings/route.ts`

### 4. Meeting Access - Consultant
```
Consultant → My Consultations → Join Meeting → Jitsi Room
```

**Features:**
- Shows all meetings where hostId = consultant's ID
- Filter tabs: Upcoming, Past, All
- Student information displayed
- Student notes visible
- Join button for active meetings

**Files:**
- `app/(dashboard)/(routes)/admin/my-consultations/page.tsx`
- `components/shared/ConsultantMeetings.tsx`
- `app/api/admin/my-consultations/route.ts`

### 5. Video Meeting
```
Both parties → Click Join → Same Jitsi room → Video call
```

**Room Details:**
- Room name: `GermanyFormation-{meetingId}`
- Full toolbar: chat, screen share, recording
- Prejoin disabled for instant access
- Auto-redirect on meeting end

**Files:**
- `app/meet/[room]/page.tsx`

## Database Schema

### Booking Model Fields
```typescript
{
  userId: ObjectId,          // Student who booked
  hostId: ObjectId,          // Consultant (Talel Jouini)
  startAt: Date,             // Meeting start time
  endAt: Date,               // Meeting end time
  roomName: String,          // Meeting room identifier
  price: Number,             // Meeting cost
  notes: String,             // Student's notes
  paymentProof: String,      // Image URL
  paymentStatus: String,     // pending, paid, rejected, free
  meetingLink: String,       // Full URL to Jitsi meeting
  meetingId: String,         // Unique meeting identifier
  adminNotes: String,        // Admin's approval notes
}
```

## Navigation Structure

### Student Routes
- Home → `/`
- My Learning → `/my-learning`
- **My Meetings → `/my-meetings`** ✨
- My Cart → `/cart`
- My Wishlist → `/wishlist`
- Chat Rooms → `/chat-rooms`

### Admin Routes
- Categories → `/admin/categories`
- Payment Proofs → `/admin/payment-proofs`
- Meeting Bookings → `/admin/bookings`
- **My Consultations → `/admin/my-consultations`** ✨
- Statistics → `/admin/statistics`

## Key Features

### Join Window Logic
```typescript
const canJoinMeeting = (booking) => {
  const startTime = new Date(booking.startAt);
  const endTime = new Date(booking.endAt);
  const joinWindow = new Date(startTime - 15 * 60000); // 15 min before
  const now = new Date();
  
  return now >= joinWindow && now <= endTime && booking.paymentStatus === "paid";
};
```

### Status Badges
- **Pending (Yellow)**: Payment not yet approved
- **Confirmed (Blue)**: Payment approved, waiting for meeting time
- **Active (Green)**: Can join now (15 min window active)
- **Completed (Gray)**: Meeting ended
- **Cancelled (Red)**: Payment rejected

### Design System
- Border: `border-2 border-slate-200 dark:border-slate-800`
- Hover: `hover:border-brand-red-500`
- Primary button: `bg-brand-red-500 text-white`
- Rounded: `rounded-lg`
- Matches platform's existing course cards design

## Email Notifications

### Approval Email
```
Subject: Meeting Confirmed - [Date]
Content:
- Meeting details (date, time, duration)
- Join instructions
- "Join 15 minutes early" note
- Meeting link button
```

### Rejection Email
```
Subject: Meeting Booking Update
Content:
- Rejection notification
- Admin's reason (if provided)
- Support contact information
```

## Environment Variables Required
```env
NEXT_PUBLIC_SERVER_URL=https://your-domain.com
MONGODB_URL=mongodb://...
DATABASE_NAME=germanyformation
```

## Default Consultant
**Name**: Talel Jouini  
**User ID**: 691dd26c9196bd0bbf04cf7c  
**Email**: 99233606rayen@gmail.com  
**Role**: Admin (isAdmin: true)

All new bookings are automatically assigned to this consultant.

## Testing Checklist

### End-to-End Flow
1. ✅ Student books meeting
2. ✅ Student uploads payment proof
3. ✅ Admin sees booking in `/admin/bookings`
4. ✅ Admin approves payment
5. ✅ Student receives confirmation email
6. ✅ Student sees meeting in `/my-meetings`
7. ✅ Consultant sees meeting in `/admin/my-consultations`
8. ✅ Both can join meeting 15 min before start
9. ✅ Both enter same Jitsi room
10. ✅ Video call works with all features

### Edge Cases
- ✅ Payment pending: Join button disabled
- ✅ Too early: Join button shows "Not Available Yet"
- ✅ Meeting ended: Status shows "Completed"
- ✅ Payment rejected: Status shows "Cancelled"
- ✅ No meetings: Empty state with helpful message

## Recent Changes

### Fixed Issues
1. **Meeting Link URL**: Changed from `/meeting/` to `/meet/` to match existing Jitsi page
2. **Import Error**: Added ConsultantMeetings to shared components index
3. **Database Connection**: Fixed import from `connectDB` to `connectToDatabase`

### New Files Created
- `app/(dashboard)/(routes)/admin/my-consultations/page.tsx`
- `app/api/admin/my-consultations/route.ts`
- `components/shared/ConsultantMeetings.tsx`

### Modified Files
- `lib/data.ts` - Added Video icon and "My Consultations" route
- `components/shared/index.ts` - Exported ConsultantMeetings
- `app/api/admin/approve-booking/route.ts` - Fixed meeting link path

## Next Steps (Optional Enhancements)

1. **Real-time Notifications**
   - Notify consultant when student joins
   - Show "Student is waiting" indicator

2. **Meeting Recordings**
   - Save Jitsi recordings
   - Make available for review

3. **Meeting Rescheduling**
   - Allow both parties to request reschedule
   - Send notifications on changes

4. **Feedback System**
   - Post-meeting ratings
   - Student/consultant reviews

5. **Analytics Dashboard**
   - Total meetings conducted
   - Average duration
   - Revenue tracking

6. **Calendar Integration**
   - Google Calendar sync
   - iCal export
   - Reminders

## Support

For any issues with the meeting system:
1. Check browser console for errors
2. Verify environment variables are set
3. Ensure MongoDB connection is active
4. Check Jitsi external API is loading
5. Verify user has proper authentication (Clerk)

---

**System Status**: ✅ Fully Operational  
**Last Updated**: December 2024  
**Version**: 1.0
