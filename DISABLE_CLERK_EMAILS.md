# Disable Clerk Email Notifications

To stop receiving "[Development]" emails from Clerk and use only custom Resend emails, follow these steps:

## Step 1: Access Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your **Taleldeutchlandservices** instance (top-left dropdown)
3. Make sure you're in the correct instance where `clerk.taleldeutchlandservices.com` is configured

## Step 2: Disable Email Notifications

### Option A: Disable specific email templates (Recommended)

1. In Clerk Dashboard, go to: **Customization** → **Emails**
2. Find and disable the following templates by toggling them off:
   - **Password changed** - Now handled by our custom system
   - **Password reset** - We use our custom forgot password flow
   - Any other notification emails you want to handle via Resend

### Option B: Use Production Mode Only

1. Switch to **Production** keys (once the 400 error is resolved)
2. Production mode allows more control over email settings
3. Development mode always adds "[Development]" prefix

## Step 3: Configure Webhooks (Optional - for future notifications)

If you want to handle other Clerk events like user creation, sign-in, etc.:

1. Go to: **Webhooks** in Clerk Dashboard
2. Click **Add Endpoint**
3. Enter your webhook URL:
   ```
   https://yourdomain.com/api/webhooks/clerk
   ```
   (For local testing: Use ngrok or similar to create a public URL)
4. Select events you want to listen to:
   - `user.created` - Send welcome email
   - `user.updated` - Detect changes
   - `session.created` - Track sign-ins
5. Copy the **Signing Secret** and update `.env.local`:
   ```
   WEBHOOK_SECRET=whsec_your_signing_secret_here
   ```

## Current Setup

✅ **Password Reset Flow**
- User requests reset at `/forgot-password`
- Custom API sends email via Resend (no Clerk email)
- User clicks link → signs in with token → changes password
- Confirmation email sent via Resend

✅ **Password Changed Notification**
- After password update, custom API sends email via Resend
- No Clerk "[Development]" emails

## Testing

1. Request password reset at: `http://localhost:3000/forgot-password`
2. Check email - should come from Resend (no "[Development]" prefix)
3. Complete password reset
4. Check email - should receive "Password Changed" notification from Resend

## Benefits

- ✅ No "[Development]" prefix in emails
- ✅ Full control over email design and content
- ✅ Multilingual support (AR, DE, EN)
- ✅ Custom branding with TDS colors and logo
- ✅ Better email deliverability with Resend

## Notes

- The webhook handler in `app/api/webhooks/clerk/route.ts` is ready for future use
- Current implementation sends emails directly from API routes for better reliability
- Webhook secret is already configured in `.env.local`: `WEBHOOK_SECRET=whsec_...`
