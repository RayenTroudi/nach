/**
 * Mux Asset Creation API Route
 * 
 * This route is called after a video is uploaded to UploadThing.
 * It creates a Mux asset for video processing and adaptive bitrate streaming.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { createMuxAsset, deleteMuxAsset } from '@/lib/mux';
import { connectToDatabase } from '@/lib/mongoose';
import Video from '@/lib/models/video.model';
import MuxData from '@/lib/models/muxdata.model';
import Section from '@/lib/models/section.model';
import Course from '@/lib/models/course.model';
import User from '@/lib/models/user.model';

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

    // Ensure models are registered
    await Section.find().limit(0);
    await Course.find().limit(0);
    await User.find().limit(0);

    // Check if video exists and belongs to the user's course
    const video = await Video.findById(videoId)
      .populate({
        path: 'sectionId',
        model: 'Section',
        populate: {
          path: 'course',
          model: 'Course',
          populate: { 
            path: 'instructor',
            model: 'User'
          }
        }
      })
      .lean();

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    console.log('[Mux] Video populated:', {
      hasSection: !!video.sectionId,
      hasCourse: !!(video.sectionId as any)?.course,
      hasInstructor: !!((video.sectionId as any)?.course as any)?.instructor,
    });

    // Verify ownership - compare Clerk's userId with instructor's clerkId
    const section = video.sectionId as any;
    const course = section?.course;
    const instructor = course?.instructor;
    
    if (!section || !course || !instructor) {
      console.error('[Mux] Population failed:', { 
        hasSection: !!section, 
        hasCourse: !!course, 
        hasInstructor: !!instructor 
      });
      return NextResponse.json(
        { error: 'Video data incomplete. Please ensure the video has a valid section and course.' },
        { status: 400 }
      );
    }

    const instructorClerkId = instructor.clerkId;
    if (!instructorClerkId || instructorClerkId !== userId) {
      console.error('[Mux] Authorization failed:', { instructorClerkId, userId });
      return NextResponse.json(
        { error: 'Unauthorized to modify this video' },
        { status: 403 }
      );
    }

    console.log('[Mux] Creating asset for video:', videoId);

    // Create Mux asset
    const { assetId, playbackId } = await createMuxAsset(videoUrl, videoId);

    console.log('[Mux] Asset created:', { assetId, playbackId });

    // Delete existing Mux asset and MuxData if any
    if (video.muxData) {
      const existingMuxData = await MuxData.findById(video.muxData);
      if (existingMuxData?.assetId) {
        console.log('[Mux] Deleting old asset:', existingMuxData.assetId);
        try {
          await deleteMuxAsset(existingMuxData.assetId);
        } catch (error) {
          console.error('[Mux] Failed to delete old asset:', error);
          // Continue even if deletion fails
        }
      }
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
    console.error('[Mux API] Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { error: error.message || 'Failed to create Mux asset' },
      { status: 500 }
    );
  }
}
