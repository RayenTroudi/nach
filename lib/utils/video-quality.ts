/**
 * Video Quality Detection and Management
 * 
 * Provides utilities for:
 * - Bandwidth detection
 * - Optimal quality selection based on device and network
 * - Quality level definitions
 */

export type QualityLevel = "4K" | "1440p" | "1080p" | "720p" | "480p" | "360p";

export interface VideoQuality {
  level: QualityLevel;
  width: number;
  height: number;
  bitrate: number; // bits per second
  label: string;
}

/**
 * Quality level definitions
 */
export const QUALITY_LEVELS: Record<QualityLevel, VideoQuality> = {
  "4K": {
    level: "4K",
    width: 3840,
    height: 2160,
    bitrate: 40_000_000, // 40 Mbps
    label: "4K (2160p)",
  },
  "1440p": {
    level: "1440p",
    width: 2560,
    height: 1440,
    bitrate: 16_000_000, // 16 Mbps
    label: "1440p (QHD)",
  },
  "1080p": {
    level: "1080p",
    width: 1920,
    height: 1080,
    bitrate: 8_000_000, // 8 Mbps
    label: "1080p (Full HD)",
  },
  "720p": {
    level: "720p",
    width: 1280,
    height: 720,
    bitrate: 5_000_000, // 5 Mbps
    label: "720p (HD)",
  },
  "480p": {
    level: "480p",
    width: 854,
    height: 480,
    bitrate: 2_500_000, // 2.5 Mbps
    label: "480p (SD)",
  },
  "360p": {
    level: "360p",
    width: 640,
    height: 360,
    bitrate: 1_000_000, // 1 Mbps
    label: "360p",
  },
};

/**
 * Connection quality estimation cache
 */
let cachedBandwidth: number | null = null;
let lastBandwidthCheck: number = 0;
const CACHE_DURATION = 60000; // 1 minute

/**
 * Detect optimal video quality based on device capabilities and network
 */
export function detectOptimalQuality(
  availableSources: Array<{ quality: QualityLevel; width: number; height: number }>
): QualityLevel {
  // Sort sources by quality (highest to lowest)
  const sortedSources = [...availableSources].sort((a, b) => b.height - a.height);
  
  // Get device and network constraints
  const screenWidth = typeof window !== "undefined" ? window.screen.width : 1920;
  const screenHeight = typeof window !== "undefined" ? window.screen.height : 1080;
  const devicePixelRatio = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  
  // Calculate effective screen dimensions
  const effectiveWidth = screenWidth * devicePixelRatio;
  const effectiveHeight = screenHeight * devicePixelRatio;
  
  // Network-based quality selection
  const estimatedBandwidth = estimateBandwidth();
  const networkQuality = getQualityForBandwidth(estimatedBandwidth);
  
  // Device-based quality selection (don't exceed screen resolution)
  let deviceQuality: QualityLevel = sortedSources[0].quality;
  for (const source of sortedSources) {
    if (source.width <= effectiveWidth * 1.2) { // Allow 20% overhead
      deviceQuality = source.quality;
      break;
    }
  }
  
  // Use the lower of network and device quality
  const networkIndex = sortedSources.findIndex(s => s.quality === networkQuality);
  const deviceIndex = sortedSources.findIndex(s => s.quality === deviceQuality);
  
  if (networkIndex === -1 && deviceIndex === -1) {
    return sortedSources[sortedSources.length - 1].quality; // Fallback to lowest
  }
  
  if (networkIndex === -1) return deviceQuality;
  if (deviceIndex === -1) return networkQuality;
  
  // Return lower quality (higher index in sorted array)
  const optimalIndex = Math.max(networkIndex, deviceIndex);
  return sortedSources[optimalIndex].quality;
}

/**
 * Estimate user's bandwidth using Network Information API and heuristics
 */
export function estimateBandwidth(): number {
  // Check cache
  const now = Date.now();
  if (cachedBandwidth !== null && now - lastBandwidthCheck < CACHE_DURATION) {
    return cachedBandwidth;
  }
  
  // Use Network Information API if available
  if (typeof navigator !== "undefined" && "connection" in navigator) {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      let bandwidth = 10_000_000; // Default: 10 Mbps
      
      // Effective type mapping
      if (connection.effectiveType) {
        switch (connection.effectiveType) {
          case "slow-2g":
            bandwidth = 0.5_000_000; // 0.5 Mbps
            break;
          case "2g":
            bandwidth = 1_000_000; // 1 Mbps
            break;
          case "3g":
            bandwidth = 5_000_000; // 5 Mbps
            break;
          case "4g":
            bandwidth = 20_000_000; // 20 Mbps
            break;
          case "5g":
            bandwidth = 100_000_000; // 100 Mbps
            break;
        }
      }
      
      // Use downlink if available (more accurate)
      if (connection.downlink) {
        bandwidth = connection.downlink * 1_000_000; // Convert Mbps to bps
      }
      
      // Consider saveData preference
      if (connection.saveData) {
        bandwidth = Math.min(bandwidth, 2_500_000); // Cap at 2.5 Mbps
      }
      
      cachedBandwidth = bandwidth;
      lastBandwidthCheck = now;
      return bandwidth;
    }
  }
  
  // Fallback: Use device and browser heuristics
  if (typeof window !== "undefined") {
    // Mobile devices: assume moderate bandwidth
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      cachedBandwidth = 10_000_000; // 10 Mbps
      lastBandwidthCheck = now;
      return 10_000_000;
    }
  }
  
  // Desktop default: assume good bandwidth
  cachedBandwidth = 25_000_000; // 25 Mbps
  lastBandwidthCheck = now;
  return 25_000_000;
}

/**
 * Get recommended quality level for given bandwidth
 */
export function getQualityForBandwidth(bandwidth: number): QualityLevel {
  // Add 30% safety margin for smooth playback
  const safeBandwidth = bandwidth * 0.7;
  
  if (safeBandwidth >= QUALITY_LEVELS["4K"].bitrate) return "4K";
  if (safeBandwidth >= QUALITY_LEVELS["1440p"].bitrate) return "1440p";
  if (safeBandwidth >= QUALITY_LEVELS["1080p"].bitrate) return "1080p";
  if (safeBandwidth >= QUALITY_LEVELS["720p"].bitrate) return "720p";
  if (safeBandwidth >= QUALITY_LEVELS["480p"].bitrate) return "480p";
  return "360p";
}

/**
 * Perform active bandwidth test by downloading a sample file
 * More accurate but takes time
 */
export async function performBandwidthTest(
  testUrl: string = "/api/bandwidth-test",
  testDuration: number = 3000
): Promise<number> {
  try {
    const startTime = performance.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), testDuration);
    
    const response = await fetch(testUrl, {
      signal: controller.signal,
      cache: "no-cache",
    });
    
    if (!response.ok) throw new Error("Bandwidth test failed");
    
    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");
    
    let totalBytes = 0;
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        totalBytes += value.length;
      }
    } catch (error) {
      // Test was aborted (expected)
    } finally {
      clearTimeout(timeout);
      reader.releaseLock();
    }
    
    const duration = (performance.now() - startTime) / 1000; // seconds
    const bandwidth = (totalBytes * 8) / duration; // bits per second
    
    // Cache the result
    cachedBandwidth = bandwidth;
    lastBandwidthCheck = Date.now();
    
    return bandwidth;
  } catch (error) {
    console.warn("Bandwidth test failed:", error);
    return estimateBandwidth(); // Fallback to estimation
  }
}

/**
 * Format bandwidth for display
 */
export function formatBandwidth(bandwidth: number): string {
  const mbps = bandwidth / 1_000_000;
  
  if (mbps >= 1000) {
    return `${(mbps / 1000).toFixed(1)} Gbps`;
  }
  
  if (mbps >= 1) {
    return `${mbps.toFixed(1)} Mbps`;
  }
  
  return `${(mbps * 1000).toFixed(0)} Kbps`;
}

/**
 * Get human-readable network quality description
 */
export function getNetworkQualityDescription(bandwidth: number): string {
  const mbps = bandwidth / 1_000_000;
  
  if (mbps >= 50) return "Excellent";
  if (mbps >= 25) return "Very Good";
  if (mbps >= 10) return "Good";
  if (mbps >= 5) return "Fair";
  if (mbps >= 2) return "Poor";
  return "Very Poor";
}

/**
 * Check if device supports 4K playback
 */
export function supports4K(): boolean {
  if (typeof window === "undefined") return false;
  
  const screenWidth = window.screen.width * (window.devicePixelRatio || 1);
  const screenHeight = window.screen.height * (window.devicePixelRatio || 1);
  
  // Check if screen resolution is 4K or higher
  return screenWidth >= 3840 && screenHeight >= 2160;
}

/**
 * Clear bandwidth cache (useful after network change)
 */
export function clearBandwidthCache(): void {
  cachedBandwidth = null;
  lastBandwidthCheck = 0;
}

/**
 * Monitor network changes and clear cache
 */
if (typeof navigator !== "undefined" && "connection" in navigator) {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (connection) {
    connection.addEventListener("change", () => {
      clearBandwidthCache();
      console.log("Network connection changed, cleared bandwidth cache");
    });
  }
}
