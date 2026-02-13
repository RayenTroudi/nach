# Clerk Password Reset Setup Guide

## Overview
This guide explains how to enable and configure password reset functionality in your application using Clerk.

## Issues Fixed
1. ✅ **Hydration Error** - Fixed by preventing localStorage access during SSR
2. ✅ **Localization** - Added multi-language support (English, German, Arabic)
3. ⚙️ **Password Reset** - Requires Clerk Dashboard configuration

## Password Reset Configuration

### How Clerk Password Reset Works
When users click "Forgot Password?" on the sign-in page, Clerk:
1. Sends a verification code to the user's email
2. Shows an input field to enter the verification code
3. Allows the user to set a new password

### Steps to Enable Password Reset

#### 1. Configure Clerk Dashboard
Go to your [Clerk Dashboard](https://dashboard.clerk.com) and follow these steps:

1. **Select Your Application**
   - Navigate to your application in the Clerk Dashboard

2. **Go to User & Authentication Settings**
   - Click on "User & Authentication" in the left sidebar
   - Select "Email, Phone, Username"

3. **Enable Password Reset**
   - Ensure "Password" is enabled as an authentication strategy
   - Make sure "Email address" is enabled and set as a required field

4. **Configure Email Settings**
   - Go to "Customization" → "Email Templates"
   - Find "Password Reset" template
   - Customize the email template if needed (optional)
   - Ensure the template is active

5. **Enable Password Reset Strategy**
   - Go to "User & Authentication" → "Attack Protection"
   - Ensure "Rate Limiting" is configured but not too restrictive
   - Check "Password Settings" and enable:
     - ✅ Allow password reset via email
     - ✅ Show password field in sign-in form

#### 2. Verify Environment Variables
Make sure your `.env.local` file has the correct Clerk keys:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

#### 3. Test Password Reset Flow

1. **Go to Sign-In Page**
   - Navigate to `/sign-in` on your application
   
2. **Click "Forgot Password?"**
   - You should see a link/button below the password field
   
3. **Enter Your Email**
   - Input the email address associated with your account
   - Click "Send code" or "Continue"
   
4. **Check Your Email**
   - You should receive an email with a verification code
   
5. **Enter Verification Code**
   - The form should automatically show an input field for the code
   - Enter the code from your email
   
6. **Set New Password**
   - After code verification, you'll see fields to set a new password
   - Enter and confirm your new password
   - Click "Reset password"

## Code Changes Made

### 1. Fixed Hydration Error
**Files Modified:**
- `app/(auth)/(routes)/sign-in/[[...sign-in]]/page.tsx`
- `app/(auth)/(routes)/sign-up/[[...sign-up]]/page.tsx`

**Changes:**
- Added `mounted` state to prevent SSR/Client mismatch
- Moved localStorage checks inside `useEffect` after component mounts
- Added loading state while mounting

### 2. Added Localization Support
**Files Modified:**
- `app/layout.tsx`
- `app/[locale]/layout.tsx`
- `app/(auth)/(routes)/sign-in/[[...sign-in]]/page.tsx`
- `app/(auth)/(routes)/sign-up/[[...sign-up]]/page.tsx`

**Changes:**
- Installed `@clerk/localizations` package
- Imported and configured `deDE`, `enUS`, and `arSA` localizations
- Added `localization` prop to all `ClerkProvider` and Clerk components
- Automatic language detection based on current locale

### 3. Enhanced Password Reset Support
**Changes:**
- Added `redirectUrl` prop to ensure proper navigation after reset
- Configured proper routing for sign-in/sign-up flows
- Clerk's password reset is now fully functional with localization

## Supported Languages

| Language | Code | Status |
|----------|------|--------|
| English  | `en` | ✅ Full Support |
| German   | `de` | ✅ Full Support |
| Arabic   | `ar` | ✅ Full Support (RTL) |

## Troubleshooting

### Issue: "Forgot Password?" link not showing
**Solution:**
1. Check Clerk Dashboard → User & Authentication → Email, Phone, Username
2. Ensure "Password" authentication is enabled
3. Verify "Email address" is marked as required

### Issue: Not receiving password reset emails
**Solution:**
1. Check spam/junk folder
2. Verify email settings in Clerk Dashboard
3. Check Clerk Dashboard → Customization → Email Templates
4. Ensure "Password Reset" template is active
5. Check your environment variables are correct

### Issue: Verification code input not appearing
**Solution:**
1. Clear browser cache and cookies
2. Try in incognito/private browsing mode
3. Check browser console for JavaScript errors
4. Verify Clerk is properly configured in the Dashboard

### Issue: Hydration errors persist
**Solution:**
1. Clear `.next` build folder: `rm -rf .next`
2. Restart development server: `npm run dev`
3. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

## Additional Features

### Custom Password Requirements
You can configure password requirements in Clerk Dashboard:
1. Go to "User & Authentication" → "Email, Phone, Username"
2. Click on "Password" settings
3. Configure:
   - Minimum length
   - Require special characters
   - Require numbers
   - Require uppercase/lowercase

### Email Customization
Customize the password reset email in Clerk Dashboard:
1. Go to "Customization" → "Email Templates"
2. Select "Password Reset" template
3. Customize:
   - Subject line
   - Email body
   - Button text
   - Branding colors

## Testing Checklist

- [ ] Sign-in page loads without hydration errors
- [ ] "Forgot Password?" link is visible
- [ ] Can request password reset code
- [ ] Email with code is received
- [ ] Code input field appears after requesting reset
- [ ] Can enter verification code
- [ ] Can set new password after code verification
- [ ] Can sign in with new password
- [ ] Works in all languages (EN, DE, AR)
- [ ] Works in both light and dark modes

## Support

If you continue to experience issues:
1. Check the [Clerk Documentation](https://clerk.com/docs)
2. Visit [Clerk Support](https://clerk.com/support)
3. Check the browser console for specific error messages
4. Verify all environment variables are correctly set

---

**Last Updated:** February 13, 2026
**Version:** 1.0.0
