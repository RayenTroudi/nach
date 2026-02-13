# Production Clerk Credentials Update

## ✅ Changes Applied

### 1. Updated Environment Files

#### `.env.local` (Active Configuration)
Updated with **production credentials**:
- ✅ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` → `pk_live_********************************`
- ✅ `CLERK_SECRET_KEY` → `sk_live_********************************`
- ✅ Database name changed from `nach` to `tds`

#### `.env.example` (Template for Production)
Updated with production format:
- ✅ Shows `pk_live_` and `sk_live_` format examples
- ✅ Updated domain references to `taleldeutchlandservices.com`
- ✅ Updated webhook URL to production domain
- ✅ Database name changed to `tds`

#### `.env.template` (Generic Template)
Updated with:
- ✅ Database name changed to `tds`

## 🔐 Production Credentials Summary

| Setting | Value |
|---------|-------|
| **Publishable Key** | `pk_live_********************************` |
| **Secret Key** | `sk_live_********************************` |
| **Frontend API** | `https://clerk.taleldeutchlandservices.com` |
| **Backend API** | `https://api.clerk.com` |
| **JWKS URL** | `https://clerk.taleldeutchlandservices.com/.well-known/jwks.json` |

## 📋 Required Actions

### 1. Update Webhook Configuration in Clerk Dashboard

Since you're now using production credentials, you need to update your webhook endpoint:

1. **Go to** [Clerk Dashboard](https://dashboard.clerk.com)
2. **Navigate to** "Webhooks" in the sidebar
3. **Update or Add Webhook:**
   - Endpoint URL: `https://www.taleldeutchlandservices.com/api/webhooks`
   - Events to listen to:
     - `user.created`
     - `user.updated`
     - `user.deleted`
4. **Copy the Signing Secret** (starts with `whsec_`)
5. **Update `.env.local`** with the new `WEBHOOK_SECRET`

### 2. Verify Domain Configuration in Clerk

Make sure your custom domain is properly configured:

1. **Go to** Clerk Dashboard → "Domains"
2. **Verify** `clerk.taleldeutchlandservices.com` is listed and active
3. **Check DNS records** are properly configured:
   ```
   CNAME: clerk.taleldeutchlandservices.com → clerk.clerk.com
   ```

### 3. Update Allowed Origins/Callbacks

In Clerk Dashboard, verify these URLs are whitelisted:

1. **Go to** "Settings" → "Allowed Origins"
2. **Add:**
   - `https://www.taleldeutchlandservices.com`
   - `https://taleldeutchlandservices.com`
   - `http://localhost:3000` (for local development)

3. **Check Sign-in/Sign-up Paths:**
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in: `/` (root)
   - After sign-up: `/` (root)

### 4. Test Authentication Flow

After updating, test these scenarios:

- [ ] Sign up with new account
- [ ] Sign in with existing account
- [ ] Password reset flow
- [ ] Email verification
- [ ] OAuth providers (if configured)
- [ ] Webhook events are received

### 5. Update Production Environment Variables

If deploying to Vercel or another platform, update environment variables there:

**Vercel:**
1. Go to your project dashboard
2. Navigate to "Settings" → "Environment Variables"
3. Update:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `WEBHOOK_SECRET` (after creating webhook)

**Remember:** Environment variables with `NEXT_PUBLIC_` prefix are exposed to the browser.

### 6. Restart Development Server

For the changes to take effect locally:

```bash
# Stop the current server (Ctrl+C)

# Clear Next.js cache
rm -rf .next

# Restart the development server
npm run dev
```

## 🔒 Security Reminders

1. **Never commit `.env.local`** to version control
   - Already in `.gitignore` ✓

2. **Rotate keys if exposed**
   - If keys are accidentally committed, rotate them immediately in Clerk Dashboard

3. **Use environment-specific keys**
   - Development: Use `pk_test_` and `sk_test_` keys
   - Production: Use `pk_live_` and `sk_live_` keys

4. **Restrict webhook signing secrets**
   - Only store in secure environment variables
   - Different secret for dev and prod

## 📧 Email Configuration Status

**Current Status:**
- Emails will come from `clerk.taleldeutchlandservices.com` (your custom domain)
- Sender: Will show as configured in Clerk Dashboard

**To Update Email Sender:**
1. Go to Clerk Dashboard → "Customization" → "Email"
2. Update "From Name" to: `TDS - Talel Deutschland Services`
3. Customize email templates with your branding

**For Custom SMTP (Optional - Requires Pro Plan):**
- See [CLERK_EMAIL_CONFIGURATION.md](CLERK_EMAIL_CONFIGURATION.md) for Resend SMTP setup

## 🧪 Testing Checklist

After completing all updates:

- [ ] Development server restarted
- [ ] Can access sign-in page at `/sign-in`
- [ ] Can access sign-up page at `/sign-up`
- [ ] Authentication works with production keys
- [ ] Webhooks are being received (check logs)
- [ ] Custom domain shows in Clerk UI
- [ ] Email sender shows your branding
- [ ] Password reset emails arrive
- [ ] Code verification works in password reset
- [ ] User data syncs to MongoDB database `tds`
- [ ] No console errors related to Clerk

## 🚀 Deployment Notes

**Before deploying to production:**

1. **Environment Variables Set:**
   - All Clerk keys configured in hosting platform
   - WEBHOOK_SECRET matches Clerk dashboard
   - NEXT_PUBLIC_SERVER_URL points to production domain

2. **DNS Configured:**
   - Main domain: `taleldeutchlandservices.com`
   - Auth subdomain: `clerk.taleldeutchlandservices.com`
   - Both properly pointed and verified

3. **Clerk Dashboard:**
   - Production instance selected
   - Webhooks pointing to production URL
   - Allowed origins include production domain
   - Email templates customized

4. **Database:**
   - MongoDB connection string for production
   - Database name: `tds`
   - Proper indexes created

## 📞 Support

If you encounter issues:

1. **Check Clerk Dashboard Logs:**
   - Go to "Logs" section to see authentication attempts
   - Check webhook delivery status

2. **Browser Console:**
   - Open DevTools (F12)
   - Look for Clerk-related errors
   - Check network tab for failed API calls

3. **Server Logs:**
   - Check Next.js console output
   - Look for webhook processing errors
   - Verify MongoDB connection

4. **Clerk Documentation:**
   - [Production Checklist](https://clerk.com/docs/deployments/production-checklist)
   - [Custom Domains](https://clerk.com/docs/deployments/clerk-hosting)
   - [Webhooks](https://clerk.com/docs/integrations/webhooks)

---

## 🎯 Quick Start Commands

```bash
# Restart development with new credentials
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Verify environment variables are loaded
node -e "console.log(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)"
```

---

**Last Updated:** February 13, 2026  
**Status:** ✅ Production credentials configured  
**Next Step:** Update webhook secret and test authentication flow
