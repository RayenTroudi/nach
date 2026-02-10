# Mux Video Streaming Integration

## Overview

This project has been refactored to use **Mux** for video processing and adaptive bitrate (ABR) streaming. Videos are uploaded via **UploadThing**, then automatically sent to **Mux** for processing.

## Architecture

```
┌─────────────────┐
│   User Uploads  │
│     Video       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  UploadThing    │  ← Upload only (512GB max per file)
│  (File Storage) │
└────────┬────────┘
         │ Returns video URL
         ▼
┌─────────────────┐
│   Mux API       │  ← Video processing + transcoding
│  (create asset) │  ← Generates multiple resolutions
└────────┬────────┘
         │ Returns assetId + playbackId
         ▼
┌─────────────────┐
│   MongoDB       │  ← Store playbackId (not raw URL)
│  (Video Model)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Frontend      │  ← MuxPlayer component
│  (HLS Streaming)│  ← Automatic ABR
└─────────────────┘
```

## Key Changes

### 1. Video Upload Flow (NEW)

**Before:**
- Upload video → Save URL directly to MongoDB → Stream MP4 file

**After:**
- Upload video to UploadThing → Create Mux asset → Save Mux playback ID → Stream via HLS

### 2. Database Schema

**Video Model Changes:**
- ✅ `muxData` - Reference to MuxData document (PRIMARY)
- ⚠️ `videoUrl` - DEPRECATED (kept for backward compatibility)
- ⚠️ `videoQualities` - DEPRECATED (Mux handles this automatically)

**MuxData Model:**
```typescript
{
  assetId: string,        // Mux asset ID
  playbackId: string,     // Public playback ID for streaming
  video: ObjectId         // Reference to Video document
}
```

### 3. Frontend Components

**VideoUploadForm** (`VideoUploadForm.tsx`)
- Upload video via UploadThing
- Automatically create Mux asset after upload
- Show processing status
- Display Mux player when ready

**VideoPlayer** (`components/shared/VideoPlayer.tsx`)
- Uses `<MuxPlayer>` component exclusively
- Automatic adaptive bitrate streaming
- No manual quality switching needed

**PurchaseCourseCard** (Course preview)
- Uses Mux for video previews
- Smooth playback with play/pause overlay

### 4. Removed/Deprecated

❌ **AdaptiveVideoPlayer** - No longer needed (Mux handles ABR)
❌ **video-quality.ts** - Manual quality detection removed
❌ **videojs-quality-selector** - Quality switching plugin removed
❌ **Direct MP4 streaming** - All videos use HLS via Mux

## Environment Variables

Add to `.env.local`:

```bash
# Mux Configuration
MUX_TOKEN_ID=your_mux_token_id_here
MUX_TOKEN_SECRET=your_mux_token_secret_here

# Optional: For signed/private videos
# MUX_SIGNING_KEY_ID=your_signing_key_id
# MUX_SIGNING_KEY_PRIVATE=your_signing_key_private
```

Get credentials from: https://dashboard.mux.com/ → Settings → Access Tokens

## Migration of Existing Videos

If you have videos that still use direct UploadThing URLs, run the migration script:

```bash
npm run migrate:videos
```

This will:
1. Find all videos with `videoUrl` but no `muxData`
2. Create Mux assets from UploadThing URLs
3. Update video documents with Mux references
4. Show detailed progress and error reporting

## API Routes

### POST `/api/mux/create-asset`

Creates a Mux asset from an UploadThing video URL.

**Request:**
```json
{
  "videoId": "mongodb_video_id",
  "videoUrl": "https://utfs.io/f/your-video.mp4"
}
```

**Response:**
```json
{
  "success": true,
  "assetId": "mux_asset_id",
  "playbackId": "mux_playback_id",
  "muxDataId": "mongodb_muxdata_id"
}
```

## Usage Examples

### Teacher: Upload a Video

1. Navigate to course → section → video
2. Click "Upload Video"
3. Select video file (UploadThing handles upload)
4. Wait for Mux processing (automatic)
5. Video ready with adaptive streaming!

### Student: Watch a Video

```tsx
<MuxPlayer
  playbackId={video.muxData?.playbackId}
  streamType="on-demand"
  metadata={{
    video_id: video._id,
    video_title: video.title,
  }}
  accentColor="#DD0000"
/>
```

## Benefits

✅ **Automatic ABR** - Mux handles all transcoding and quality switching
✅ **Fast Playback** - Videos start immediately with HLS streaming
✅ **No Manual Encoding** - Upload once, Mux creates all resolutions
✅ **Better UX** - Smooth quality transitions based on network speed
✅ **Analytics** - Mux provides detailed viewing analytics
✅ **Cost Effective** - Only pay for what you stream

## Cost Considerations

### Mux Pricing (as of 2024)
- **Encoding**: ~$0.02/minute of video
- **Streaming**: ~$0.01/GB delivered
- **Storage**: ~$0.02/GB/month

### Example:
- Upload 1-hour video (4K)
- Encoding cost: ~$1.20
- Stream to 100 students: ~$5-10/month
- Storage: ~$0.20/month

**Much cheaper than custom encoding + CDN!**

## FAQ

### Q: What happens to old videos?
A: They remain functional. Run `npm run migrate:videos` to convert them to Mux.

### Q: Can I still use UploadThing URLs directly?
A: Not recommended. Mux provides much better performance and ABR.

### Q: How long does Mux processing take?
A: Typically 1-3 minutes for a 1-hour video. Mux processes multiple resolutions in parallel.

### Q: Do I need to delete UploadThing videos after Mux processes them?
A: No. Mux creates assets by reference. UploadThing files remain as backups.

### Q: What about private/paid content?
A: Set `playback_policy: ['signed']` in Mux config for authenticated playback.

### Q: Can students download videos?
A: HLS streaming is harder to download than MP4. Disable MP4 support in Mux for more protection.

## Troubleshooting

### Video shows "still processing"
- Mux is still transcoding. Wait 1-3 minutes.
- Check Mux dashboard for asset status.

### Video won't play
- Verify `MUX_TOKEN_ID` and `MUX_TOKEN_SECRET` are set correctly.
- Check browser console for errors.
- Ensure playback policy is set to `public`.

### Migration script fails
- Verify MongoDB connection.
- Check that video URLs are valid UploadThing URLs.
- Review error messages for specific failures.

## Resources

- [Mux Documentation](https://docs.mux.com/)
- [Mux Player React](https://github.com/muxinc/elements/tree/main/packages/mux-player-react)
- [UploadThing Documentation](https://docs.uploadthing.com/)

## Support

For issues or questions:
1. Check Mux dashboard for processing status
2. Review browser console errors
3. Check server logs for API errors
4. Verify environment variables are set correctly
