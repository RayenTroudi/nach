# Clerk Domain Setup Fix

## 🔴 Current Error

```
Error: Call Stack o._fetch
https://clerk.taleldeutchlandservices.com/npm/@clerk/clerk-js@4/dist/clerk.browser.js
```

**Root Cause:** Your publishable key is configured for a custom domain (`clerk.taleldeutchlandservices.com`) that hasn't been set up or isn't accessible yet.

## ✅ Solution Options

You have **two options** to fix this issue:

---

## Option 1: Use Default Production Keys (Quick Fix - Recommended)

This is the **fastest solution** to get your app working immediately.

### Steps:

1. **Go to Clerk Dashboard**
   - Visit [https://dashboard.clerk.com](https://dashboard.clerk.com)
   - Select your production application

2. **Navigate to API Keys**
   - Click on "API Keys" in the left sidebar
   - OR go to "Developers" → "API Keys"

3. **Copy Your Production Keys**
   - Look for keys that start with:
     - Publishable key: `pk_live_xxxxxxxxx` (simpler format)
     - Secret key: `sk_live_xxxxxxxxx`
   
   **Important:** You want keys that look like this:
   ```
   pk_live_Y2xlcmsuYWNjb3VudHMuZGV2JA
   ```
   NOT like this (custom domain encoded):
   ```
   pk_live_Y2xlcmsudGFsZWxkZXV0Y2hsYW5kc2VydmljZXMuY29tJA
   ```

4. **Update Your `.env.local`**
   
   Replace the keys in `.env.local` with the new ones:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_[your_new_key_here]
   CLERK_SECRET_KEY=sk_live_[your_new_secret_here]
   ```

5. **Restart Your Dev Server**
   ```bash
   npm run dev
   ```

6. **Test**
   - Go to `/sign-in`
   - The error should be gone!

---

## Option 2: Configure Custom Domain (Advanced)

If you want to use your custom domain `clerk.taleldeutchlandservices.com`, you need to set it up properly.

### Prerequisites:
- Access to your domain's DNS settings
- Clerk Pro or Enterprise plan (custom domains require paid plan)

### Steps:

#### Step 1: Setup Custom Domain in Clerk Dashboard

1. **Go to Clerk Dashboard**
   - Navigate to your application
   - Click "Customization" → "Domains" (or "Settings" → "Domains")

2. **Add Custom Domain**
   - Click "Add domain" or "Add custom domain"
   - Enter: `clerk.taleldeutchlandservices.com`
   - Click "Add domain"

3. **Get DNS Records**
   - Clerk will provide you with DNS records to add
   - Typically looks like:
     ```
     Type: CNAME
     Name: clerk
     Value: clerk.clerk.com
     ```

#### Step 2: Configure DNS Records

1. **Go to Your DNS Provider**
   - (e.g., Cloudflare, GoDaddy, Namecheap, etc.)
   - Navigate to DNS management for `taleldeutchlandservices.com`

2. **Add CNAME Record**
   - Type: `CNAME`
   - Name: `clerk` (or `clerk.taleldeutchlandservices.com`)
   - Target/Value: `clerk.clerk.com` (or as provided by Clerk)
   - TTL: `Auto` or `300`

3. **Save Changes**
   - DNS propagation can take 1-48 hours

#### Step 3: Verify Domain in Clerk

1. **Return to Clerk Dashboard**
   - Go back to Domains page
   - Click "Verify" next to your domain

2. **Wait for Verification**
   - This can take a few minutes to several hours
   - Clerk will check if DNS records are correct

3. **Set as Primary** (Optional)
   - Once verified, you can set it as your primary authentication domain

#### Step 4: Update SSL Certificate

1. **Clerk Auto-Generates SSL**
   - Once domain is verified, Clerk automatically provisions an SSL certificate
   - Wait for "SSL Active" status

#### Step 5: Test

1. **Restart Your Application**
   ```bash
   npm run dev
   ```

2. **Verify Domain is Working**
   - Visit: `https://clerk.taleldeutchlandservices.com`
   - Should show Clerk page (not 404 or error)

3. **Test Sign-In**
   - Go to `/sign-in` on your app
   - Should work without errors

---

## 🔍 How to Check Which Keys You Have

### Decode Your Current Publishable Key

Your current key: `pk_live_Y2xlcmsudGFsZWxkZXV0Y2hsYW5kc2VydmljZXMuY29tJA`

This is Base64 encoded. To decode it:

```bash
# In PowerShell:
[System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String("Y2xlcmsudGFsZWxkZXV0Y2hsYW5kc2VydmljZXMuY29tJA"))
```

Result: `clerk.taleldeutchlandservices.com$`

This confirms your key is configured for a custom domain.

### Standard Production Keys

Standard production keys (without custom domain) encode to:
- `accounts.dev` or
- `clerk.accounts.com` or similar

---

## 🎯 Recommended Approach

**For immediate deployment:**
→ Use **Option 1** (Default Production Keys)

**For custom branding:**
→ Use **Option 2** (Custom Domain Setup)
→ But only if you have a paid Clerk plan and time to configure DNS

---

## 🛠️ Quick Fix Steps (TL;DR)

1. Go to [Clerk Dashboard](https://dashboard.clerk.com) → API Keys
2. Copy the simpler production keys (not custom domain encoded)
3. Update `.env.local`:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_[new_key]
   CLERK_SECRET_KEY=sk_live_[new_key]
   ```
4. Restart server: `npm run dev`
5. Test sign-in

---

## 📧 Emails After Switching Keys

**Important:** After switching to default production keys:

- Authentication emails will come from: `accounts.dev` or `clerk.com`
- NOT from your custom domain

**To customize email branding:**
1. Clerk Dashboard → Customization → Email
2. Update "From Name" to "TDS - Talel Deutschland Services"
3. Customize templates

You can still have good branding without a custom domain!

---

## 🔐 Current Configuration

**File:** `.env.local`

Current problematic setup:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_********************************
CLERK_SECRET_KEY=sk_live_********************************
```

**Action Required:**
- [ ] Get correct production keys from Clerk Dashboard
- [ ] Update `.env.local` with new keys
- [ ] Restart development server
- [ ] OR configure custom domain DNS properly

---

## 🧪 Testing After Fix

Once you've applied the fix, test:

- [ ] Navigate to `/sign-in` - no errors
- [ ] Sign up with new account - works
- [ ] Sign in with existing account - works
- [ ] Password reset - code input appears
- [ ] Receive emails - check inbox
- [ ] No console errors related to Clerk

---

## 💡 Need Help?

**Check Clerk Dashboard Logs:**
1. Clerk Dashboard → "Logs"
2. Look for API errors or failed requests
3. Check webhook status

**Verify Your Plan:**
- Custom domains require **Clerk Pro or Enterprise**
- Check: Dashboard → Settings → Billing

**DNS Propagation:**
- Use [WhatsMyDNS](https://www.whatsmydns.net/) to check if DNS has propagated
- Enter: `clerk.taleldeutchlandservices.com`

---

**Last Updated:** February 13, 2026  
**Status:** ⚠️ Custom domain not configured - use default production keys  
**Next Step:** Get correct keys from Clerk Dashboard and update `.env.local`
