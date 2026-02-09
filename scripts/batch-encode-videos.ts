#!/usr/bin/env tsx
/**
 * Batch Encode All Videos
 * 
 * Processes all videos in the database that don't have videoQualities yet
 * 
 * Usage:
 *   npx tsx scripts/batch-encode-videos.ts
 */

import { connectToDatabase } from '@/lib/mongoose';
import Video from '@/lib/models/video.model';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function batchEncodeVideos() {
  console.log('🚀 Starting batch video encoding...\n');
  
  try {
    // Connect to database
    await connectToDatabase();
    
    // Find all videos without videoQualities
    const videos = await Video.find({
      videoUrl: { $exists: true, $ne: '' },
      $or: [
        { videoQualities: { $exists: false } },
        { videoQualities: {} },
      ],
    }).select('_id title videoUrl');
    
    console.log(`📊 Found ${videos.length} videos to encode\n`);
    
    if (videos.length === 0) {
      console.log('✅ All videos already have multiple qualities!');
      return;
    }
    
    // List all videos
    console.log('Videos to encode:');
    videos.forEach((video, index) => {
      console.log(`  ${index + 1}. ${video.title} (${video._id})`);
    });
    
    console.log('\n⚠️  This will:');
    console.log('   1. Download each video from UploadThing');
    console.log('   2. Encode into 5 quality levels');
    console.log('   3. Upload all versions back to UploadThing');
    console.log('   4. Update database');
    console.log('\n⏱️  Estimated time: ~10-30 minutes per video\n');
    
    // Process each video
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Processing ${i + 1}/${videos.length}: ${video.title}`);
      console.log('='.repeat(60));
      
      try {
        // Call the single video encoder
        const { stdout, stderr } = await execAsync(
          `npx tsx scripts/encode-uploadthing-videos.ts ${video._id}`
        );
        
        console.log(stdout);
        if (stderr) console.error(stderr);
        
        successCount++;
        console.log(`✅ Successfully encoded ${video.title}`);
        
      } catch (error: any) {
        failCount++;
        console.error(`❌ Failed to encode ${video.title}:`, error.message);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Batch Encoding Complete');
    console.log('='.repeat(60));
    console.log(`✅ Success: ${successCount} videos`);
    console.log(`❌ Failed: ${failCount} videos`);
    console.log(`📹 Total: ${videos.length} videos`);
    
  } catch (error: any) {
    console.error('❌ Batch encoding failed:', error.message);
    process.exit(1);
  }
}

batchEncodeVideos()
  .then(() => {
    console.log('\n✅ Batch process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Batch process failed:', error);
    process.exit(1);
  });
