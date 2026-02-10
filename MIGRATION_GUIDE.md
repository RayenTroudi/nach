# Video Migration Guide: UploadThing → Mux

## Overview

This guide explains how to safely migrate your existing videos from direct UploadThing URLs to Mux adaptive bitrate streaming.

## What This Migration Does

✅ **Creates Mux assets** from existing UploadThing URLs  
✅ **Enables adaptive bitrate streaming** (HLS)  
✅ **Preserves original files** (no deletion)  
✅ **No re-uploading** required  
✅ **No manual encoding** required  
✅ **Safe to re-run** (idempotent)

## Prerequisites

1. **Mux Credentials** in your `.env` file:
```bash
MUX_TOKEN_ID=your_mux_token_id
MUX_TOKEN_SECRET=your_mux_token_secret
```

2. **MongoDB Connection** configured

3. **Videos in Database** with UploadThing URLs

## Usage

### 1. Dry Run (Preview Only)

See what will be migrated without making any changes:

```bash
npm run migrate:videos -- --dry-run
```

**Output Example:**
```
⚠️  DRY RUN MODE - No changes will be made

📊 Found 15 videos to migrate

Videos to migrate:
────────────────────────────────────────
1. Introduction to German Grammar
   ID: 66a1c7b5e8f9a2c3d4e5f6a7
   URL: https://utfs.io/f/abc123.mp4...
   
2. Basic Vocabulary Lesson
   ID: 66a1c7b5e8f9a2c3d4e5f6a8
   URL: https://utfs.io/f/def456.mp4...
────────────────────────────────────────

✅ DRY RUN COMPLETE
Would migrate 15 videos.
```

### 2. Migrate Small Batch (Recommended First Run)

Test with a small number of videos:

```bash
npm run migrate:videos -- --limit=5
```

This will migrate only the first 5 videos.

### 3. Full Migration

Migrate all videos:

```bash
npm run migrate:videos
```

## Migration Process

For each video, the script will:

```
1. Check if video needs migration
   ├─> Has UploadThing URL? ✓
   ├─> Already has Mux data? Skip
   └─> Is UploadThing URL valid? ✓

2. Create Mux Asset
   ├─> Mux fetches video from UploadThing URL
   ├─> Mux transcodes to multiple resolutions
   ├─> Mux generates HLS manifest
   └─> Returns: assetId + playbackId

3. Save to MongoDB
   ├─> Create MuxData document
   ├─> Link to Video document
   └─> Keep original videoUrl (not deleted)

4. Log Result
   └─> Success / Skip / Fail
```

## Output Example

```
════════════════════════════════════════
🚀 UploadThing → Mux Migration Script
════════════════════════════════════════

🔌 Connecting to MongoDB...
✅ MongoDB connected successfully

🔍 Searching for videos to migrate...
📊 Found 3 videos to migrate

────────────────────────────────────────
[1/3] Processing: "Introduction to German"
   Video ID: 66a1c7b5e8f9a2c3d4e5f6a7
   URL: https://utfs.io/f/abc123.mp4
   📤 Creating Mux asset (Mux will fetch from UploadThing)...
   ✅ Mux asset created successfully
      Asset ID: 01HABCDEF123456789
      Playback ID: xyz789abc
   💾 Saving to database...
   ✅ Database updated successfully
      MuxData ID: 66a1c7c5e8f9a2c3d4e5f6b0
   🎬 Video can now stream from: https://stream.mux.com/xyz789abc.m3u8

────────────────────────────────────────
[2/3] Processing: "Basic Vocabulary"
   Video ID: 66a1c7b5e8f9a2c3d4e5f6a8
   URL: https://utfs.io/f/def456.mp4
   📤 Creating Mux asset...
   ✅ Mux asset created successfully
   ...

════════════════════════════════════════
📊 MIGRATION SUMMARY
════════════════════════════════════════
Total videos processed: 3
✅ Successful:          3
⚠️  Skipped:             0
❌ Failed:              0
⏱️  Duration:            8s
════════════════════════════════════════

✨ MIGRATION COMPLETE!
3 video(s) successfully migrated to Mux.

NEXT STEPS:
  1. Check Mux Dashboard: https://dashboard.mux.com/video/assets
  2. Videos will process in 1-3 minutes
  3. Once ready, videos will stream with adaptive bitrate
  4. UploadThing files remain as backups
```

## Safety Features

### Idempotent
The migration is safe to re-run. Videos already migrated will be skipped:
```
⚠️  SKIPPED: Already has Mux data
This video was already migrated
```

### Continue on Failure
If one video fails, the script continues with others:
```
❌ FAILED: Network timeout
(continues to next video)
```

### Detailed Error Logging
Failed videos are tracked and reported at the end:
```
❌ FAILED VIDEOS - DETAILS:
────────────────────────────────────────
1. "Advanced Lesson 5"
   Video ID: 66a1c7b5e8f9a2c3d4e5f6a9
   Error: Mux API rate limit exceeded
   URL: https://utfs.io/f/ghi789.mp4
```

## Common Scenarios

### Scenario 1: Fresh Migration
```bash
# Preview first
npm run migrate:videos -- --dry-run

# Migrate in small batches
npm run migrate:videos -- --limit=10

# If successful, migrate all
npm run migrate:videos
```

### Scenario 2: Retry Failed Videos
```bash
# Simply re-run - only failed videos will be attempted
npm run migrate:videos
```

### Scenario 3: New Videos Added
```bash
# Re-run anytime - only new videos will be migrated
npm run migrate:videos
```

## Verification

### 1. Check MongoDB
Each migrated video should have:
```javascript
{
  _id: "...",
  title: "Video Title",
  videoUrl: "https://utfs.io/f/abc.mp4", // Still present
  muxData: ObjectId("..."), // NEW: Reference to MuxData
  ...
}
```

And corresponding MuxData document:
```javascript
{
  _id: "...",
  assetId: "01HABCDEF123", // Mux asset ID
  playbackId: "xyz789abc",  // Public playback ID
  video: ObjectId("..."),   // Reference back to Video
}
```

### 2. Check Mux Dashboard
1. Go to https://dashboard.mux.com/video/assets
2. You should see your videos listed
3. Status should be "Ready" (may take 1-3 minutes)
4. Click on asset to see details

### 3. Test Playback
Try streaming a video:
```
https://stream.mux.com/{playbackId}.m3u8
```

You can test in:
- VLC Media Player
- Browser with HLS.js
- Your frontend with MuxPlayer component

## Troubleshooting

### Error: "Missing Mux credentials"
**Solution:** Add to `.env`:
```bash
MUX_TOKEN_ID=your_token_id
MUX_TOKEN_SECRET=your_token_secret
```

### Error: "Not an UploadThing URL"
**Cause:** Video uses different storage (not UploadThing)  
**Solution:** These videos will be skipped (expected behavior)

### Error: "Network timeout" / "Failed to create Mux asset"
**Causes:**
- UploadThing URL is not publicly accessible
- Mux API temporarily unavailable
- Network issues

**Solutions:**
1. Verify video URL works in browser
2. Check Mux status: https://status.mux.com/
3. Wait a few minutes and re-run migration
4. Check if you hit API rate limits (use `--limit`)

### Error: "MongoDB connection failed"
**Solution:** Check MONGODB_URL in `.env`

### All Videos Skipped
**Possible reasons:**
1. All videos already migrated ✓
2. No videos have UploadThing URLs
3. All videos already have muxData

**Verify:**
```bash
npm run migrate:videos -- --dry-run
```

## Performance Considerations

### API Rate Limits
- Mux has rate limits (typically generous)
- Script includes 500ms delay between requests
- Use `--limit` for large batches:
  ```bash
  npm run migrate:videos -- --limit=50
  ```

### Processing Time
- Mux asset creation: ~1-2 seconds per video
- Mux transcoding: 1-3 minutes (happens asynchronously)
- Script completion: Immediate (doesn't wait for transcoding)

### For Large Migrations (100+ videos)
```bash
# Process in batches of 50
npm run migrate:videos -- --limit=50
npm run migrate:videos -- --limit=50  # Run again for next batch
npm run migrate:videos -- --limit=50  # And so on...

# Or run full migration overnight
npm run migrate:videos
```

## Post-Migration

### What Changed
✅ Videos now have `muxData` references  
✅ MuxData documents created in MongoDB  
✅ Mux assets visible in dashboard  
✅ Videos can stream via HLS  

### What Didn't Change
✅ Original UploadThing files still exist  
✅ Video URLs still in database (for compatibility)  
✅ Frontend still works (if using MuxPlayer)  

### Rollback (if needed)
Since original UploadThing URLs are preserved:
1. Remove `muxData` field from video documents
2. Frontend falls back to UploadThing URLs
3. Delete Mux assets from dashboard (optional)

## Cost Estimate

Mux pricing (approximate):
- **Encoding:** $0.02/minute of video
- **Storage:** $0.02/GB/month
- **Streaming:** $0.01/GB delivered

**Example:**
- 100 videos × 10 minutes each = 1,000 minutes
- Encoding cost: ~$20 (one-time)
- Storage: ~$2-5/month
- Streaming: Pay as you go

**Much cheaper than maintaining custom transcoding infrastructure!**

## Support

If you encounter issues:

1. **Check Mux Dashboard:** https://dashboard.mux.com/
2. **Check Mux Status:** https://status.mux.com/
3. **Review Script Output:** Look for specific error messages
4. **Re-run with Dry Run:** `npm run migrate:videos -- --dry-run`
5. **Check Environment Variables:** Verify credentials are correct

## Summary

```bash
# Step 1: Preview (safe)
npm run migrate:videos -- --dry-run

# Step 2: Test batch (safe)
npm run migrate:videos -- --limit=5

# Step 3: Full migration (when confident)
npm run migrate:videos

# Step 4: Verify in Mux Dashboard
open https://dashboard.mux.com/video/assets
```

Your videos will stream faster and with better quality! 🎉
