# Video Encoding Scripts

Automated video encoding for UploadThing videos with multiple quality levels.

## Overview

These scripts automatically:
1. **Download** videos from UploadThing
2. **Encode** into 5 quality levels (4K, 1440p, 1080p, 720p, 480p)
3. **Upload** all versions back to UploadThing
4. **Update** database with `videoQualities` object

## Prerequisites

### 1. Install FFmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**Windows:**
Download from https://ffmpeg.org/download.html

### 2. Environment Variables

Ensure your `.env` file has:
```
MONGODB_URI=your_mongodb_connection_string
UPLOADTHING_SECRET=your_uploadthing_secret
```

### 3. Install Dependencies

```bash
npm install form-data
```

## Usage

### Option 1: Encode Single Video

Encode one specific video by ID:

```bash
npx tsx scripts/encode-uploadthing-videos.ts <videoId>
```

**Example:**
```bash
npx tsx scripts/encode-uploadthing-videos.ts 69738cb60fee61c070249360
```

**Process:**
- Downloads original video from UploadThing
- Encodes 5 quality levels
- Uploads all to UploadThing
- Updates database
- Duration: ~10-30 minutes depending on video size

### Option 2: Batch Encode All Videos

Encode all videos that don't have multiple qualities yet:

```bash
npx tsx scripts/batch-encode-videos.ts
```

**Process:**
- Finds all videos without `videoQualities`
- Shows list of videos to process
- Encodes each one sequentially
- Duration: ~10-30 minutes per video

### Option 3: Encode Specific .mp4 File

If you have a local video file:

```bash
./scripts/encode-video-qualities.sh path/to/video.mp4
```

This creates 5 encoded files in the same directory. You'll need to manually upload them to UploadThing.

## What It Does

### Quality Levels Encoded

| Quality | Resolution | Bitrate | Use Case |
|---------|------------|---------|----------|
| 4K      | 3840×2160  | 40 Mbps | High-end devices, fast connections |
| 1440p   | 2560×1440  | 16 Mbps | Large screens, good connections |
| 1080p   | 1920×1080  | 8 Mbps  | Standard HD, most devices |
| 720p    | 1280×720   | 5 Mbps  | Mobile devices, moderate connections |
| 480p    | 854×480    | 2.5 Mbps| Slow connections, data saving |

### Database Update

After encoding, your video document will have:

```javascript
{
  videoUrl: "https://utfs.io/f/original.mp4", // Original (fallback)
  videoQualities: {
    "4K": "https://utfs.io/f/video-4k.mp4",
    "1440p": "https://utfs.io/f/video-1440p.mp4",
    "1080p": "https://utfs.io/f/video-1080p.mp4",
    "720p": "https://utfs.io/f/video-720p.mp4",
    "480p": "https://utfs.io/f/video-480p.mp4"
  }
}
```

## Example Output

```bash
$ npx tsx scripts/encode-uploadthing-videos.ts 69738cb60fee61c070249360

🚀 Starting encoding process for video: 69738cb60fee61c070249360

📊 Connecting to database...
✅ Found video: Introduction to Next.js
📍 URL: https://utfs.io/f/original.mp4

📥 Downloading video from: https://utfs.io/f/original.mp4
📥 Downloading: 100.0%
✅ Download complete

📹 Original video info:
   Resolution: 1920x1080

🎬 Encoding 1080p...
✅ 1080p encoded successfully

📤 Uploading Introduction_to_Next_js_1080p.mp4 to UploadThing...
✅ Uploaded: https://utfs.io/f/encoded-1080p.mp4

🎬 Encoding 720p...
✅ 720p encoded successfully

📤 Uploading Introduction_to_Next_js_720p.mp4 to UploadThing...
✅ Uploaded: https://utfs.io/f/encoded-720p.mp4

💾 Updating database...
✅ Database updated with qualities: 1080p, 720p

🎉 Encoding complete!

📊 Summary:
   Video ID: 69738cb60fee61c070249360
   Title: Introduction to Next.js
   Qualities encoded: 2
   - 1080p: https://utfs.io/f/encoded-1080p.mp4
   - 720p: https://utfs.io/f/encoded-720p.mp4
```

## Features

✅ **Automatic Skip** - Skips qualities higher than original resolution
✅ **Progress Tracking** - Shows download and encoding progress
✅ **Error Handling** - Continues with other qualities if one fails
✅ **Cleanup** - Automatically deletes temporary files
✅ **Database Update** - Updates MongoDB with new quality URLs
✅ **Smart Upload** - Uses sanitized filenames for UploadThing

## Cost Considerations

### UploadThing Storage

Each video becomes 5 videos:
- Original 1080p video: 1.7 GB
- After encoding: 1.7GB + 0.8GB + 0.5GB + 0.3GB + 0.2GB = **3.5 GB total**

Check UploadThing pricing for storage costs.

### Encoding Time

- 1 GB video: ~5-10 minutes
- 5 GB video: ~25-50 minutes
- 10 GB video: ~50-100 minutes

### Bandwidth

Script downloads and re-uploads videos:
- 1.7 GB download + 2.5 GB upload = **4.2 GB bandwidth per video**

## Troubleshooting

### FFmpeg Not Found

```
❌ FFmpeg is not installed
```

**Solution:** Install FFmpeg using the instructions in Prerequisites

### UploadThing Upload Fails

```
❌ Upload failed: No URL returned
```

**Solution:** Check your `UPLOADTHING_SECRET` in `.env`

### Out of Disk Space

```
❌ ENOSPC: no space left on device
```

**Solution:** 
- Free up disk space
- Script needs ~3x original video size as temporary space
- Temporary files are in `temp-encoding/` directory

### Video Not Found

```
❌ Video not found: 69738cb60fee61c070249360
```

**Solution:** Verify the video ID exists in your database

## Workflow Recommendations

### For New Videos

**Option A - Encode Before Upload:**
1. Encode locally: `./scripts/encode-video-qualities.sh video.mp4`
2. Upload all 5 files to UploadThing manually
3. Create video document with `videoQualities` object

**Option B - Encode After Upload:**
1. Upload original video to UploadThing
2. Create video document with `videoUrl`
3. Run: `npx tsx scripts/encode-uploadthing-videos.ts <videoId>`

### For Existing Videos

**Batch Process:**
```bash
# Encode all videos without qualities
npx tsx scripts/batch-encode-videos.ts
```

**Selective Process:**
```bash
# Encode specific high-priority videos
npx tsx scripts/encode-uploadthing-videos.ts video-id-1
npx tsx scripts/encode-uploadthing-videos.ts video-id-2
npx tsx scripts/encode-uploadthing-videos.ts video-id-3
```

## Notes

- **Original video is kept** - `videoUrl` remains as fallback
- **Non-destructive** - Original video stays in UploadThing
- **Smart encoding** - Only creates qualities ≤ original resolution
- **Idempotent** - Can run again safely (will skip videos with qualities)
- **Temporary files** - Automatically cleaned up after encoding

## Support

If encoding fails for a specific video:
1. Check FFmpeg is installed: `ffmpeg -version`
2. Check video URL is accessible
3. Check disk space available
4. Check UploadThing API key is valid
5. Review script output for specific error messages
