# Clerk Production Keys Setup Guide

## Why You're Seeing "[Development]" in Emails

You're currently using **Development keys** (`pk_test_...`), which adds "[Development]" prefix to all emails from Clerk.

## How to Fix This

### Step 1: Switch to Production Instance

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. **Top-left corner** - Click instance dropdown
3. Select your **PRODUCTION** instance (where your custom domain is verified)

### Step 2: Get Production Keys

1. In Production instance, go to: **Developers** → **API Keys**
2. Copy both keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_live_...`)
   - `CLERK_SECRET_KEY` (starts with `sk_live_...`)

### Step 3: Update .env.local

Replace the test keys in `.env.local`:

```env
# PRODUCTION KEYS - Remove [Development] from emails
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE
```

### Step 4: Restart Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### Step 5: Verify

1. Test password reset again
2. Check email - "[Development]" prefix should be gone
3. Custom domain emails should work: `noreply@clerk.taleldeutchlandservices.com`

## Important Notes

⚠️ **Custom Domain Setup**: Make sure in Production instance:
- Custom domain `clerk.taleldeutchlandservices.com` is verified (green checkmark)
- Email settings configured properly
- Production keys match the instance where domain is configured

✅ **Current Status**:
- Development keys: Working for testing
- Production keys: Ready when you get them from dashboard
- Custom domain: Verified and configured

## Troubleshooting

**If production keys cause errors**:
1. Verify you're in the PRODUCTION instance
2. Check custom domain status (should be green checkmark)
3. Regenerate keys if needed: Dashboard → Developers → API Keys → "Regenerate"

**If emails still show [Development]**:
- Make sure you copied `pk_live_` and `sk_live_` (NOT `pk_test_`)
- Restart the development server
- Clear browser cache and cookies
