import { NextRequest, NextResponse } from 'next/server';

/**
 * Video Streaming API Route
 * 
 * Handles efficient video streaming with range request support for large files.
 * Enables seeking without downloading entire video.
 * 
 * Features:
 * - HTTP Range request support (RFC 7233)
 * - Proper caching headers
 * - CORS headers for cross-origin playback
 * - Error handling for missing/invalid videos
 * - Supports external URLs (UploadThing, S3, etc.)
 */

const CACHE_MAX_AGE = 3600; // 1 hour
const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoUrl = searchParams.get('url');

    console.log('\n🎬 === VIDEO STREAM REQUEST ===');
    console.log('📍 URL:', videoUrl);
    console.log('🌐 Origin:', request.headers.get('origin'));
    console.log('📦 Range:', request.headers.get('range'));

    // Validate video URL
    if (!videoUrl) {
      console.log('❌ No URL provided');
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format (basic security check)
    try {
      new URL(videoUrl);
    } catch {
      console.log('❌ Invalid URL format');
      return NextResponse.json(
        { error: 'Invalid video URL format' },
        { status: 400 }
      );
    }

    // Get range header from client request
    const range = request.headers.get('range');

    // Prepare headers for upstream video fetch
    const upstreamHeaders: HeadersInit = {};
    if (range) {
      upstreamHeaders['Range'] = range;
    }

    console.log('🎬 Video stream request:', videoUrl);
    console.log('📦 Range header:', range);

    // Fetch video from external source
    let videoResponse = await fetch(videoUrl, {
      headers: upstreamHeaders,
    });

    console.log('📡 Upstream response status:', videoResponse.status);

    // If range request fails (UploadThing issue), retry without Range header
    if (!videoResponse.ok && range) {
      console.warn('⚠️ Range request failed, retrying without Range header');
      videoResponse = await fetch(videoUrl);
      console.log('🔄 Retry response status:', videoResponse.status);
    }

    // Handle upstream errors
    if (!videoResponse.ok) {
      console.error(`❌ Video fetch failed: ${videoResponse.status} ${videoResponse.statusText}`);
      console.error(`❌ URL: ${videoUrl}`);
      
      return NextResponse.json(
        { 
          error: 'Video not found or unavailable',
          status: videoResponse.status,
          url: videoUrl
        },
        { status: videoResponse.status }
      );
    }

    // Extract headers from upstream response
    const contentType = videoResponse.headers.get('content-type') || 'video/mp4';
    const contentLength = videoResponse.headers.get('content-length');
    const contentRange = videoResponse.headers.get('content-range');
    const acceptRanges = videoResponse.headers.get('accept-ranges') || 'bytes';

    // Build response headers with CORS and caching
    const responseHeaders = new Headers({
      'Content-Type': contentType,
      'Accept-Ranges': acceptRanges,
      'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, immutable`,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type, Content-Length',
      'Access-Control-Expose-Headers': 'Content-Range, Content-Length, Accept-Ranges, Content-Type',
    });

    // Add content length if available
    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
    }

    // Add content range if this is a partial response
    if (contentRange) {
      responseHeaders.set('Content-Range', contentRange);
    }

    // Determine status code (206 for partial content, 200 for full)
    const status = videoResponse.status === 206 ? 206 : 200;

    console.log('✅ Streaming video:', {
      status,
      contentType,
      contentLength: contentLength ? `${(parseInt(contentLength) / 1024 / 1024).toFixed(2)} MB` : 'unknown',
      hasRange: !!range,
      hasContentRange: !!contentRange,
      duration: `${Date.now() - startTime}ms`,
    });
    console.log('🎬 === END REQUEST ===\n');

    // Stream the video response
    return new NextResponse(videoResponse.body, {
      status,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('Video streaming error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error during video streaming',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type, Content-Length',
      'Access-Control-Expose-Headers': 'Content-Range, Content-Length, Accept-Ranges, Content-Type',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
}

/**
 * Handle HEAD requests for video metadata
 */
export async function HEAD(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoUrl = searchParams.get('url');

    if (!videoUrl) {
      return new NextResponse(null, { status: 400 });
    }

    // Fetch metadata without body
    const videoResponse = await fetch(videoUrl, { 
      method: 'HEAD',
      next: { revalidate: CACHE_MAX_AGE },
    });

    if (!videoResponse.ok) {
      return new NextResponse(null, { status: videoResponse.status });
    }

    const contentType = videoResponse.headers.get('content-type') || 'video/mp4';
    const contentLength = videoResponse.headers.get('content-length');

    const headers = new Headers({
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': `public, max-age=${CACHE_MAX_AGE}`,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
    });

    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    return new NextResponse(null, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Video HEAD request error:', error);
    return new NextResponse(null, { status: 500 });
  }
}
