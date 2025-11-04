# Clerk Webhook Setup Guide

## 🎯 Purpose
The Clerk webhook automatically creates users in MongoDB when they sign up through Clerk authentication.

## 📋 Step-by-Step Setup

### 1. Access Clerk Dashboard
- Go to [Clerk Dashboard](https://dashboard.clerk.com)
- Select your application

### 2. Create Webhook Endpoint
- Navigate to **Webhooks** in the sidebar
- Click **Add Endpoint**
- Enter your webhook URL:
  ```
  https://nach-snowy.vercel.app/api/webhooks
  ```

### 3. Configure Events
Subscribe to these events:
- ✅ `user.created` - When a new user signs up
- ✅ `user.updated` - When user profile is updated
- ✅ `user.deleted` - When a user is deleted
- ✅ `session.created` - When user logs in
- ✅ `session.ended` - When user logs out
- ✅ `email.created` - When user adds email

### 4. Get Signing Secret
- After creating the webhook, Clerk will show you a **Signing Secret**
- Copy this secret (starts with `whsec_`)
- Add it to your environment variables:
  ```
  WEBHOOK_SECRET=whsec_your_secret_here
  ```

### 5. Update Vercel Environment Variables
In your Vercel project settings:
1. Go to **Settings** → **Environment Variables**
2. Add/Update these variables:
   - `WEBHOOK_SECRET` = Your Clerk webhook secret
   - `NEXT_PUBLIC_SERVER_URL` = `https://nach-snowy.vercel.app`
   - `MONGODB_URL` = Your MongoDB connection string
   - `DATABASE_NAME` = `nach`

### 6. Redeploy
After adding environment variables:
```bash
git add .
git commit -m "Update webhook configuration for production"
git push origin main
```

Or trigger a redeploy in Vercel dashboard.

## 🧪 Testing the Webhook

### Test User Creation
1. Sign up a new user on your site: `https://nach-snowy.vercel.app/sign-up`
2. Check Clerk Dashboard → Webhooks → Your endpoint → Recent deliveries
3. Verify user was created in MongoDB:
   - Go to MongoDB Atlas
   - Navigate to your `nach` database
   - Check the `users` collection
   - Look for the newly created user

### Check Webhook Logs
- In Clerk Dashboard → Webhooks → Your endpoint
- Click on individual webhook deliveries
- Check the response:
  - ✅ **200 status** = Success
  - ❌ **400/500 status** = Error (check logs)

## 🔍 Troubleshooting

### Webhook Returns 400/500 Error
1. Check Vercel logs:
   ```
   Vercel Dashboard → Your Project → Deployments → Latest → Functions
   ```
2. Verify environment variables are set correctly
3. Check MongoDB connection string is valid

### User Not Created in MongoDB
1. Verify `WEBHOOK_SECRET` matches Clerk dashboard
2. Check MongoDB connection URL is correct
3. Review Vercel function logs for errors
4. Ensure database name is `nach`

### Webhook Not Firing
1. Verify webhook URL is correct: `https://nach-snowy.vercel.app/api/webhooks`
2. Check webhook is enabled in Clerk dashboard
3. Verify all required events are subscribed
4. Test with a new user signup

## 📝 What the Webhook Does

When a user signs up:
1. Clerk sends event to `/api/webhooks`
2. Webhook validates the request using `WEBHOOK_SECRET`
3. Extracts user data (clerkId, email, name, picture)
4. Creates user document in MongoDB `users` collection
5. Returns success/error response to Clerk

## 🔐 Security Notes

- Never commit `.env.local` to git (it's in `.gitignore`)
- Keep `WEBHOOK_SECRET` and other secrets secure
- Only use HTTPS URLs for webhooks in production
- Clerk validates webhook signatures automatically

## 📚 Additional Resources

- [Clerk Webhooks Documentation](https://clerk.com/docs/integrations/webhooks)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

## ✅ Checklist

Before going live:
- [ ] Clerk webhook endpoint created with production URL
- [ ] All required events subscribed
- [ ] `WEBHOOK_SECRET` added to Vercel environment variables
- [ ] `NEXT_PUBLIC_SERVER_URL` updated to production URL
- [ ] MongoDB connection URL set in Vercel
- [ ] Flouci payment credentials added to Vercel
- [ ] Test user signup creates user in MongoDB
- [ ] Webhook shows 200 responses in Clerk dashboard

---

**Current Production URL:** `https://nach-snowy.vercel.app`
**Webhook Endpoint:** `https://nach-snowy.vercel.app/api/webhooks`
