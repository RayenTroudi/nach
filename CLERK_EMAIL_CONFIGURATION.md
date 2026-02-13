# Clerk Email Configuration Guide

## Current Issues

### 1. Emails Coming from Clerk Domain
**Current Status:** Now using **production credentials** with custom domain `clerk.taleldeutchlandservices.com`

**Previous Issue:** Emails were coming from "nach <noreply@accounts.dev>" (test environment)

**Why This Happened:**
- The application was using test/development Clerk keys
- Custom email providers require additional configuration in Clerk Dashboard

### 2. Password Reset Code Input Not Showing
**Problem:** After requesting a password reset, the code input field doesn't appear at "sign-in/factor-one".

**Why This Happens:**
- The Clerk `SignIn` component should automatically handle the factor-one verification step
- This is usually a client-side hydration or routing issue

## Solutions

### Fix 1: Configure Clerk to Use Custom Emails

#### Option A: Use Clerk's Custom Email Service (Requires Pro Plan)

Clerk's custom SMTP/email provider feature requires a **paid plan**. If you have a Pro or Enterprise plan:

1. **Go to Clerk Dashboard**
   - Visit [https://dashboard.clerk.com](https://dashboard.clerk.com)
   - Select your application

2. **Navigate to Email Settings**
   - Go to "Customization" → "Email"
   - Click "Email provider settings"

3. **Configure Custom Email Provider**
   - Select "Custom SMTP" or "Custom email service"
   - For Resend integration:
     - Host: `smtp.resend.com`
     - Port: `587` (or `465` for SSL)
     - Username: `resend`
     - Password: Your RESEND_API_KEY (from `.env`)
     - From Email: `noreply@yourdomain.com`
     - From Name: `TDS - Talel Deutschland Services`

4. **Verify Domain**
   - Add DNS records for your domain in Resend Dashboard
   - Verify the domain in both Resend and Clerk

#### Option B: Use Clerk's Free Plan with Custom Branding

On the free plan, you can still customize the email appearance:

1. **Go to Clerk Dashboard**
   - Navigate to "Customization" → "Email"

2. **Customize Email Templates**
   - Click on each email template (Password reset, Sign in code, etc.)
   - Customize:
     - From name: `TDS - Talel Deutschland Services`
     - Email subject
     - Email body/content
     - Button text and links

3. **Brand Settings**
   - Go to "Customization" → "Branding"
   - Upload your logo
   - Set brand colors
   - These will appear in all Clerk emails

**Note:** The email will still come from Clerk's domain (`accounts.dev`), but with your branding.

#### Option C: Use a Custom Domain (Recommended)

1. **Add Custom Domain to Clerk**
   - Go to Clerk Dashboard → "Domains"
   - Click "Add domain"
   - Enter your domain (e.g., `auth.yourdomain.com` or `accounts.yourdomain.com`)

2. **Configure DNS Records**
   - Add the CNAME records provided by Clerk to your DNS provider
   - Wait for verification (can take up to 24 hours)

3. **Set as Primary Domain**
   - Once verified, set it as your primary authentication domain
   - Emails will now come from your domain

### Fix 2: Ensure Password Reset Flow Works Correctly

The password reset verification code input should appear automatically. Here's how to ensure it works:

#### Update Sign-In Component Configuration

The sign-in page is already configured, but let's verify the settings:

```tsx
<SignIn
  localization={getLocalization()}
  appearance={{...}}
  routing="path"
  path="/sign-in"
  signUpUrl="/sign-up"
  afterSignInUrl={redirectUrl}
  redirectUrl={redirectUrl}
/>
```

**Key Settings:**
- `routing="path"` - Uses path-based routing (not hash-based)
- `path="/sign-in"` - The base path for the sign-in component
- Clerk automatically handles sub-routes like `/sign-in/factor-one`

#### Verify Clerk Dashboard Settings

1. **Enable Password Reset**
   - Go to "User & Authentication" → "Email, Phone, Username"
   - Ensure "Password" is enabled
   - Check "Allow users to reset password"

2. **Configure Reset Strategy**
   - Go to "User & Authentication" → "Attack Protection"
   - Under "Password" settings, ensure:
     - ✅ Email verification for password reset is enabled
     - ✅ Code delivery method is "Email"

3. **Check Email Template**
   - Go to "Customization" → "Email"
   - Find "Reset password code" template
   - Ensure it's **enabled** and **active**
   - Test the template by sending yourself a test email

### Fix 3: Debug Password Reset Flow

If the code input still doesn't appear, try these debugging steps:

#### 1. Check Browser Console
Open browser DevTools (F12) and look for errors when you:
- Click "Forgot Password?"
- Enter your email
- Navigate to `/sign-in/factor-one`

Common errors:
- CORS issues
- Clerk API errors
- Routing conflicts

#### 2. Clear Cache and Cookies
```bash
# In browser DevTools
# Application tab → Clear storage → Clear site data
```

#### 3. Test in Incognito Mode
This eliminates browser cache/extension issues.

#### 4. Verify Environment Variables
Your `.env.local` is now configured with **production credentials**:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_********************************
CLERK_SECRET_KEY=sk_live_********************************
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

**✅ Production credentials are now active!**

#### 5. Check Clerk Component Version
Make sure you're using a compatible version:
```bash
npm list @clerk/nextjs
```

Current version: `^4.29.6` (should work fine)

### Fix 4: Alternative Email Configuration

If you want to use Resend for all emails including password resets, you can implement a custom flow:

#### Create Custom Password Reset Pages

```tsx
// app/(auth)/(routes)/forgot-password/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"email" | "code" | "password">("email");
  const { signIn, setActive } = useSignIn();
  const router = useRouter();

  const handleSendCode = async () => {
    await signIn?.create({
      strategy: "reset_password_email_code",
      identifier: email,
    });
    setStep("code");
  };

  const handleVerifyCode = async () => {
    await signIn?.attemptFirstFactor({
      strategy: "reset_password_email_code",
      code: code,
    });
    setStep("password");
  };

  const handleResetPassword = async () => {
    await signIn?.resetPassword({
      password: password,
    });
    await setActive({ session: signIn.createdSessionId });
    router.push("/");
  };

  // Render UI based on step
}
```

**However**, this approach is more complex and the built-in Clerk flow should work.

## Recommended Immediate Actions

### For Email Branding Issue:
1. **Go to Clerk Dashboard** → "Customization" → "Email"
2. **Update "From Name"** to "TDS - Talel Deutschland Services"
3. **Customize email templates** with your branding
4. **(Optional)** Upgrade to Pro plan for custom SMTP if needed

### For Password Reset Code Issue:
1. **Verify Clerk Settings**:
   - User & Authentication → Email, Phone, Username → Password is enabled
   - User & Authentication → Attack Protection → Password reset is allowed
   
2. **Clear Browser Cache** and test in incognito mode

3. **Check Browser Console** for JavaScript errors

4. **Test the flow**:
   - Go to `/sign-in`
   - Click "Forgot Password?"
   - Enter email and submit
   - Check email for code
   - The page should automatically show code input
   - If not, manually go to `/sign-in/factor-one` - the input should appear there

5. **If still not working**, restart your development server:
   ```bash
   # Stop the server
   # Clear Next.js cache
   rm -rf .next
   # Restart
   npm run dev
   ```

## Testing Checklist

- [ ] Clerk Dashboard email settings verified
- [ ] Password authentication enabled
- [ ] Password reset allowed
- [ ] Email template is active
- [ ] "From Name" updated to TDS
- [ ] Branding/logo configured
- [ ] Dev server restarted
- [ ] Browser cache cleared
- [ ] Tested in incognito mode
- [ ] No console errors
- [ ] Can request reset code
- [ ] Receive email with code
- [ ] Code input field appears
- [ ] Can enter code successfully
- [ ] Can set new password
- [ ] Can sign in with new password

## Additional Resources

- [Clerk Email Documentation](https://clerk.com/docs/authentication/email-sms)
- [Clerk Custom SMTP](https://clerk.com/docs/deployments/clerk-hosting#custom-email-provider)
- [Clerk Password Reset](https://clerk.com/docs/authentication/password-protection)
- [Resend Documentation](https://resend.com/docs/introduction)

---

**Last Updated:** February 13, 2026
**Status:** Email from Clerk default domain, password reset flow needs verification
