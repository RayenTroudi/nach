# Private Chat Room Feature Implementation

## Overview
This feature adds private 1-on-1 messaging between students and instructors when a course is purchased. Students will have access to both group chat (all students in a course) and private chat (direct with instructor).

## What Was Implemented

### 1. Database Models

#### Private Chat Room Model (`lib/models/private-chat-room.model.ts`)
- **Fields:**
  - `courseId`: Reference to the course
  - `student`: Reference to the student user
  - `instructor`: Reference to the instructor user
  - `messages`: Array of message references
  - `isActive`: Boolean flag to enable/disable chat
  - Compound index ensures only one private chat per student-instructor-course combination

#### Private Chat Message Model (`lib/models/private-chat-message.model.ts`)
- **Fields:**
  - `privateChatRoomId`: Reference to the private chat room
  - `senderId`: User who sent the message
  - `content`: Message text
  - Timestamps for creation/update

#### User Model Updates (`lib/models/user.model.ts`)
- Added `privateChatRooms` field to store user's private chat room references

### 2. Server Actions

#### Private Chat Room Actions (`lib/actions/private-chat-room.action.ts`)
- `createPrivateChatRoom()`: Creates a new private chat room between student and instructor
  - Checks for existing room to avoid duplicates
  - Adds room to both users' private chat arrays
- `getPrivateChatRoom()`: Fetches a private chat room with populated data
- `pushMessageToPrivateChatRoom()`: Adds a message to a room
- `deletePrivateChatRoom()`: Removes private chat rooms for a course

#### Private Chat Message Actions (`lib/actions/private-chat-message.action.ts`)
- `createPrivateMessage()`: Creates a new message in a private chat
  - Triggers Pusher events for real-time updates
  - Updates message array in chat room

#### User Action Updates (`lib/actions/user.action.ts`)
- Added `pushPrivateChatRoomToUser()` to add private chat rooms to users
- Updated `getUserByClerkId()` to populate `privateChatRooms` with full data

### 3. Purchase Flow Integration

Private chat rooms are automatically created when:

#### A. Paid Course Purchase (`lib/actions/purchase.action.ts`)
- Added logic in `createPurchase()` to create private chat room
- Only for regular courses (not FAQ courses)
- Gracefully handles errors without failing the purchase

#### B. Free Course Enrollment (`app/api/enroll-free/route.ts`)
- Added logic to create private chat room on free enrollment
- Only for regular courses
- Non-blocking error handling

#### C. Bank Transfer Approval (`app/api/admin/payment-proofs/route.ts`)
- Added logic when admin approves payment proof
- Creates private chat room for each approved course
- Only for regular courses

### 4. UI Components

#### Chat Utils (`lib/utils/chat-utils.ts`)
Utility functions to unify group and private chats:
- `convertPrivateChatToGroupFormat()`: Converts private chat to group format for UI compatibility
- `combineAndNormalizeChatRooms()`: Merges group and private chats into one array
- `isPrivateChat()`: Checks if a chat room is private (1-on-1)
- `getChatRoomDisplayName()`: Gets appropriate display name

#### Updated Components

**ChatRoomCard** (`components/shared/ChatRoomCard.tsx`):
- Displays user profile picture for private chats
- Shows "Private" or "Group" badge
- Different placeholder messages for private vs group chats
- Hides student avatars for private chats

**MessageInput** (`components/shared/MessageInput.tsx`):
- Detects chat type (private vs group)
- Routes messages to appropriate action based on type
- Uses `createPrivateMessage()` for private chats
- Uses `createMessage()` for group chats

**Chat Room Pages**:
- Student page (`app/(dashboard)/(routes)/(student)/chat-rooms/page.tsx`)
- Teacher page (`app/(dashboard)/(routes)/teacher/chat-rooms/page.tsx`)
- Both now combine and normalize group + private chats using utility functions

### 5. TypeScript Types

#### Updated Type Definitions (`types/models.types.d.ts`)
- Added `TPrivateChatRoom` type
- Added `TPrivateChatMessage` type
- Updated `TUser` to include `privateChatRooms` field

## How It Works

### Purchase Flow
1. Student purchases/enrolls in a course
2. System creates purchase record and enrolls student
3. For regular courses, system creates private chat room:
   - Links student, instructor, and course
   - Adds room to both users' `privateChatRooms` arrays
4. Student and instructor can now message each other directly

### Chat Room Display
1. When user opens chat rooms page:
   - System fetches both group and private chat rooms
   - Utility function normalizes private chats to match group format
   - Combined array is passed to ChatRooms component
2. Chat cards display:
   - Course thumbnail for group chats
   - User profile picture for private chats
   - Badge indicating "Private" or "Group"
3. Message sending automatically detects chat type and uses appropriate action

### Real-time Updates
- Uses Pusher for real-time message delivery
- Same channels work for both group and private chats
- Unread message indicators work for both types

## Benefits

1. **Direct Communication**: Students can ask questions privately to instructors
2. **Group Learning**: Maintains existing group chat for peer learning
3. **Automatic Setup**: No manual action needed - created on purchase
4. **Unified Interface**: Same UI handles both chat types seamlessly
5. **Scalable**: Supports unlimited private chats per user

## Database Schema

```
User {
  _id
  ...
  ownChatRooms: [CourseChatRoom]      // Instructor's group chats
  joinedChatRooms: [CourseChatRoom]   // Student's group chats
  privateChatRooms: [PrivateChatRoom] // Private 1-on-1 chats
}

PrivateChatRoom {
  _id
  courseId: Course
  student: User
  instructor: User
  messages: [PrivateChatMessage]
  isActive: Boolean
  createdAt
  updatedAt
}

PrivateChatMessage {
  _id
  privateChatRoomId: PrivateChatRoom
  senderId: User
  content: String
  createdAt
}
```

## Future Enhancements

Potential improvements:
1. File sharing in private chats
2. Read receipts for private messages
3. Archive/close private chats
4. Notification preferences for private vs group messages
5. Search within private chats
6. Export chat history
