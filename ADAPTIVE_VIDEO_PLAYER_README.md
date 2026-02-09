# 🎬 Adaptive Video Player - Complete Solution

## 📚 Documentation Index

This repository contains a complete adaptive bitrate video streaming solution for Next.js applications using UploadThing.

### Quick Navigation

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** | Overview of what was built | 5 min |
| **[ADAPTIVE_VIDEO_QUICK_START.md](./ADAPTIVE_VIDEO_QUICK_START.md)** | Get started in 5 minutes | 5 min |
| **[ADAPTIVE_VIDEO_STREAMING_GUIDE.md](./ADAPTIVE_VIDEO_STREAMING_GUIDE.md)** | Complete implementation guide | 30 min |

---

## 🚀 What You Get

### Complete Adaptive Video Player
A production-ready video player that:
- ✅ **Automatically selects** optimal quality based on bandwidth and device
- ✅ **Quality selector UI** for manual control (4K, 1440p, 1080p, 720p, 480p, 360p)
- ✅ **"Auto" mode** that dynamically adjusts quality
- ✅ **Quality locking** when user manually selects
- ✅ **Smooth transitions** with playback preservation
- ✅ **Mobile optimized** with data saving
- ✅ **Error handling** with graceful degradation
- ✅ **Fully typed** TypeScript components

---

## ⚡ 5-Minute Quick Start

### 1. Encode Your Video
```bash
./scripts/encode-video-qualities.sh input.mp4 ./output
```

### 2. Upload to UploadThing
Upload the generated files (4k.mp4, 1440p.mp4, 1080p.mp4, 720p.mp4)

### 3. Update Database
```typescript
{
  videoQualities: {
    "4K": "https://utfs.io/f/video-4k.mp4",
    "1440p": "https://utfs.io/f/video-1440p.mp4",
    "1080p": "https://utfs.io/f/video-1080p.mp4",
    "720p": "https://utfs.io/f/video-720p.mp4"
  }
}
```

### 4. Use the Component
```tsx
import AdaptiveVideoPlayer from "@/components/shared/AdaptiveVideoPlayer";
import { convertToVideoSources } from "@/lib/utils/video-helpers";

const sources = convertToVideoSources(video);
<AdaptiveVideoPlayer sources={sources} defaultQuality="auto" />
```

**Done!** The player handles everything else automatically.

---

## 📁 Component Structure

```
components/shared/
├── AdaptiveVideoPlayer.tsx              # Main player component
└── AdaptiveVideoPlayer.examples.tsx     # 7 usage examples

lib/utils/
├── videojs-quality-selector.ts         # Custom Video.js plugin
├── video-quality.ts                    # Bandwidth & quality detection
└── video-helpers.ts                    # Helper utilities

styles/
└── adaptive-video-player.css          # Custom styling

scripts/
└── encode-video-qualities.sh          # FFmpeg batch encoding
```

---

## 🎯 Key Features

### Automatic Quality Selection
```typescript
// Detects using:
- Network Information API (bandwidth)
- Device screen resolution
- Connection type (4G, 5G, WiFi)
- Data saver mode
- Mobile vs desktop heuristics
```

### Manual Override
```typescript
// User can manually select:
- Auto (dynamic quality)
- 4K (2160p)
- 1440p (QHD)
- 1080p (Full HD)
- 720p (HD)
- 480p (SD)
- 360p (Low)
```

### Smart Switching
```typescript
// When quality changes:
✓ Preserves current playback position
✓ Resumes if video was playing
✓ Shows loading indicator
✓ Handles errors gracefully
```

---

## 💡 Usage Examples

### Basic Usage
```tsx
<AdaptiveVideoPlayer
  sources={sources}
  poster={video.thumbnailUrl}
  defaultQuality="auto"
/>
```

### With All Features
```tsx
<AdaptiveVideoPlayer
  sources={sources}
  poster={video.thumbnailUrl}
  defaultQuality="auto"
  enableAutoQuality={true}
  autoplay={false}
  className="rounded-lg"
  onQualityChange={(quality) => {
    console.log("Quality:", quality);
  }}
  onError={(error) => {
    console.error("Error:", error);
  }}
/>
```

### Mobile Optimized
```tsx
const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
const mobileSources = sources.filter(s => s.height <= 1080);

<AdaptiveVideoPlayer
  sources={isMobile ? mobileSources : sources}
  defaultQuality={isMobile ? "720p" : "auto"}
/>
```

More examples in [AdaptiveVideoPlayer.examples.tsx](./components/shared/AdaptiveVideoPlayer.examples.tsx)

---

## 📊 Quality Matrix

| Quality | Resolution | Bitrate | Use Case | 10min File |
|---------|-----------|---------|----------|------------|
| 4K | 3840x2160 | 40 Mbps | Premium, large screens | ~3 GB |
| 1440p | 2560x1440 | 16 Mbps | High-end desktops | ~1.2 GB |
| 1080p | 1920x1080 | 8 Mbps | Standard HD | ~600 MB |
| 720p | 1280x720 | 5 Mbps | Mobile, slower connections | ~375 MB |
| 480p | 854x480 | 2.5 Mbps | Data saving | ~187 MB |
| 360p | 640x360 | 1 Mbps | Emergency fallback | ~75 MB |

---

## 🔧 Configuration

### Bandwidth Detection
```typescript
import { estimateBandwidth, formatBandwidth } from "@/lib/utils/video-quality";

const bandwidth = estimateBandwidth();
console.log(formatBandwidth(bandwidth)); // "25.0 Mbps"
```

### Quality Helpers
```typescript
import { 
  convertToVideoSources,
  getQualityLabel,
  findBestQuality 
} from "@/lib/utils/video-helpers";

// Convert from database
const sources = convertToVideoSources(video);

// Get quality info
const label = getQualityLabel("1080p"); // "1080p (Full HD)"

// Find best quality for bandwidth
const best = findBestQuality(sources, "1080p");
```

### Save User Preference
```typescript
import { saveQualityPreference } from "@/lib/utils/video-helpers";

// Automatically saved when user changes quality
<AdaptiveVideoPlayer
  onQualityChange={(quality) => {
    saveQualityPreference(quality);
  }}
/>
```

---

## 🎨 Styling

### Custom Theme
```css
/* styles/adaptive-video-player.css */

.adaptive-video-player .vjs-control-bar {
  background-color: rgba(0, 0, 0, 0.7);
}

.adaptive-video-player .vjs-big-play-button {
  border-radius: 50%;
  border: 2px solid #fff;
}

.vjs-quality-selector {
  /* Your custom styles */
}
```

### Dark Mode
The player automatically adapts to `.dark` class on parent elements.

---

## 🔄 Migration Guide

### Replace Existing Player

**Before:**
```tsx
import StreamingVideoPlayer from "@/components/shared/StreamingVideoPlayer";

<StreamingVideoPlayer videoUrl={video.videoUrl} />
```

**After:**
```tsx
import AdaptiveVideoPlayer from "@/components/shared/AdaptiveVideoPlayer";
import { convertToVideoSources } from "@/lib/utils/video-helpers";

const sources = convertToVideoSources(video);
<AdaptiveVideoPlayer sources={sources} />
```

### Backward Compatibility
Works automatically with single-quality videos:
```tsx
// If video.videoQualities is empty, uses video.videoUrl
const sources = convertToVideoSources(video);
// Returns: [{ quality: "1080p", url: video.videoUrl, ... }]
```

---

## 📈 Performance

### Optimization Tips
```typescript
// 1. Lazy load the player
const AdaptiveVideoPlayer = dynamic(
  () => import("@/components/shared/AdaptiveVideoPlayer"),
  { ssr: false }
);

// 2. Preload next video
useEffect(() => {
  if (nextVideo) {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = nextVideo.videoUrl;
    document.head.appendChild(link);
  }
}, [nextVideo]);

// 3. Limit available qualities
const limitedSources = sources.filter(s => 
  ["1080p", "720p", "480p"].includes(s.quality)
);
```

---

## 🐛 Troubleshooting

### Quality Selector Not Showing
1. Ensure multiple sources are provided (need ≥2)
2. Check browser console for errors
3. Verify plugin import: `import "@/lib/utils/videojs-quality-selector"`

### Video Won't Load
1. Test video URL directly in browser
2. Check `/api/video-stream` endpoint
3. Verify CORS headers
4. Check browser Network tab for errors

### High Bandwidth Usage
1. Set initial quality lower: `defaultQuality="720p"`
2. Disable autoplay: `autoplay={false}`
3. Use `preload="metadata"` (already default)
4. Limit qualities on mobile

More in [Troubleshooting Guide](./ADAPTIVE_VIDEO_STREAMING_GUIDE.md#troubleshooting)

---

## 🚦 Implementation Roadmap

### Phase 1: Setup (Day 1)
- ✅ Read Quick Start guide
- ✅ Test with one video
- ✅ Verify quality switching works
- ✅ Check mobile compatibility

### Phase 2: Encode Videos (Week 1)
- ⬜ Identify priority videos
- ⬜ Encode in 1080p, 720p, 480p
- ⬜ Upload to UploadThing
- ⬜ Update database

### Phase 3: Deploy (Week 2)
- ⬜ Replace player on one page
- ⬜ Test in production
- ⬜ Monitor analytics
- ⬜ Gather user feedback

### Phase 4: Scale (Month 1+)
- ⬜ Encode remaining videos
- ⬜ Add 4K for premium content
- ⬜ Optimize based on usage patterns
- ⬜ Consider CDN for high-traffic videos

---

## 📚 API Reference

### AdaptiveVideoPlayer Props

```typescript
interface AdaptiveVideoPlayerProps {
  sources: VideoSource[];           // Required: Array of quality sources
  poster?: string;                  // Optional: Thumbnail URL
  autoplay?: boolean;               // Optional: Auto-start playback
  className?: string;               // Optional: CSS classes
  defaultQuality?: QualityLevel | "auto";  // Optional: Initial quality
  enableAutoQuality?: boolean;      // Optional: Enable auto mode
  onQualityChange?: (quality: QualityLevel) => void;  // Optional: Callback
  onError?: (error: Error) => void; // Optional: Error handler
}
```

### VideoSource Interface

```typescript
interface VideoSource {
  quality: QualityLevel;  // "4K" | "1440p" | "1080p" | "720p" | "480p" | "360p"
  url: string;           // Full URL to video file
  label: string;         // Display label (e.g., "1080p (Full HD)")
  width: number;         // Video width in pixels
  height: number;        // Video height in pixels
  bitrate?: number;      // Optional: Bitrate in bps
}
```

---

## 🔒 Security

### URL Validation
All videos are proxied through `/api/video-stream`:
- ✅ Validates URL format
- ✅ Prevents SSRF attacks
- ✅ Adds proper CORS headers
- ✅ Implements range request support

### Best Practices
```typescript
// Never expose raw UploadThing URLs
❌ <video src="https://utfs.io/f/..." />

// Always use proxied URLs
✅ <AdaptiveVideoPlayer sources={sources} />
// Automatically uses: /api/video-stream?url=...
```

---

## 📊 Analytics

### Track Quality Selection
```typescript
<AdaptiveVideoPlayer
  sources={sources}
  onQualityChange={(quality) => {
    // Send to your analytics service
    analytics.track("video_quality_changed", {
      videoId: video.id,
      quality: quality,
      timestamp: Date.now(),
    });
  }}
/>
```

### Monitor Bandwidth Patterns
```typescript
import { estimateBandwidth, getNetworkQualityDescription } from "@/lib/utils/video-quality";

const bandwidth = estimateBandwidth();
const description = getNetworkQualityDescription(bandwidth);

console.log({
  bandwidth: formatBandwidth(bandwidth),
  quality: description,  // "Excellent", "Good", "Fair", etc.
});
```

---

## 🌟 Advanced Topics

### HLS/DASH Migration
When you're ready to scale to true adaptive streaming, check the [Complete Guide](./ADAPTIVE_VIDEO_STREAMING_GUIDE.md#approach-2-true-hlsdash-streaming) for:
- Mux integration
- AWS MediaConvert setup
- FFmpeg HLS generation
- Migration strategy

### CDN Integration
```typescript
// lib/utils/video-cdn.ts
export function getCDNUrl(uploadThingUrl: string): string {
  const cdnDomain = process.env.NEXT_PUBLIC_CDN_DOMAIN;
  if (!cdnDomain) return uploadThingUrl;
  
  const match = uploadThingUrl.match(/utfs\.io\/f\/(.+)/);
  if (!match) return uploadThingUrl;
  
  return `https://${cdnDomain}/${match[1]}`;
}
```

---

## 🎓 Learning Resources

### Video Encoding
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [H.264 Encoding Guide](https://trac.ffmpeg.org/wiki/Encode/H.264)
- [Web Video Guidelines](https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Video_codecs)

### Adaptive Streaming
- [HLS Specification](https://datatracker.ietf.org/doc/html/rfc8216)
- [DASH Overview](https://dashif.org/)
- [Video.js Documentation](https://videojs.com/)

### Network APIs
- [Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API)
- [Media Source Extensions](https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API)

---

## 🤝 Contributing

### Customization
Feel free to customize:
- Quality levels and bitrates in `video-quality.ts`
- Bandwidth detection logic in `video-quality.ts`
- UI styling in `adaptive-video-player.css`
- Plugin behavior in `videojs-quality-selector.ts`

### Feedback
Found a bug or have a suggestion? Check the troubleshooting guide first, then:
1. Review relevant documentation
2. Check browser console for errors
3. Test with different video sources
4. Verify network connectivity

---

## 📄 License

This implementation follows your project's existing license.

---

## 🎉 Summary

You have a **complete, production-ready adaptive video streaming solution** that:

✅ Works with your existing UploadThing infrastructure  
✅ Automatically selects optimal quality  
✅ Provides manual quality control  
✅ Handles errors gracefully  
✅ Optimized for mobile and desktop  
✅ Fully documented with examples  
✅ TypeScript typed for safety  
✅ Ready to deploy today  

### Get Started:
1. Read [Quick Start Guide](./ADAPTIVE_VIDEO_QUICK_START.md) (5 min)
2. Encode your first video with the included script
3. Try the [examples](./components/shared/AdaptiveVideoPlayer.examples.tsx)
4. Deploy gradually, one page at a time

**Happy streaming!** 🚀📺

---

*For detailed information, see:*
- *[Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - What was built*
- *[Quick Start Guide](./ADAPTIVE_VIDEO_QUICK_START.md) - Get started fast*
- *[Complete Guide](./ADAPTIVE_VIDEO_STREAMING_GUIDE.md) - In-depth documentation*
