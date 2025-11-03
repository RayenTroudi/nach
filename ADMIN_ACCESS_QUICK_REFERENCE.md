# Quick Reference: Admin-Only Instructor Access

## Summary
✅ **Implemented**: Only users with `isAdmin: true` can become instructors

## Files Modified

1. **`components/shared/Navbar.tsx`**
   - "Become an Instructor" button now only visible to admins

2. **`components/shared/MobileSideBar.tsx`**
   - "Instructor" link in mobile menu only visible to admins

3. **`app/(dashboard)/(routes)/teacher/layout.tsx`**
   - Server-side check: redirects non-admins trying to access `/teacher/*` routes

4. **`components/shared/ProtectedRoute.tsx`**
   - Added `requireAdmin` prop for client-side admin verification
   - Shows error toast and redirects unauthorized users

## Testing Steps

### Test 1: Regular User (isAdmin: false)
1. ✅ Login as regular user
2. ✅ Verify "Become an Instructor" button is NOT visible (desktop navbar)
3. ✅ Verify "Instructor" link is NOT visible (mobile sidebar)
4. ✅ Try accessing `/teacher/courses` directly via URL
5. ✅ Verify redirect to homepage with error toast

### Test 2: Admin User (isAdmin: true)
1. ✅ Login as admin user
2. ✅ Verify "Become an Instructor" button IS visible (desktop navbar)
3. ✅ Verify "Instructor" link IS visible (mobile sidebar)
4. ✅ Click instructor link
5. ✅ Verify access to `/teacher/courses` is granted

## How to Make a User Admin

### Via MongoDB Atlas
```javascript
// Find user and set isAdmin to true
{
  email: "user@example.com",
  isAdmin: true  // Add or update this field
}
```

### Via Script
```javascript
// Update user in database
await User.findOneAndUpdate(
  { email: "user@example.com" },
  { $set: { isAdmin: true } }
);
```

## Security Layers

| Layer | Location | Type | Purpose |
|-------|----------|------|---------|
| 🎨 **UI Layer** | Navbar.tsx | Frontend | Hide button from non-admins |
| 📱 **Mobile UI** | MobileSideBar.tsx | Frontend | Hide link from non-admins |
| 🛡️ **Server** | TeacherLayout.tsx | Backend | Block unauthorized route access |
| 🔒 **Client** | ProtectedRoute.tsx | Frontend | Additional verification + UX feedback |

## Error Messages

**Access Denied Toast:**
```
Title: "Access Denied"
Description: "Only administrators can access instructor features."
Variant: destructive (red)
```

## Database Schema

```typescript
interface IUser {
  // ... other fields
  isAdmin?: boolean;  // Default: false
  // ... other fields
}
```

## Routes Protected

All routes under `/teacher/*`:
- `/teacher/courses`
- `/teacher/courses/manage/*`
- `/teacher/statistics`
- Any other teacher routes

## Implementation Status

✅ **Completed**
- Frontend button hiding
- Server-side route protection  
- Client-side verification
- Error toast notifications
- Redirect on unauthorized access

## Next Steps (Optional)

1. **Test thoroughly** with both admin and non-admin accounts
2. **Monitor logs** for access denial attempts
3. **Document** which users should be admins
4. **Set up** admin management UI (future enhancement)
