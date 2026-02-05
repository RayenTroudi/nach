import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoUrl = searchParams.get('url');

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      );
    }

    // Validate it's an UploadThing URL
    if (!videoUrl.startsWith('https://utfs.io/')) {
      return NextResponse.json(
        { error: 'Invalid video URL' },
        { status: 400 }
      );
    }

    // Get the Range header from the request
    const range = request.headers.get('range');

    // Prepare headers for the UploadThing request
    const fetchHeaders: HeadersInit = {};
    if (range) {
      fetchHeaders['Range'] = range;
    }

    // Fetch the video from UploadThing with range support
    const videoResponse = await fetch(videoUrl, {
      headers: fetchHeaders,
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    // If fails, return error immediately (no full-file fallback)
    if (!videoResponse.ok) {
      return new NextResponse(null, { 
        status: videoResponse.status,
        statusText: videoResponse.statusText
      });
    }

    // Get the content type and length from UploadThing response
    const contentType = videoResponse.headers.get('content-type') || 'video/mp4';
    const contentLength = videoResponse.headers.get('content-length');
    const contentRange = videoResponse.headers.get('content-range');
    const acceptRanges = videoResponse.headers.get('accept-ranges') || 'bytes';

    // Create response headers for video streaming
    const responseHeaders = new Headers({
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
      'Access-Control-Expose-Headers': 'Content-Range, Content-Length, Accept-Ranges',
      'Accept-Ranges': acceptRanges,
      'Cache-Control': 'public, max-age=3600',
    });

    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
    }

    if (contentRange) {
      responseHeaders.set('Content-Range', contentRange);
    }

    // Determine the status code based on the upstream response
    const status = videoResponse.status;

    // Stream the response body directly from UploadThing
    return new NextResponse(videoResponse.body, {
      status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Video proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
      'Access-Control-Expose-Headers': 'Content-Range, Content-Length, Accept-Ranges',
    },
  });
}

export async function HEAD(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoUrl = searchParams.get('url');

    if (!videoUrl || !videoUrl.startsWith('https://utfs.io/')) {
      return new NextResponse(null, { status: 400 });
    }

    // Make a HEAD request to get metadata
    const videoResponse = await fetch(videoUrl, { method: 'HEAD' });

    if (!videoResponse.ok) {
      return new NextResponse(null, { status: videoResponse.status });
    }

    const contentType = videoResponse.headers.get('content-type') || 'video/mp4';
    const contentLength = videoResponse.headers.get('content-length');

    const headers = new Headers({
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
      'Accept-Ranges': 'bytes',
    });

    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    return new NextResponse(null, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Video proxy HEAD error:', error);
    return new NextResponse(null, { status: 500 });
  }
}
