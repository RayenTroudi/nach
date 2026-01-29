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

    // Fetch the video from UploadThing
    const videoResponse = await fetch(videoUrl);

    if (!videoResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch video' },
        { status: videoResponse.status }
      );
    }

    // Get the video data
    const videoBlob = await videoResponse.blob();
    const contentType = videoResponse.headers.get('content-type') || 'video/mp4';
    const contentLength = videoResponse.headers.get('content-length');

    // Create response with proper headers
    const headers = new Headers({
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Range',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000',
    });

    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    return new NextResponse(videoBlob, {
      status: 200,
      headers,
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Range',
    },
  });
}
