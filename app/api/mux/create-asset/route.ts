/**
 * Mux Asset Creation API Route
 * 
 * This route is called after a video is uploaded to UploadThing.
 * It creates a Mux asset for video processing and adaptive bitrate streaming.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { createMuxAsset } from '@/lib/mux';
import { connectToDatabase } from '@/lib/mongoose';
import Video from '@/lib/models/video.model';
import MuxData from '@/lib/models/muxdata.model';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { videoId, videoUrl } = body;

    if (!videoId || !videoUrl) {
      return NextResponse.json(
        { error: 'Missing videoId or videoUrl' },
        { status: 400 }
      );
    }

    // Validate that the video URL is from UploadThing
    if (!videoUrl.includes('utfs.io')) {
      return NextResponse.json(
        { error: 'Invalid video URL. Must be an UploadThing URL.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if video exists and belongs to the user's course
    const video = await Video.findById(videoId).populate({
      path: 'sectionId',
      populate: {
        path: 'course',
        populate: { path: 'instructor' }
      }
    });

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    const instructorId = video.sectionId?.course?.instructor?._id?.toString();
    if (!instructorId || instructorId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to modify this video' },
        { status: 403 }
      );
    }

    console.log('[Mux] Creating asset for video:', videoId);

    // Create Mux asset
    const { assetId, playbackId } = await createMuxAsset(videoUrl, videoId);

    console.log('[Mux] Asset created:', { assetId, playbackId });

    // Delete existing MuxData if any
    if (video.muxData) {
      await MuxData.findByIdAndDelete(video.muxData);
    }

    // Save MuxData to database
    const muxData = await MuxData.create({
      assetId,
      playbackId,
      video: videoId,
    });

    // Update video with MuxData reference and clear videoUrl
    await Video.findByIdAndUpdate(videoId, {
      muxData: muxData._id,
      videoUrl: '', // Clear the direct UploadThing URL
    });

    return NextResponse.json({
      success: true,
      assetId,
      playbackId,
      muxDataId: muxData._id,
    });

  } catch (error: any) {
    console.error('[Mux API] Error creating asset:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create Mux asset' },
      { status: 500 }
    );
  }
}
