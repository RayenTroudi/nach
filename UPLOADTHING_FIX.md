# UploadThing Token Fix

## Issue
After upgrading to UploadThing v7.7.4, you need to add the `UPLOADTHING_TOKEN` environment variable.

## Solution

1. **Open your `.env` or `.env.local` file** (create it if it doesn't exist by copying `.env.example`)

2. **Add the following line:**
   ```
   UPLOADTHING_TOKEN=your_uploadthing_secret_key
   ```

3. **Use the same value as your `UPLOADTHING_SECRET`**
   - Both variables should have the same value (your UploadThing secret key)
   - Example:
     ```
     UPLOADTHING_TOKEN=sk_live_abc123...
     UPLOADTHING_SECRET=sk_live_abc123...
     UPLOADTHING_APP_ID=your_app_id
     ```

4. **Get your UploadThing keys:**
   - Go to https://uploadthing.com/dashboard
   - Navigate to your app
   - Copy your Secret Key (starts with `sk_live_...`)

5. **Restart your development server:**
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

## For Production (Vercel)
If deployed on Vercel:
1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add `UPLOADTHING_TOKEN` with the same value as `UPLOADTHING_SECRET`
4. Redeploy your application

## Note
UploadThing v7+ uses `UPLOADTHING_TOKEN` instead of `UPLOADTHING_SECRET`, but keeping both ensures backward compatibility.
