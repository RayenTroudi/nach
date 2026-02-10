# Mux Video Streaming Implementation - Best Practices Guide

## Overview

All videos in this application now use Mux for adaptive bitrate (ABR) streaming. This guide documents the implementation, best practices, and components used for video playback.

## ✅ What Was Done

### 1. **Centralized Video Player Component**
Created `components/shared/MuxVideoPlayer.tsx` - A best-practice Mux player component with:
- ✅ Adaptive bitrate streaming (HLS) - Automatic quality adjustment
- ✅ Fast startup with `preload="metadata"`
- ✅ Mobile-optimized (`playsInline`)
- ✅ Accessibility (ARIA labels, keyboard controls)
- ✅ Automatic thumbnail generation from Mux
- ✅ Loading and error states
- ✅ Next.js SSR-safe (client-only rendering)
- ✅ Responsive aspect ratios (16:9, 9:16, 4:3, 1:1)

### 2. **Updated All Video Playback Locations**

#### Section Videos (Course Content)
- **File:** `components/shared/VideoPlayer.tsx`
- **Usage:** Main video player for course sections
- **Status:** ✅ Updated to use MuxVideoPlayer
- **Features:** Full controls, automatic thumbnail, error handling

#### FAQ Videos (Course Introductions)
- **File:** `app/(landing-page)/_components/FAQVideoPlayer.tsx`
- **Usage:** Instagram-style FAQ video carousel
- **Status:** ✅ Updated to use Mux streaming
- **Features:** Custom navigation, auto-play, keyboard controls

#### Teacher FAQ Video Form
- **File:** `app/(dashboard)/(routes)/teacher/courses/manage/[courseId]/_components/FAQVideoForm.tsx`
- **Usage:** Teacher video upload and preview
- **Status:** ✅ Updated to use MuxVideoPlayer
- **Features:** Processing status, refresh button

#### Course Preview Cards
- **File:** `app/(landing-page)/course/[courseId]/_components/PurchaseCourseCard.tsx`
- **Usage:** Video preview on course purchase page
- **Status:** ✅ Updated to use MuxVideoPlayer
- **Features:** Play overlay, thumbnail fallback

#### Video Upload Form (Teacher)
- **File:** `app/(dashboard)/(routes)/teacher/courses/manage/[courseId]/sections/manage/[sectionId]/videos/manage/[videoId]/_components/VideoUploadForm.tsx`
- **Usage:** Teacher video upload interface
- **Status:** ✅ Updated to use MuxVideoPlayer
- **Features:** Automatic Mux processing after upload

### 3. **Database Schema**
Videos are stored with Mux references:

```typescript
// Video Model (Section Videos)
{
  _id: ObjectId,
  title: string,
  videoUrl: string,  // Original UploadThing URL (deprecated, kept for backup)
  muxData: {
    playbackId: string,  // Used for playback
    assetId: string
  }
}

// Course Model (FAQ Videos)
{
  _id: ObjectId,
  title: string,
  faqVideo: string,  // Original UploadThing URL (deprecated, kept for backup)
  faqVideoMuxData: {
    playbackId: string,  // Used for playback
    assetId: string
  }
}
```

## 📦 Key Components

### MuxVideoPlayer Component

**Location:** `components/shared/MuxVideoPlayer.tsx`

**Props:**
```typescript
interface MuxVideoPlayerProps {
  playbackId: string;           // Required: Mux playback ID
  title?: string;                // Optional: Video title for accessibility
  poster?: string;               // Optional: Thumbnail URL (auto-generated if not provided)
  autoPlay?: boolean;            // Optional: Auto-play on mount
  muted?: boolean;               // Optional: Mute audio
  className?: string;            // Optional: Additional CSS classes
  aspectRatio?: "16:9" | "9:16" | "4:3" | "1:1";  // Optional: Aspect ratio
  metadata?: object;             // Optional: Mux analytics metadata
  onError?: (error: any) => void;       // Optional: Error callback
  onLoadedData?: () => void;     // Optional: Load complete callback
  showControls?: boolean;        // Optional: Show/hide controls (default: true)
}
```

**Usage Example:**
```tsx
import MuxVideoPlayer from "@/components/shared/MuxVideoPlayer";

<MuxVideoPlayer
  playbackId="abc123xyz"
  title="Introduction to React"
  metadata={{
    video_id: "video_123",
    video_title: "Introduction to React"
  }}
  showControls={true}
/>
```

### Thumbnail Generation

**Function:** `getMuxThumbnail()`

Automatically generates thumbnail URLs from Mux:
```typescript
import { getMuxThumbnail } from "@/components/shared/MuxVideoPlayer";

// Basic usage
const thumb = getMuxThumbnail(playbackId);

// With options
const thumb = getMuxThumbnail(playbackId, {
  time: 5,         // Screenshot at 5 seconds
  width: 1280,     // Width in pixels
  height: 720,     // Height in pixels
  fitMode: "crop"  // Fit mode: preserve, stretch, crop, smartcrop
});
```

## 🔄 Video Upload Workflow

1. **Teacher uploads video** via UploadThing
2. **Auto-trigger Mux processing** via `/api/mux/create-asset`
3. **Mux processes video** (creates multiple resolutions)
4. **MuxData document created** in MongoDB with playback ID
5. **Video ready for streaming** with adaptive bitrate

**API Route:** `app/api/mux/create-asset/route.ts`

## 📊 Mux Features Used

### Adaptive Bitrate Streaming (ABR)
- Automatic quality adjustment based on network conditions
- Multiple resolutions generated automatically
- HLS streaming protocol
- No manual quality switching needed

### Thumbnails
- Automatic generation at any timestamp
- Customizable dimensions and fit modes
- URL: `https://image.mux.com/{playbackId}/thumbnail.jpg`

### Analytics
- Video metadata passed to Mux
- Tracks video_id, video_title, course_id
- Available in Mux Dashboard

## 🚀 Performance Optimizations

1. **Preload Strategy:** `preload="metadata"`
   - Loads only video metadata, not full video
   - Fast initial page load
   - Video starts quickly when play button clicked

2. **Client-Side Only Rendering**
   - Prevents Next.js hydration mismatches
   - Uses `useEffect` and `useState` for mounting
   - Safe for SSR

3. **Automatic Thumbnail Loading**
   - No need to store thumbnails in database
   - Generated on-demand by Mux
   - Cached by CDN

4. **Error Boundaries**
   - Graceful error handling
   - User-friendly error messages
   - Retry functionality

## ♿ Accessibility Features

- **ARIA Labels:** All players have descriptive labels
- **Keyboard Controls:** Space to play/pause, arrows for navigation
- **Screen Reader Support:** Proper semantic HTML
- **Focus Management:** Visible focus indicators
- **Color Contrast:** High contrast controls

## 🔧 Troubleshooting

### Video Not Playing

**1. Check if Mux data exists:**
```typescript
if (!video.muxData?.playbackId) {
  console.error('Video missing Mux data');
}
```

**2. Check if video is still processing:**
- Videos take 1-3 minutes to process after upload
- Show "Processing" message to users
- Add refresh button

**3. Check Mux credentials:**
- Verify `MUX_TOKEN_ID` and `MUX_TOKEN_SECRET` in `.env`
- Check Mux Dashboard for asset status

### Slow Loading

**1. Use proper preload strategy:**
```tsx
<MuxVideoPlayer preload="metadata" />
```

**2. Check network conditions:**
- Mux automatically adjusts quality
- Poor network = lower quality (expected behavior)

**3. Use thumbnails:**
```tsx
poster={getMuxThumbnail(playbackId)}
```

## 📝 Migration Notes

### What Changed
- ❌ Removed: Direct `<video>` tags with UploadThing URLs
- ❌ Removed: Video.js player for UploadThing videos
- ❌ Removed: Manual quality selection
- ✅ Added: Unified MuxVideoPlayer component
- ✅ Added: Automatic thumbnail generation
- ✅ Added: Better error handling and loading states

### Backward Compatibility
- Original `videoUrl` and `faqVideo` fields preserved in database
- Used as fallback/backup only
- All playback now uses Mux

### Old Components (Deprecated)
- `components/shared/OptimizedVideoPlayer.tsx` - No longer needed
- `components/shared/StreamingVideoPlayer.tsx` - No longer needed
- `components/shared/VideoPlayerWrapper.tsx` - No longer needed
- `components/shared/AdaptiveVideoPlayer.tsx` - No longer needed

**Action:** Can be safely deleted after confirming all videos work with Mux.

## 🌐 Environment Variables

Required in `.env`:
```bash
MUX_TOKEN_ID=your_token_id_here
MUX_TOKEN_SECRET=your_token_secret_here
```

Get credentials from: https://dashboard.mux.com/settings/access-tokens

## 📚 Resources

- [Mux Documentation](https://docs.mux.com/)
- [Mux Player React](https://github.com/mux/elements/tree/main/packages/mux-player-react)
- [Mux Thumbnails Guide](https://docs.mux.com/guides/get-images-from-a-video)
- [Next.js Best Practices](https://nextjs.org/docs/app/building-your-application/rendering/client-components)

## ✅ Checklist for New Videos

- [ ] Video uploaded via UploadThing
- [ ] Mux asset created automatically
- [ ] MuxData document exists in MongoDB
- [ ] playbackId populated
- [ ] Video plays with adaptive bitrate
- [ ] Thumbnail displays correctly
- [ ] Controls work (play, pause, seek)
- [ ] Error handling works
- [ ] Mobile playback works (playsInline)

## 🎯 Future Enhancements

1. **Signed Playback URLs** (if needed for private content)
   - Add signing logic to Mux utilities
   - Generate signed tokens server-side

2. **Subtitles/Captions**
   - Upload VTT files to Mux
   - Add text tracks to MuxVideoPlayer

3. **Player Customization**
   - Theme support (light/dark)
   - Custom branding colors
   - Logo overlays

4. **Advanced Analytics**
   - Watch time tracking
   - Completion rates
   - Quality of Experience (QoE) metrics

---

**Last Updated:** February 10, 2026  
**Mux Package Version:** @mux/mux-player-react v2.4.1  
**Next.js Version:** App Router
