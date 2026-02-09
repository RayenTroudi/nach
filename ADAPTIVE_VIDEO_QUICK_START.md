# Adaptive Video Player - Quick Start

## 🚀 What Was Created

### Core Components
1. **AdaptiveVideoPlayer.tsx** - Main video player component with quality selector
2. **videojs-quality-selector.ts** - Custom Video.js plugin for quality menu
3. **video-quality.ts** - Bandwidth detection and quality selection logic
4. **video-helpers.ts** - Helper utilities for video processing
5. **adaptive-video-player.css** - Custom styling

### Documentation
- **ADAPTIVE_VIDEO_STREAMING_GUIDE.md** - Comprehensive implementation guide
- **AdaptiveVideoPlayer.examples.tsx** - Usage examples

---

## ⚡ Quick Start (5 minutes)

### 1. Prepare Your Video (One-time Setup)

```bash
# Install FFmpeg if not already installed
# macOS: brew install ffmpeg
# Ubuntu: sudo apt install ffmpeg

# Encode your video in multiple qualities
cd /workspaces/nach
./scripts/encode-video-qualities.sh input.mp4 ./output
```

### 2. Upload to UploadThing

Upload the generated files (4k.mp4, 1440p.mp4, 1080p.mp4, 720p.mp4) to UploadThing.

### 3. Update Your Database

```typescript
// When saving video, store all quality URLs
await Video.create({
  title: "My Video",
  videoUrl: "https://utfs.io/f/video-1080p.mp4", // fallback
  videoQualities: {
    "4K": "https://utfs.io/f/video-4k.mp4",
    "1440p": "https://utfs.io/f/video-1440p.mp4",
    "1080p": "https://utfs.io/f/video-1080p.mp4",
    "720p": "https://utfs.io/f/video-720p.mp4",
  },
});
```

### 4. Use the Player

```tsx
import AdaptiveVideoPlayer from "@/components/shared/AdaptiveVideoPlayer";
import { convertToVideoSources } from "@/lib/utils/video-helpers";

export default function VideoPage({ video }) {
  const sources = convertToVideoSources(video);
  
  return (
    <AdaptiveVideoPlayer
      sources={sources}
      poster={video.thumbnailUrl}
      defaultQuality="auto"
      enableAutoQuality={true}
    />
  );
}
```

---

## 📱 Features

### Automatic Quality Selection
- ✅ Detects user's bandwidth using Network Information API
- ✅ Considers device screen resolution
- ✅ Respects user's "Data Saver" mode
- ✅ Caches bandwidth for 1 minute

### Manual Quality Control
- ✅ Quality selector in Video.js control bar
- ✅ Shows all available qualities
- ✅ Auto mode for automatic switching
- ✅ Locks to selected quality

### Smart Switching
- ✅ Preserves playback position on quality change
- ✅ Resumes playback if video was playing
- ✅ Smooth transitions
- ✅ Loading indicators

### Performance
- ✅ Lazy loading (preload="metadata")
- ✅ Range request support for seeking
- ✅ Optimized for mobile devices
- ✅ Low memory footprint

---

## 🎯 Migration Guide

### Replace Existing Player

**Before:**
```tsx
import MuxPlayer from "@mux/mux-player-react";

<MuxPlayer playbackId={video.playbackId} />
```

**After:**
```tsx
import AdaptiveVideoPlayer from "@/components/shared/AdaptiveVideoPlayer";
import { convertToVideoSources } from "@/lib/utils/video-helpers";

const sources = convertToVideoSources(video);
<AdaptiveVideoPlayer sources={sources} poster={video.thumbnailUrl} />
```

### For Single-Quality Videos (Backward Compatible)

```tsx
// Works with existing videos that don't have multiple qualities
const sources = convertToVideoSources(video);
// Automatically creates 1080p source from video.videoUrl

<AdaptiveVideoPlayer sources={sources} />
```

---

## 🔧 Configuration

### Quality Levels

Default quality levels and bitrates:
- **4K (2160p)**: 40 Mbps - Ultra HD
- **1440p**: 16 Mbps - QHD
- **1080p**: 8 Mbps - Full HD (Default fallback)
- **720p**: 5 Mbps - HD
- **480p**: 2.5 Mbps - SD
- **360p**: 1 Mbps - Low

### Bandwidth Detection

The system automatically detects bandwidth using:
1. **Network Information API** (Chrome, Edge)
2. **Connection type** (4G, 5G, WiFi)
3. **Effective type** (slow-2g, 2g, 3g, 4g)
4. **Device heuristics** (mobile vs desktop)

### Custom Quality Mapping

```typescript
import { createVideoSources } from "@/lib/utils/video-helpers";

const sources = createVideoSources({
  "4K": "https://utfs.io/f/video-4k.mp4",
  "1080p": "https://utfs.io/f/video-1080p.mp4",
  "720p": "https://utfs.io/f/video-720p.mp4",
});
```

---

## 📊 Quality Selection Logic

```
User Opens Video
      ↓
[Auto Quality Enabled?]
      ↓ Yes
[Detect Bandwidth] → [Detect Screen Size]
      ↓                      ↓
[Recommend: 1080p] ← [Choose Lower]
      ↓
[Load Video at 1080p]
      ↓
[User Can Override Manually]
      ↓
[Lock to Selected Quality]
```

---

## 🎨 Styling

The player uses custom CSS with Video.js theme overrides. Customize in:
```
styles/adaptive-video-player.css
```

Key classes:
- `.adaptive-video-player` - Main container
- `.vjs-quality-selector` - Quality button
- `.vjs-quality-menu-item` - Quality menu items

Dark mode supported via `.dark` class.

---

## 🐛 Troubleshooting

### Player Not Showing Quality Selector

**Check:**
1. Multiple sources are provided (need ≥2 qualities)
2. Plugin is imported: `import "@/lib/utils/videojs-quality-selector"`
3. Browser console for errors

### Video Won't Play

**Check:**
1. Video URLs are accessible
2. `/api/video-stream` endpoint is working
3. Browser supports MP4/H.264
4. Check Network tab in DevTools

### Quality Switch Causes Restart

**Expected behavior** - Client-side quality switching requires source change.
For seamless switching, see "True HLS Approach" in the guide.

### High Bandwidth Usage

**Solutions:**
1. Set `preload="metadata"` (already default)
2. Limit available qualities for mobile
3. Implement segment preloading limits

---

## 📈 Monitoring

### Track Quality Changes

```tsx
<AdaptiveVideoPlayer
  sources={sources}
  onQualityChange={(quality) => {
    // Send to analytics
    trackEvent("video_quality_change", {
      from: previousQuality,
      to: quality,
      videoId: video.id,
    });
  }}
/>
```

### Monitor Bandwidth

```typescript
import { estimateBandwidth, formatBandwidth } from "@/lib/utils/video-quality";

const bandwidth = estimateBandwidth();
console.log("User bandwidth:", formatBandwidth(bandwidth));
```

---

## 🔐 Security

### URL Validation
All video URLs are proxied through `/api/video-stream` which:
- ✅ Validates URL format
- ✅ Prevents SSRF attacks
- ✅ Adds CORS headers
- ✅ Implements rate limiting

---

## 💡 Best Practices

1. **Always provide 720p and 1080p** - Most common qualities
2. **4K only for premium content** - Large files, slower encoding
3. **Use Auto as default** - Best user experience
4. **Monitor quality selection** - Adjust defaults based on usage
5. **Optimize encoding** - Use CRF 20-23 for good quality/size ratio
6. **Generate thumbnails** - Extract at 5-second mark
7. **Test on mobile** - Most users watch on mobile devices

---

## 📦 File Structure

```
components/shared/
  └── AdaptiveVideoPlayer.tsx          (Main component)
  └── AdaptiveVideoPlayer.examples.tsx (Usage examples)

lib/utils/
  └── videojs-quality-selector.ts      (Quality plugin)
  └── video-quality.ts                 (Bandwidth detection)
  └── video-helpers.ts                 (Helper functions)

styles/
  └── adaptive-video-player.css        (Custom styles)

app/api/video-stream/
  └── route.ts                         (Already exists)
```

---

## 🚀 Next Steps

1. **Encode your first video** using the FFmpeg script
2. **Test with the examples** in AdaptiveVideoPlayer.examples.tsx
3. **Update existing players** one page at a time
4. **Monitor usage** and adjust quality defaults
5. **Consider HLS** for high-traffic scenarios (see guide)

---

## 📚 Additional Resources

- [Full Implementation Guide](./ADAPTIVE_VIDEO_STREAMING_GUIDE.md)
- [Video.js Documentation](https://videojs.com/)
- [Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API)

---

## ✨ Summary

You now have a production-ready adaptive video player with:
- ✅ Automatic quality selection based on bandwidth
- ✅ Manual quality control with UI
- ✅ Mobile optimization
- ✅ Seamless integration with UploadThing
- ✅ Backward compatibility with single-quality videos
- ✅ Performance optimizations
- ✅ Comprehensive error handling

**Total implementation time: ~30 minutes per video page**

Need help? Check the troubleshooting section or the full guide!
