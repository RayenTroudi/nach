# Quick Start: Video Migration to Mux

## ✅ What Was Delivered

A **production-grade migration script** that safely moves existing videos from UploadThing to Mux without re-uploading or manual encoding.

## 🚀 Quick Commands

```bash
# 1. Preview (see what will happen - SAFE, no changes)
npm run migrate:videos -- --dry-run

# 2. Test with 3 videos (recommended first run)
npm run migrate:videos -- --limit=3

# 3. Migrate all videos
npm run migrate:videos
```

## 📊 Current Status

**Your Database:**
- ✅ Found: **10 videos** ready to migrate
- ✅ All have valid UploadThing URLs
- ✅ None have been migrated yet (no Mux data)

**Videos Found:**
1. مقدمة
2. كيفية دراسة اللغة
3. ما هي أوراق التأشيرة المطلوبة؟
4. كيفية التقديم على برنامج التدريب المهني (ausbildung)
5. كيفية اجتياز مقابلة ausbildung
6. كيفية إيداع أوراق ausbildung
7. ما هي الأوراق المطلوبة عند وصولك إلى ألمانيا؟
8. الدراسة في ألمانيا
9. كيفاش تحضّر لامتحان TELC
10. كيفاش تحضّر لامتحان TELC

## 🎯 Recommended Migration Steps

### Step 1: Dry Run (5 seconds)
```bash
npm run migrate:videos -- --dry-run
```
**Result:** Preview of what will be migrated ✓

### Step 2: Test Batch (30 seconds)
```bash
npm run migrate:videos -- --limit=3
```
**Result:** Migrates first 3 videos, you can verify they work

### Step 3: Migrate All (2-3 minutes)
```bash
npm run migrate:videos
```
**Result:** All 10 videos migrated to Mux

### Step 4: Verify (1 minute)
- Check Mux Dashboard: https://dashboard.mux.com/video/assets
- Test video playback in your app
- Videos process in 1-3 minutes

## 🔒 Safety Features

✅ **Idempotent** - Safe to re-run, won't duplicate  
✅ **No Deletions** - UploadThing files stay untouched  
✅ **Continue on Error** - One failure won't stop others  
✅ **Detailed Logging** - See exactly what happens  
✅ **Dry Run** - Preview before executing  
✅ **Batch Processing** - Control pace with --limit

## 📁 What Gets Created

### For Each Video:

**Before:**
```javascript
{
  _id: "...",
  title: "Video Title",
  videoUrl: "https://utfs.io/f/abc.mp4",
  muxData: null  // ❌ Missing
}
```

**After:**
```javascript
{
  _id: "...",
  title: "Video Title",
  videoUrl: "https://utfs.io/f/abc.mp4",  // ✅ Preserved
  muxData: ObjectId("...")  // ✅ NEW
}

// New MuxData document:
{
  _id: "...",
  assetId: "01HAB...",       // Mux asset ID
  playbackId: "xyz789abc",   // For streaming
  video: ObjectId("...")     // Links back
}
```

## 🎬 What Changes for Users

### Before Migration:
```
Video plays from UploadThing
→ Single quality MP4
→ Slower buffering
→ No quality adaptation
```

### After Migration:
```
Video streams from Mux
→ HLS with multiple resolutions
→ Instant playback
→ Automatic quality switching
→ Better for slow networks
```

## 💰 Cost Estimate

For your 10 videos (assuming ~10 min average):

| Item | Cost |
|------|------|
| Encoding (one-time) | ~$2 |
| Storage (monthly) | ~$0.50 |
| Streaming (per 1000 views) | ~$1-2 |

**Total first month:** ~$2.50  
**Ongoing monthly:** ~$0.50 + streaming

## 🐛 Troubleshooting

### Issue: "Missing Mux credentials"
**Fix:** Already set in your `.env` ✓

### Issue: Script runs but no videos found
**Cause:** All videos already migrated
**Check:** Run `--dry-run` to see status

### Issue: Some videos fail
**Action:** Script will continue, failed videos listed at end
**Retry:** Just re-run, it will only process failed videos

## 📚 Full Documentation

- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Complete guide
- [MUX_INTEGRATION_README.md](./MUX_INTEGRATION_README.md) - Technical docs
- [MUX_SETUP_CHECKLIST.md](./MUX_SETUP_CHECKLIST.md) - Testing checklist

## 🎉 You're Ready!

Your migration script is:
- ✅ **Tested** - Dry run successful
- ✅ **Configured** - Mux credentials set
- ✅ **Ready** - 10 videos queued
- ✅ **Safe** - Multiple safety features

**Just run:**
```bash
npm run migrate:videos -- --limit=3
```

Then watch the magic happen! 🚀

---

## 💡 Pro Tips

1. **Start small**: Use `--limit=3` first
2. **Watch logs**: Each video shows detailed progress
3. **Check Mux**: Visit dashboard to see assets
4. **Wait for processing**: Videos need 1-3 min to transcode
5. **Test playback**: Try one video before migrating all

## 🆘 Need Help?

```bash
# Re-run dry run to check status
npm run migrate:videos -- --dry-run

# Check environment
cat .env | grep MUX

# Check Mux dashboard
open https://dashboard.mux.com/video/assets
```

---

**Created:** February 10, 2026  
**Script:** `scripts/migrate-videos-to-mux.ts`  
**Status:** ✅ Ready to migrate
