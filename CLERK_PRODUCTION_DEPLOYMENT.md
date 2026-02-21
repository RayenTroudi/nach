# Clerk Production Deployment Guide

## Overview

This guide explains how to properly configure Clerk authentication for both **local development** and **production deployment** to ensure consistent, reliable authentication in both environments.

## Environment Strategy

### Local Development (localhost)
- **Use:** Development Instance keys (`pk_test_`/`sk_test_`)
- **Why:** Reliable authentication, no custom domain required, no origin configuration needed
- **Database:** Separate test database (users created locally won't appear in production)

### Production Deployment (Vercel/etc.)
- **Use:** Production Instance keys (`pk_live_`/`sk_live_`)
- **Why:** Production database, custom domain support, proper user management
- **Database:** Production database (real users)

## 🚨 Critical Rules

### ❌ DO NOT:
1. Use production keys (`pk_live`/`sk_live`) on localhost
2. Use development keys (`pk_test`/`sk_test`) in production
3. Mix keys from different Clerk instances
4. Share keys between environments

### ✅ DO:
1. Use development keys for all local development
2. Use production keys only in production deployment
3. Clear cookies when switching between key types
4. Set production keys as environment variables in your deployment platform

## Local Development Setup

### 1. Configure .env.local

```bash
# Development keys for localhost
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx

# App URL for development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Clerk routes
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Webhook secret (development instance)
WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

### 2. Get Development Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your **Development** instance (or create one)
3. Navigate to: **Developers** → **API Keys**
4. Copy the **Publishable Key** (starts with `pk_test_`)
5. Copy the **Secret Key** (starts with `sk_test_`)
6. Paste into `.env.local`

### 3. No Additional Configuration Needed!

Development keys work out-of-the-box on localhost. No custom domains, no allowed origins, no complex setup.

## Production Deployment Setup

### 1. Configure Production Instance

#### Go to Clerk Dashboard → Production Instance → Settings

#### a) Allowed Origins
Add your production domain(s):
```
https://www.taleldeutchlandservices.com
https://taleldeutchlandservices.com
```

#### b) Redirect URLs
Add these URLs:
```
https://www.taleldeutchlandservices.com/sign-in
https://www.taleldeutchlandservices.com/sign-up
https://www.taleldeutchlandservices.com/sso-callback
https://www.taleldeutchlandservices.com/
```

#### c) Custom Domain (Optional - Pro/Enterprise Plan Only)
If using custom Clerk domain:
- Domain: `clerk.taleldeutchlandservices.com`
- Verify DNS records (CNAME)
- Wait for SSL certificate activation

### 2. Set Environment Variables in Deployment Platform

#### Vercel Example:

1. Go to your Vercel project settings
2. Navigate to: **Settings** → **Environment Variables**
3. Add these variables for **Production** environment:

```bash
# Production Clerk Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx

# Production App URL
NEXT_PUBLIC_APP_URL=https://www.taleldeutchlandservices.com

# Clerk Routes (same as dev)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Webhook secret (production instance)
WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

4. **Important:** Do NOT add these to `.env.local` - keep production keys only in your deployment platform!

### 3. Get Production Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your **Production** instance (top-left dropdown)
3. Navigate to: **Developers** → **API Keys**
4. Copy the **Publishable Key** (starts with `pk_live_`)
5. Copy the **Secret Key** (starts with `sk_live_`)
6. Add to your deployment platform's environment variables

### 4. Configure Webhooks (Optional)

If you need webhooks for user events:

1. Clerk Dashboard → **Webhooks**
2. Click **Add Endpoint**
3. Endpoint URL: `https://www.taleldeutchlandservices.com/api/webhooks`
4. Select events you need (e.g., `user.created`, `user.updated`)
5. Copy the **Signing Secret**
6. Add to environment variables as `WEBHOOK_SECRET`

## Switching Between Environments

### When switching from production keys to development keys (or vice versa):

1. **Update `.env.local`** with the new keys
2. **Clear all cookies:**
   - Visit: `http://localhost:3000/force-signout`
   - Click "Clear All Cookies"
   - Or manually clear cookies in browser DevTools
3. **Restart dev server:**
   ```bash
   npm run dev
   ```
4. **Sign in again** with test credentials

### Why cookie clearing is necessary:

Clerk stores authentication tokens in cookies. When you switch between instances (dev ↔ prod), old cookies contain JWT tokens signed by the previous instance's keys. This causes:
- `jwk-remote-missing` errors
- `null` userId
- Random sign-outs
- Redirect failures

## Troubleshooting

### Problem: userId is null or undefined randomly

**Cause:** Using production keys on localhost  
**Solution:** Switch to development keys in `.env.local`

```bash
# Change from:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx

# To:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
```

Then clear cookies and restart.

### Problem: "jwk-remote-missing" error

**Cause:** Cookie mismatch between Clerk instances  
**Solution:** Clear cookies

1. Visit: `http://localhost:3000/force-signout`
2. Click "Clear All Cookies"
3. Sign in again

### Problem: Redirects failing on protected routes

**Cause:** Production keys expect custom domain configuration  
**Solution:** Use development keys on localhost

Development keys don't require any domain configuration and work reliably.

### Problem: Sign-in works in dev but not production

**Causes:**
1. Production keys not set in deployment platform
2. Allowed origins missing in Clerk Dashboard
3. Redirect URLs not configured

**Solution:**
1. Verify environment variables are set in Vercel/deployment platform
2. Check Clerk Dashboard → Settings → Domains → Allowed Origins
3. Check Clerk Dashboard → Settings → Domains → Redirect URLs

### Problem: Custom domain not working

**Requirements:**
- Clerk Pro or Enterprise plan
- DNS CNAME record properly configured
- SSL certificate activated (automatic, may take a few minutes)

**Check:**
1. Clerk Dashboard → Custom Domain status
2. DNS propagation: `dig clerk.taleldeutchlandservices.com`
3. SSL status: Visit the custom domain URL

## Validation

### Development Server Startup

When you run `npm run dev`, you'll see validation output:

**✅ Correct (Development Keys):**
```
🔐 ========== CLERK CONFIGURATION VALIDATION ==========

✅ Using DEVELOPMENT keys - perfect for localhost!
   Reliable authentication, no domain configuration needed.

📋 Clerk Configuration Summary:
   Environment: development
   Key Type: 🔧 DEVELOPMENT (pk_test_/sk_test_)

🔐 ===================================================
```

**❌ Incorrect (Production Keys on Localhost):**
```
🔐 ========== CLERK CONFIGURATION VALIDATION ==========

❌ ERROR: Using PRODUCTION keys on localhost is NOT recommended!
   This causes inconsistent authentication behavior:
   - Random null userId
   - Unexpected sign-outs
   - Protected route redirect failures
   - jwk-remote-missing errors

   ✅ SOLUTION: Use DEVELOPMENT keys for localhost
```

## Environment Variables Reference

### Required for Both Environments

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Public Clerk key | `pk_test_...` or `pk_live_...` |
| `CLERK_SECRET_KEY` | Secret Clerk key | `sk_test_...` or `sk_live_...` |
| `NEXT_PUBLIC_APP_URL` | Your app URL | `http://localhost:3000` or `https://your-domain.com` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign-in path | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Sign-up path | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Redirect after sign-in | `/` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Redirect after sign-up | `/` |

### Optional

| Variable | Description | When to Use |
|----------|-------------|-------------|
| `WEBHOOK_SECRET` | Clerk webhook signing secret | If using Clerk webhooks |
| `NEXT_PUBLIC_CLERK_AFTER_DELETE_URL` | Redirect after account deletion | If allowing account deletion |

### ⚠️ Do NOT Set These

| Variable | Why Not |
|----------|---------|
| `CLERK_API_URL` | Overrides default, causes issues |
| `NEXT_PUBLIC_CLERK_API_URL` | Not needed, use defaults |
| `NEXT_PUBLIC_CLERK_FRONTEND_API` | Clerk sets automatically |
| `CLERK_PROXY_URL` | Only for advanced satellite setups |
| `NEXT_PUBLIC_CLERK_IS_SATELLITE` | Only for multi-app setups |

## Best Practices

1. **Never commit production keys to git**
   - Add `.env.local` to `.gitignore` ✅ (already done)
   - Use environment variables in deployment platform

2. **Use separate Clerk instances**
   - Development instance for local development
   - Production instance for production deployment
   - Keeps user data separated

3. **Clear cookies when switching**
   - Prevents authentication mismatches
   - Use `/force-signout` page for easy cleanup

4. **Validate on startup**
   - The validator warns about misconfigurations
   - Pay attention to error messages in console

5. **Test before deploying**
   - Test sign-in, sign-up, sign-out flows
   - Test protected routes
   - Test redirects

## Summary

| Environment | Keys | Database | Domain | Configuration |
|-------------|------|----------|--------|---------------|
| **Local Development** | `pk_test_`/`sk_test_` | Test DB | localhost:3000 | Minimal - works out-of-box |
| **Production** | `pk_live_`/`sk_live_` | Production DB | your-domain.com | Requires allowed origins, redirect URLs |

**Key Takeaway:** Use the right keys for the right environment. Development keys for development, production keys for production. Never mix them.

---

**Last Updated:** February 21, 2026  
**Status:** ✅ Recommended Configuration
