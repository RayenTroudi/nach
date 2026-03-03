# Clerk Webhook Setup Guide - Production Fix

## 🔴 Problem Identified

**Why login fails with production Clerk keys:**

Your `.env` file has a **DEVELOPMENT webhook secret** (`whsec_sGCjjHqBQsDkeSAWtSHdkVOQeyLrsJPa`), but you're trying to use **PRODUCTION Clerk keys**. Each Clerk instance (dev/prod) has its own webhook secret.

**What happens:**
1. User signs up using production Clerk
2. Clerk tries to send webhook to your app
3. Webhook fails because the secret doesn't match
4. User is NOT created in MongoDB
5. Login fails because user doesn't exist in your database

## ✅ Solution: Configure Production Webhook

### Step 1: Access Production Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. **Make sure you're in your PRODUCTION instance** (check top-left dropdown)
3. Navigate to **Webhooks** in the left sidebar

### Step 2: Create Production Webhook

1. Click **"Add Endpoint"** button
2. Enter your **Endpoint URL**: 
   ```
   https://www.taleldeutchlandservices.com/api/webhooks
   ```
3. Subscribe to these events:
   - ✅ `user.created` (required)
   - ✅ `user.updated` (recommended)
   - ✅ `user.deleted` (recommended)
4. Click **"Create"**

### Step 3: Copy Production Webhook Secret

1. After creation, you'll see your webhook listed
2. Click on it to view details
3. Find the **"Signing Secret"** (starts with `whsec_`)
4. Click **"Reveal"** and copy the entire secret

### Step 4: Update Your .env File

Replace the existing `WEBHOOK_SECRET` in your `.env` file:

```bash
# OLD (Development webhook secret)
# WEBHOOK_SECRET=whsec_sGCjjHqBQsDkeSAWtSHdkVOQeyLrsJPa

# NEW (Production webhook secret - get from Step 3)
WEBHOOK_SECRET=whsec_YOUR_PRODUCTION_SECRET_HERE
```

### Step 5: Update Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Find `WEBHOOK_SECRET` and click **Edit**
5. Paste the production webhook secret
6. Click **Save**

### Step 6: Test the Setup

Run the test script:

```bash
npm run test:webhook
```

Or manually test:
1. Try to sign up with a new account
2. Check the Vercel logs (or local terminal) for webhook events
3. Verify user is created in MongoDB

## 🔄 Switching Between Dev and Production

### For Development (localhost):

```bash
# .env or .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_DEV_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_test_YOUR_DEV_SECRET_KEY
WEBHOOK_SECRET=whsec_YOUR_DEV_WEBHOOK_SECRET  # Dev webhook secret
```

### For Production (Vercel):

```bash
# Vercel Environment Variables
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_PROD_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_live_YOUR_PROD_SECRET_KEY
WEBHOOK_SECRET=whsec_YOUR_PRODUCTION_SECRET  # Production webhook secret
```

## 🧪 Testing Webhook Configuration

### Method 1: Use Clerk Dashboard

1. Go to **Webhooks** in Clerk Dashboard (production instance)
2. Click on your webhook
3. Go to **"Testing"** tab
4. Click **"Send test event"**
5. Check your application logs

### Method 2: Use the Test Script

We created a diagnostic script:

```bash
node scripts/test-clerk-webhook.js
```

This will:
- ✅ Check if webhook secret is set
- ✅ Verify MongoDB connection
- ✅ Test user creation flow
- ✅ Provide detailed diagnostics

### Method 3: Check Webhook Delivery Logs

1. In Clerk Dashboard → Webhooks → Your webhook
2. Click **"Logs"** tab
3. Check for recent delivery attempts
4. Look for:
   - ✅ Green checkmarks = successful
   - ❌ Red X = failed (check error message)

## 🐛 Troubleshooting

### Issue: "Webhook verification failed"

**Cause:** Wrong webhook secret

**Fix:**
1. Go to Clerk Dashboard → Webhooks
2. Copy the correct signing secret
3. Update `.env` and Vercel environment variables
4. Redeploy

### Issue: "User exists in Clerk but not in MongoDB"

**Cause:** Webhook wasn't configured when users signed up

**Fix:**
1. Configure webhook (steps above)
2. Use the sync script to import existing users:
   ```bash
   node scripts/sync-clerk-users.js
   ```

### Issue: "WEBHOOK_SECRET is missing"

**Cause:** Environment variable not set

**Fix:**
1. Check your `.env` file
2. Verify `WEBHOOK_SECRET=whsec_...` exists
3. Restart your development server
4. For Vercel, check environment variables in dashboard

### Issue: Webhook works locally but not in production

**Cause:** Vercel environment variables not updated

**Fix:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Verify all Clerk variables are set for **Production** environment
3. Redeploy your app

## 📋 Checklist

Before using production Clerk keys:

- [ ] Production Clerk instance has webhook configured
- [ ] Webhook endpoint: `https://www.taleldeutchlandservices.com/api/webhooks`
- [ ] Events subscribed: `user.created`, `user.updated`, `user.deleted`
- [ ] Production webhook secret copied from Clerk dashboard
- [ ] `.env` file updated with production webhook secret
- [ ] Vercel environment variables updated with production webhook secret
- [ ] App redeployed to Vercel
- [ ] Webhook tested and working (check logs)

## 🎯 Quick Fix Commands

```bash
# 1. Update .env with production webhook secret
# (Manual: edit .env file)

# 2. Test webhook locally
npm run dev
# Then try signing up in browser

# 3. Check MongoDB for new user
node scripts/check-admin.js

# 4. Deploy to Vercel
git add .
git commit -m "Fix: Update production webhook secret"
git push

# 5. Verify in Vercel logs
vercel logs --prod
```

## 📚 Related Documentation

- [CLERK_PRODUCTION_DEPLOYMENT.md](CLERK_PRODUCTION_DEPLOYMENT.md) - Full production setup
- [CLERK_PRODUCTION_KEYS_GUIDE.md](CLERK_PRODUCTION_KEYS_GUIDE.md) - Key management
- Clerk Official Docs: https://clerk.com/docs/integrations/webhooks

## ⚡ Quick Reference

| Environment | Clerk Keys | Webhook Secret | Database |
|-------------|-----------|----------------|----------|
| Development | `pk_test_*` / `sk_test_*` | Dev webhook secret | Test DB |
| Production | `pk_live_*` / `sk_live_*` | Prod webhook secret | Prod DB |

**Remember:** Always match your webhook secret to your Clerk instance (dev keys = dev webhook, prod keys = prod webhook)
