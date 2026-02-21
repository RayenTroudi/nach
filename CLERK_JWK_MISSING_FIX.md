# Clerk Authentication Fix - jwk-remote-missing Error

## Problem Summary
**Error:** `authReason="jwk-remote-missing"` - "Unable to find a signing key in JWKS that matches the kid=... of the provided session token"

**Root Cause:** Environment mismatch where browser cookies are from a different Clerk instance than the current API keys. This typically happens when:
- Switching from development keys (`pk_test_`/`sk_test_`) to production keys (`pk_live_`/`sk_live_`)
- Switching between different Clerk instances
- Using production keys with stale development cookies

## What Was Fixed

### 1. Environment Configuration (`.env.local`)
- ✅ Now using **production keys** (`pk_live_`/`sk_live_`) consistently
- ✅ Added clear documentation about the cookie mismatch issue
- ✅ Added instructions to clear cookies when switching environments

### 2. Startup Validation (`lib/clerk-env-validator.ts`)
**New Feature:** Automatic validation on development server startup that checks:
- ✅ Key type detection (prod vs dev)
- ✅ Warns when using production keys on localhost
- ✅ Detects key mismatches (pk_live with sk_test, etc.)
- ✅ Provides actionable remediation steps

**Output Example:**
```
🔐 ========== CLERK CONFIGURATION VALIDATION ==========

⚠️  WARNING: Using PRODUCTION keys on localhost!
   This works but requires:
   1. Add http://localhost:3000 to "Allowed origins" in Clerk Dashboard
      → Dashboard → Settings → Domains → Allowed origins
   2. Custom domain must be fully configured (Pro/Enterprise plan required)
   3. If you see "jwk-remote-missing" errors:
      → Clear all cookies for localhost:3000
      → Visit http://localhost:3000/force-signout
      → Sign in again

📋 Clerk Configuration Summary:
   Environment: development
   Key Type: 🚀 PRODUCTION (pk_live_/sk_live_)
   Publishable Key: pk_live_xxxxxxxx...
   Secret Key: sk_live_xxxxxxxx...

🔐 ===================================================
```

### 3. Cookie Cleanup Utility (`app/force-signout/page.tsx`)
**New Route:** `http://localhost:3000/force-signout`

This page automatically:
1. Signs out from Clerk
2. Provides a button to clear all cookies
3. Explains what caused the error
4. Shows step-by-step recovery instructions

**How to Use:**
1. Visit `http://localhost:3000/force-signout`
2. Click "Clear All Cookies"
3. Sign in again

### 4. Middleware Update (`middleware.ts`)
- ✅ Added `/force-signout` to public routes (no auth required)
- ✅ Maintains existing debug logging
- ✅ Handles edge cases (session claims without userId)

## Quick Fix Guide

### If You See "jwk-remote-missing" Error:

**Option 1: Use Force Sign-Out Page (Easiest)**
```bash
# Visit this URL in your browser:
http://localhost:3000/force-signout

# Follow the on-screen instructions
```

**Option 2: Manual Cookie Cleanup**
1. Open Chrome DevTools (F12)
2. Go to Application → Cookies
3. Delete all cookies for `localhost:3000`
4. Sign in again

**Option 3: Clear Browser Data**
1. Chrome: Settings → Privacy → Clear browsing data
2. Select "Cookies and other site data"
3. Time range: "All time"
4. Clear data
5. Restart browser

## Configuration Requirements

### Using Production Keys on Localhost
If you want to use `pk_live_`/`sk_live_` keys on localhost:

1. **Add Localhost to Allowed Origins:**
   - Go to [Clerk Dashboard](https://dashboard.clerk.com)
   - Navigate: Settings → Domains → Allowed origins
   - Add: `http://localhost:3000`
   - Save changes

2. **Verify Custom Domain Setup:**
   - Requires Clerk Pro/Enterprise plan
   - Custom domain must be fully configured
   - DNS records must be verified

3. **Clear Old Cookies:**
   - Visit `http://localhost:3000/force-signout`
   - Or manually clear cookies

### Alternative: Use Development Keys
For easier local development, use test keys in `.env.local`:

- **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY**: Your `pk_test_...` key from Clerk Dashboard
- **CLERK_SECRET_KEY**: Your `sk_test_...` key from Clerk Dashboard

**Note:** Test keys create separate user databases. Don't use if you need the same users in dev and production.

## Testing the Fix

### 1. Start Development Server
```bash
npm run dev
```

### 2. Check Console Output
Look for the Clerk validation output:
```
🔐 ========== CLERK CONFIGURATION VALIDATION ==========
✅ Using PRODUCTION keys on localhost!
```

### 3. Force Clear Cookies
```bash
# Visit in browser:
http://localhost:3000/force-signout
```

### 4. Sign In Again
```bash
# Visit in browser:
http://localhost:3000/sign-in
```

### 5. Verify Success
Check server logs for:
```
✅ [Middleware] Authenticated - allowing access
userId: user_xxxxx
authStatus: signed-in
```

Should NOT see:
```javascript
❌ authReason: "jwk-remote-missing"
```

## Files Changed

| File | Change | Purpose |
|------|--------|---------|
| `.env.local` | Updated comments | Clarify prod key usage + cookie fix |
| `lib/clerk-env-validator.ts` | **NEW** | Startup validation & warnings |
| `app/layout.tsx` | Import validator | Run validation on server start |
| `app/force-signout/page.tsx` | **NEW** | Cookie cleanup utility |
| `middleware.ts` | Add public route | Allow access to `/force-signout` |

## Production Deployment

### Vercel Environment Variables
Set these in your Vercel project settings:

- **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY**: Your `pk_live_...` key from Clerk Dashboard
- **CLERK_SECRET_KEY**: Your `sk_live_...` key from Clerk Dashboard  
- **NEXT_PUBLIC_APP_URL**: `https://www.taleldeutchlandservices.com`

**Note:** Validation only runs in development mode - production is not affected.

## Troubleshooting

### Still Getting "jwk-remote-missing"?

1. **Verify Key Match:**
   ```bash
   # Check both keys are from the same instance:
   echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY  # Should start with pk_live_ OR pk_test_
   echo $CLERK_SECRET_KEY                   # Should start with sk_live_ OR sk_test_
   ```

2. **Check Clerk Dashboard:**
   - Verify custom domain is active
   - Verify `localhost:3000` is in Allowed Origins
   - Check if instance is suspended/inactive

3. **Clear ALL Browser State:**
   ```bash
   # Chrome Incognito Mode:
   # Open Incognito window (Ctrl+Shift+N)
   # Test login there
   ```

4. **Check for API URL Overrides:**
   ```bash
   # These should NOT be set:
   grep CLERK_API_URL .env.local
   grep NEXT_PUBLIC_CLERK_API_URL .env.local
   
   # If found, remove them unless specifically required
   ```

### Error Persists in Production?

1. **Check Vercel Environment Variables:**
   - Ensure keys match (both prod or both dev)
   - No typos in key values
   - Variables are set for "Production" environment

2. **Check Custom Domain:**
   - DNS records are correct
   - SSL certificate is valid
   - Clerk domain verification passed

3. **Force Re-deploy:**
   ```bash
   git commit --allow-empty -m "Force redeploy"
   git push origin main
   ```

## Summary

**What was the issue?**  
Browser had old cookies from development Clerk instance (`accounts.dev`) while the app was using production keys (`clerk.taleldeutchlandservices.com`). The JWT signing keys didn't match, causing `jwk-remote-missing` errors.

**What's the fix?**  
1. Clear old cookies (use `/force-signout` page)
2. Sign in again with production keys
3. Use the built-in validator to catch mismatches early

**Prevention:**  
- Use the startup validator (automatically warns on mismatch)
- Use `/force-signout` when switching environments
- Keep development and production keys separate

---

**Date Fixed:** February 21, 2026  
**Fixed By:** GitHub Copilot  
**Status:** ✅ Resolved
