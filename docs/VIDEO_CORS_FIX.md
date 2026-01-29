# Video CORS Fix Documentation

## Problem
When uploading videos through UploadThing (utfs.io) in the teacher section, videos failed to play with the following errors:

```
Access to video at 'https://utfs.io/f/...' from origin 'https://nach-snowy.vercel.app' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present 
on the requested resource.

[mux-player 2.4.1] MediaError: MEDIA_ELEMENT_ERROR: Format error
Source Not Supported
```

## Root Cause
UploadThing's CDN (utfs.io) does not provide the necessary CORS headers (`Access-Control-Allow-Origin`) required for HTML5 video players and Mux Player to play videos directly from their URLs. This is a known limitation when trying to stream video files from UploadThing.

## Solution Implemented
Created a **video proxy API route** that:
1. Fetches videos from UploadThing
2. Adds proper CORS headers
3. Serves the video to the player with appropriate permissions

### Files Created/Modified

#### 1. **New API Route**: `app/api/video-proxy/route.ts`
- Proxies video requests from UploadThing
- Adds CORS headers: `Access-Control-Allow-Origin: *`
- Supports range requests for video seeking
- Handles OPTIONS preflight requests

#### 2. **Utility Helper**: `lib/utils/video-url-helper.ts`
- Centralized function: `getProxiedVideoUrl(url)`
- Automatically detects UploadThing URLs
- Proxies UploadThing videos, passes through other URLs (Mux, etc.)

#### 3. **Updated Components**:
- `components/shared/VideoPlayer.tsx`
- `app/(dashboard)/(routes)/teacher/courses/manage/[courseId]/sections/manage/[sectionId]/videos/manage/[videoId]/_components/VideoUploadForm.tsx`
- `app/(landing-page)/course/[courseId]/_components/PurchaseCourseCard.tsx`

All components now use `getProxiedVideoUrl()` to ensure videos play correctly.

#### 4. **Configuration Updates**:
- **next.config.mjs**: Added CORS headers for `/api/video-proxy`
- **vercel.json**: Added deployment-specific CORS configuration

## How It Works

### Before (Broken):
```
Browser → Directly requests https://utfs.io/f/video.mp4 → CORS Error
```

### After (Working):
```
Browser → Requests /api/video-proxy?url=https://utfs.io/f/video.mp4
        → Proxy fetches from UploadThing
        → Proxy adds CORS headers
        → Returns video to browser → ✅ Plays successfully
```

## Usage Example

```typescript
import { getProxiedVideoUrl } from "@/lib/utils/video-url-helper";

// In any component using video
<MuxPlayer
  src={getProxiedVideoUrl(video.videoUrl)}
  // ... other props
/>
```

The helper automatically:
- ✅ Proxies UploadThing URLs (https://utfs.io/...)
- ✅ Passes through Mux URLs unchanged
- ✅ Handles undefined/null values safely

## Performance Considerations

### Current Implementation
- **Pros**: Simple, works immediately, no additional services needed
- **Cons**: 
  - Videos are proxied through your Next.js server
  - Increased bandwidth usage on your Vercel deployment
  - Potential latency for large video files

### Recommended Long-Term Solution: Use Mux
For production applications with significant video content, consider migrating to **Mux Video**:

1. **Benefits**:
   - Built specifically for video streaming
   - Proper CORS support out of the box
   - Adaptive bitrate streaming
   - Analytics and monitoring
   - CDN distribution
   - Video processing (thumbnails, quality variants)

2. **Implementation**:
   ```bash
   npm install @mux/mux-node
   ```

3. **Migration Path**:
   - Keep UploadThing for images/documents
   - Use Mux for video files
   - Update `sectionVideo` endpoint in `app/api/uploadthing/core.ts`
   - Store Mux playback IDs instead of direct URLs

## Testing

After deployment, verify:
1. ✅ Upload a new video in teacher section
2. ✅ Video preview shows immediately after upload
3. ✅ No CORS errors in browser console
4. ✅ Video playback controls work (play, pause, seek)
5. ✅ Videos in student course view play correctly

## Troubleshooting

### Issue: "Source Not Supported" still appears
- **Check**: Ensure the video URL starts with `https://utfs.io/`
- **Solution**: Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue: Slow video loading
- **Cause**: Videos are being proxied through your server
- **Solution**: Consider migrating to Mux for better performance

### Issue: "Failed to fetch video" in console
- **Check**: Verify the UploadThing URL is valid
- **Check**: Ensure `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID` are set correctly

## Environment Variables Required

```env
UPLOADTHING_SECRET=sk_live_your_secret_key
UPLOADTHING_APP_ID=your_app_id
```

Get these from: https://uploadthing.com/dashboard

## Additional Notes

- The proxy route is cached with `max-age=31536000` (1 year) for better performance
- Range requests are supported for video seeking
- The proxy works with all video formats supported by UploadThing
- No changes needed to existing video URLs in the database

## Future Improvements

1. Add video caching layer (Redis/CDN)
2. Implement signed URLs with expiration
3. Add rate limiting to prevent abuse
4. Migrate to Mux for dedicated video hosting
5. Add video compression before upload
