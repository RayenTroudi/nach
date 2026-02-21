# Clerk Authentication Fix - jwk-remote-missing Error

## Problem Summary
**Error:** `authReason="jwk-remote-missing"` - "Unable to find a signing key in JWKS that matches the kid=... of the provided session token"

**Root Cause:** Environment mismatch - using the wrong Clerk instance keys for your environment:
- Using production keys (`pk_live_`/`sk_live_`) on localhost
- Using development keys (`pk_test_`/`sk_test_`) in production  
- Browser has cookies from one instance while server uses keys from another

**Impact:** This causes inconsistent authentication:
- Random `null` userId
- Unexpected sign-outs
- Protected route access failures
- Redirect issues

## The Fix: Proper Environment Separation

### ✅ Recommended Configuration

**Local Development (localhost):**
- Use **Development Instance** keys (`pk_test_`/`sk_test_`)
- Reliable authentication
- No custom domain required
- Separate test database

**Production Deployment:**
- Use **Production Instance** keys (`pk_live_`/`sk_live_`)
- Production database
- Custom domain support
- Set via deployment platform environment variables

### Why This Works

Development and production keys come from different Clerk instances:
- Each instance has its own signing keys (JWKS)
- Each instance has its own domain configuration
- Mixing them causes JWT signature verification to fail

By keeping them separate, authentication is consistent and reliable in both environments.

## What Was Fixed

### 1. Environment Configuration (`.env.local`)
- ✅ Now using **development keys** (`pk_test_`/`sk_test_`) for localhost
- ✅ Clear documentation on when to use which keys
- ✅ Instructions for switching keys and clearing cookies

### 2. Enhanced Validation (`lib/clerk-env-validator.ts`)
**Updated:** Now shows ERROR (not just warning) when production keys are used on localhost

**Validation Output:**
```
🔐 ========== CLERK CONFIGURATION VALIDATION ==========

❌ ERROR: Using PRODUCTION keys on localhost is NOT recommended!
   This causes inconsistent authentication behavior:
   - Random null userId
   - Unexpected sign-outs
   - Protected route redirect failures
   - jwk-remote-missing errors

   ✅ SOLUTION: Use DEVELOPMENT keys for localhost

📋 Clerk Configuration Summary:
   Environment: development
   Key Type: 🔧 DEVELOPMENT (pk_test_/sk_test_)

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

### Recommended: Use Development Keys on Localhost

**This is now the default and recommended approach.** Development keys provide:
- ✅ Consistent, reliable authentication
- ✅ No custom domain configuration needed
- ✅ No allowed origins setup required
- ✅ Works out-of-the-box on localhost

**Setup:**
1. Get development keys from Clerk Dashboard → Development Instance
2. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```
3. Clear cookies: Visit `http://localhost:3000/force-signout`
4. Restart dev server and sign in

### Production Deployment

For production, set these in your deployment platform (Vercel, etc.):
- **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY**: Your `pk_live_...` key
- **CLERK_SECRET_KEY**: Your `sk_live_...` key
- **NEXT_PUBLIC_APP_URL**: `https://www.taleldeutchlandservices.com`

**Clerk Dashboard Configuration:**
1. **Allowed Origins:** Add `https://www.taleldeutchlandservices.com`
2. **Redirect URLs:** Add sign-in/sign-up URLs
3. **Custom Domain** (optional): Configure `clerk.taleldeutchlandservices.com`

**See:** [CLERK_PRODUCTION_DEPLOYMENT.md](CLERK_PRODUCTION_DEPLOYMENT.md) for complete guide.

## Testing the Fix

### 1. Start Development Server
```bash
npm run dev
```

### 2. Check Console Output
Look for the Clerk validation output:
```
🔐 ========== CLERK CONFIGURATION VALIDATION ==========
✅ Using DEVELOPMENT keys - perfect for localhost!
   Reliable authentication, no domain configuration needed.
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
❌ userId: null
```

## Files Changed

| File | Change | Purpose |
|------|--------|---------|
| `.env.local` | Switch to dev keys | Use pk_test/sk_test for localhost |
| `lib/clerk-env-validator.ts` | Enhanced warnings | Show ERROR for prod keys on localhost |
| `app/layout.tsx` | Import validator | Run validation on server start |
| `app/force-signout/page.tsx` | **NEW** | Cookie cleanup utility |
| `middleware.ts` | Add public route | Allow access to `/force-signout` |
| `.env.example` | Updated docs | Document both dev and prod setup |
| `CLERK_PRODUCTION_DEPLOYMENT.md` | **NEW** | Complete deployment guide |

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
Using production Clerk keys (`pk_live_`/`sk_live_`) on localhost causes inconsistent authentication behavior. Production keys expect custom domain configuration and production origins, which don't match the localhost environment. This results in:
- Random `null` userId values
- Unexpected sign-outs
- Protected route access failures
- `jwk-remote-missing` errors when cookies don't match

**What's the fix?**  
Use proper environment separation:
1. **Localhost:** Development keys (`pk_test_`/`sk_test_`) in `.env.local`
2. **Production:** Production keys (`pk_live_`/`sk_live_`) in deployment platform
3. Clear cookies when switching: Visit `/force-signout`
4. Use the built-in validator to catch mismatches early

**Benefits:**  
- ✅ Consistent, reliable authentication in both environments
- ✅ No complex domain configuration needed for local development
- ✅ Clear separation between test and production data
- ✅ Automatic validation catches configuration errors

**Prevention:**  
- Follow the environment-based key strategy
- Never use production keys on localhost
- Use the startup validator (automatically warns on mismatch)
- Use `/force-signout` when switching between key types
- Read [CLERK_PRODUCTION_DEPLOYMENT.md](CLERK_PRODUCTION_DEPLOYMENT.md) for full guide

---

**Date Fixed:** February 21, 2026  
**Fixed By:** GitHub Copilot  
**Status:** ✅ Resolved
