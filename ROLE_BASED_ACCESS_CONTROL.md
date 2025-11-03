# Role-Based Access Control Implementation

## Overview
Implemented admin-only access to instructor features. Only users with `isAdmin: true` can become instructors and access teacher routes.

---

## Changes Made

### 1. **Navbar.tsx** (Frontend - Desktop View)
**File**: `components/shared/Navbar.tsx`

**What Changed**:
- Moved the "Become an Instructor" button inside the `isUserAdmin` conditional block
- Now only users with admin privileges can see the instructor link

**Code**:
```tsx
{isUserAdmin ? (
  <>
    <Link href="/admin/dashboard/" className="...">
      Admin
    </Link>
    <Separator orientation="vertical" className="h-[20px] hidden lg:block" />
    
    {/* Only admins can become instructors */}
    <Link href="/teacher/courses" className="hidden lg:block">
      <p className="...">
        Become an{" "}
        <span className="...">Instructor</span>
      </p>
    </Link>
    <Separator orientation="vertical" className="h-[20px] hidden lg:block" />
  </>
) : null}
```

**Why**: Prevents non-admin users from seeing the instructor access button on desktop view.

---

### 2. **MobileSideBar.tsx** (Frontend - Mobile View)
**File**: `components/shared/MobileSideBar.tsx`

**What Changed**:
- Added `isAdmin` check to the instructor link conditional
- Changed from `{!pathname.startsWith("/teacher") || pathname.includes("/section") ? (...)` 
- To: `{isAdmin && (!pathname.startsWith("/teacher") || pathname.includes("/section")) ? (...)}`

**Code**:
```tsx
<SignedIn>
  {/* Only admins can access instructor mode */}
  {isAdmin && (!pathname.startsWith("/teacher") || pathname.includes("/section")) ? (
    <Link href="/teacher/courses" className="...">
      {/* Instructor icon and label */}
    </Link>
  ) : null}
</SignedIn>
```

**Why**: Prevents non-admin users from seeing the instructor link in the mobile sidebar.

---

### 3. **TeacherLayout.tsx** (Backend - Server-Side Protection)
**File**: `app/(dashboard)/(routes)/teacher/layout.tsx`

**What Changed**:
- Added server-side admin verification before rendering teacher routes
- Redirects non-admin users to homepage if they try to access `/teacher/*` routes
- Passes `requireAdmin={true}` prop to ProtectedRoute component

**Code**:
```tsx
const TeacherLayout = async ({ children }: { children: React.ReactNode }) => {
  const { userId } = auth();

  if (!userId) return redirect("/sign-in");

  let user: TUser = {} as TUser;

  try {
    user = await getUserByClerkId({ clerkId: userId! });
    
    // Only admins can access teacher/instructor routes
    if (!user.isAdmin) {
      console.log("Access denied: User is not an admin");
      return redirect("/");
    }
  } catch (error: any) {
    console.log("TeacherLayout Error: ", error.message);
    return redirect("/");
  }

  return <ProtectedRoute user={user} requireAdmin={true}>{children}</ProtectedRoute>;
};
```

**Why**: Provides server-side protection. Even if a non-admin user somehow bypasses the frontend and tries to access `/teacher/courses` directly via URL, they will be redirected.

---

### 4. **ProtectedRoute.tsx** (Client-Side Protection)
**File**: `components/shared/ProtectedRoute.tsx`

**What Changed**:
- Added optional `requireAdmin` prop (default: `false`)
- Added admin verification logic that shows error toast and redirects if admin access is required but user is not an admin

**Code**:
```tsx
const ProtectedRoute = ({
  user,
  children,
  requireAdmin = false,
}: {
  user: TUser;
  children: React.ReactNode;
  requireAdmin?: boolean;
}) => {
  const { signOut } = useClerk();
  const router = useRouter();

  if (!user) {
    scnToast({
      variant: "warning",
      title: "Something went wrong",
      description: "No account found, please sign up to continue.",
    });
    signOut(() => router.push("/sign-up"));
    redirect("/sign-up");
  }

  // Check if admin access is required
  if (requireAdmin && !user.isAdmin) {
    scnToast({
      variant: "destructive",
      title: "Access Denied",
      description: "Only administrators can access instructor features.",
    });
    router.push("/");
    return null;
  }

  return <>{children}</>;
};
```

**Why**: Provides additional client-side protection and user feedback with toast notifications.

---

## Database Schema
The user model already has the `isAdmin` field:

**File**: `lib/models/user.model.ts`

```typescript
export interface IUser extends Document {
  // ... other fields
  isAdmin?: boolean;
  // ... other fields
}

export const UserSchema = new Schema({
  // ... other fields
  isAdmin: {
    type: Boolean,
    default: false,
  },
  // ... other fields
});
```

---

## How It Works

### User Flow - Admin User
1. Admin logs in with `isAdmin: true` in database
2. Navbar shows "Become an Instructor" button
3. Mobile sidebar shows "Instructor" link
4. User clicks to navigate to `/teacher/courses`
5. `TeacherLayout` verifies `user.isAdmin === true` ✅
6. `ProtectedRoute` verifies admin requirement ✅
7. User accesses instructor dashboard successfully

### User Flow - Regular User
1. Regular user logs in with `isAdmin: false` (or undefined)
2. Navbar does NOT show "Become an Instructor" button ❌
3. Mobile sidebar does NOT show "Instructor" link ❌
4. If user tries to access `/teacher/courses` via URL:
   - `TeacherLayout` checks `user.isAdmin === false` ❌
   - User is redirected to homepage `/`
   - Toast notification: "Access Denied - Only administrators can access instructor features"

---

## Testing Checklist

### ✅ Frontend Protection
- [ ] Regular users don't see "Become an Instructor" button (desktop)
- [ ] Regular users don't see "Instructor" link (mobile sidebar)
- [ ] Admin users see both instructor access points

### ✅ Backend Protection
- [ ] Non-admin users trying to access `/teacher/courses` via URL are redirected
- [ ] Non-admin users see error toast notification
- [ ] Admin users can access all `/teacher/*` routes

### ✅ Database
- [ ] `isAdmin` field exists in User model
- [ ] Default value is `false` for new users
- [ ] Admin users have `isAdmin: true` set

---

## How to Set a User as Admin

### Method 1: MongoDB Atlas UI
1. Go to MongoDB Atlas
2. Navigate to your `users` collection
3. Find the user document
4. Edit the document
5. Add or update: `"isAdmin": true`

### Method 2: MongoDB Shell
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { isAdmin: true } }
)
```

### Method 3: Mongoose Script
```javascript
import User from './lib/models/user.model';

await User.findOneAndUpdate(
  { email: 'admin@example.com' },
  { isAdmin: true }
);
```

---

## Security Benefits

1. **Defense in Depth**: Multiple layers of protection (frontend, server-side, client-side)
2. **URL Protection**: Direct URL access is blocked for non-admins
3. **User Feedback**: Clear error messages for unauthorized access attempts
4. **Audit Trail**: Console logs for access denial attempts
5. **Type Safety**: TypeScript ensures proper prop passing

---

## Future Enhancements

1. **Role Enum**: Consider adding more granular roles (e.g., `ADMIN`, `INSTRUCTOR`, `STUDENT`)
2. **Permissions System**: Implement fine-grained permissions for different actions
3. **Admin Dashboard**: Create admin panel to manage user roles
4. **API Route Protection**: Add middleware to protect API endpoints
5. **Audit Logging**: Log all role-based access attempts to database

---

## Conclusion

The implementation successfully restricts instructor access to admin users only. The system uses:
- **Frontend hiding** (UX layer)
- **Server-side verification** (security layer)
- **Client-side protection** (feedback layer)

All regular users are now prevented from becoming instructors, and only users with `isAdmin: true` can access instructor features.
