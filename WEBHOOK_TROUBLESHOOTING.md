# 🔧 Webhook Troubleshooting Guide for OAuth Sign-ups

## Issue: Users signing up with Google/OAuth not saved to MongoDB

### ✅ Step-by-Step Verification

#### 1. **Check Clerk Webhook Configuration**

Go to [Clerk Dashboard](https://dashboard.clerk.com) → Your App → Webhooks

**Verify:**
- ✅ Endpoint URL is: `https://nach-snowy.vercel.app/api/webhooks`
- ✅ Endpoint is **enabled** (toggle is ON)
- ✅ Events subscribed:
  - `user.created` ✅
  - `user.updated` ✅
  - `user.deleted` ✅
  - `session.created` ✅
  - `session.ended` ✅
  - `email.created` ✅

#### 2. **Verify Webhook Secret in Vercel**

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Check that `WEBHOOK_SECRET` is set correctly
3. **IMPORTANT:** The secret should match the one from Clerk Dashboard
4. Format: `whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

#### 3. **Test the Webhook**

**Option A: Sign up with Google and check logs**

1. Go to `https://nach-snowy.vercel.app/sign-up`
2. Click "Continue with Google"
3. Complete the sign-up
4. Check Vercel logs:
   - Vercel Dashboard → Your Project → Deployments → Latest → Functions
   - Look for logs starting with 🔔, 📝, ✅, ❌

**Option B: Check Clerk webhook delivery**

1. Go to Clerk Dashboard → Webhooks → Your endpoint
2. Click on your webhook endpoint
3. View "Recent Deliveries"
4. Look for:
   - ✅ **200 status** = Success
   - ❌ **400/500 status** = Error

#### 4. **Common Issues & Solutions**

##### Issue: Webhook returns 400 "Missing svix headers"
**Solution:**
- The webhook URL in Clerk might be wrong
- Make sure it's exactly: `https://nach-snowy.vercel.app/api/webhooks`
- No trailing slash!

##### Issue: Webhook returns 400 "Error verifying webhook"
**Solution:**
- Webhook secret doesn't match
- Get the secret from Clerk Dashboard → Webhooks → Your endpoint → Signing Secret
- Update `WEBHOOK_SECRET` in Vercel environment variables
- Redeploy

##### Issue: Webhook returns 500 "Error creating user"
**Solution:**
- MongoDB connection issue
- Check `MONGODB_URL` in Vercel environment variables
- Verify MongoDB Atlas is accessible (whitelist 0.0.0.0/0 or Vercel IPs)

##### Issue: No webhook delivery at all
**Solution:**
- Webhook is disabled in Clerk
- Go to Clerk Dashboard → Webhooks → Enable your endpoint
- Events not subscribed - make sure `user.created` is checked

#### 5. **View Detailed Logs**

I've added enhanced logging. After deployment, check Vercel logs for:

```
🔔 Webhook received!
📝 WEBHOOK_SECRET exists: true
📨 Svix Headers: { id: ✅, timestamp: ✅, signature: ✅ }
✅ Webhook verified successfully!
📋 Event Type: user.created
👤 User Data: { ... }
🆕 Creating user in MongoDB...
📧 Email: user@example.com
👤 Name: John Doe
🔑 Clerk ID: user_xxxxx
💾 Saving user: { ... }
✅ User created successfully in MongoDB
```

#### 6. **Verify User in MongoDB**

1. Go to MongoDB Atlas → Database → Browse Collections
2. Select database: `nach`
3. Select collection: `users`
4. Look for the user with the email you used to sign up
5. Check the `clerkId` matches the one in Clerk Dashboard

#### 7. **Force Webhook Retry**

If a webhook failed:
1. Go to Clerk Dashboard → Webhooks → Your endpoint → Recent Deliveries
2. Click on the failed delivery
3. Click "Resend" button

#### 8. **Test with Manual Webhook**

You can test the endpoint manually:

```bash
# Get the webhook secret from Clerk
# Then use Clerk's "Test webhook" feature in the dashboard
```

---

## 🔍 Quick Checklist

Before asking for help, verify:

- [ ] Webhook URL is correct in Clerk: `https://nach-snowy.vercel.app/api/webhooks`
- [ ] Webhook is enabled in Clerk Dashboard
- [ ] `user.created` event is subscribed
- [ ] `WEBHOOK_SECRET` is set in Vercel environment variables
- [ ] `WEBHOOK_SECRET` matches the one from Clerk Dashboard
- [ ] `MONGODB_URL` is correct in Vercel
- [ ] MongoDB Atlas allows connections (0.0.0.0/0 whitelisted)
- [ ] Latest deployment is live on Vercel
- [ ] Checked Vercel function logs for errors
- [ ] Checked Clerk webhook deliveries

---

## 📱 Testing Workflow

1. **Clear browser cache/cookies**
2. **Open incognito/private window**
3. **Go to:** `https://nach-snowy.vercel.app/sign-up`
4. **Click:** "Continue with Google"
5. **Complete sign-up**
6. **Wait 2-3 seconds**
7. **Check Clerk Dashboard:** Webhooks → Recent Deliveries
8. **Check Vercel Logs:** Functions tab
9. **Check MongoDB:** users collection
10. **Check home page:** User should see their profile

---

## 🆘 Still Not Working?

### Next Steps:

1. **Share the Clerk webhook delivery status:**
   - Screenshot from Clerk Dashboard → Webhooks → Recent Deliveries

2. **Share Vercel logs:**
   - Copy logs from Vercel → Functions tab after sign-up

3. **Verify environment variables:**
   ```bash
   # In Vercel, check these are set:
   WEBHOOK_SECRET=whsec_...
   MONGODB_URL=mongodb+srv://...
   DATABASE_NAME=nach
   ```

4. **Test webhook manually:**
   - Use Clerk's "Test" button in webhook settings
   - Should return 200 OK

---

**Last Updated:** November 4, 2025
**Webhook URL:** https://nach-snowy.vercel.app/api/webhooks
