/**
 * PRODUCTION-GRADE MIGRATION SCRIPT: UploadThing Videos → Mux Streaming
 * 
 * PURPOSE:
 *   Migrate existing videos from direct UploadThing URLs to Mux adaptive bitrate streaming
 *   WITHOUT re-uploading, re-encoding, or downloading videos.
 *   Handles both section videos (Video model) and FAQ videos (Course model).
 * 
 * USAGE:
 *   npm run migrate:videos              # Run actual migration
 *   npm run migrate:videos -- --dry-run # Preview what will happen
 *   npm run migrate:videos -- --limit 5 # Process only 5 videos of each type
 * 
 * WHAT IT DOES:
 *   1. Finds videos with UploadThing URLs but no Mux playback ID
 *      - Section videos: Video.videoUrl → Video.muxData
 *      - FAQ videos: Course.faqVideo → Course.faqVideoMuxData
 *   2. Creates Mux Asset using the existing UploadThing URL (Mux fetches it)
 *   3. Enables PUBLIC playback policy (no authentication needed)
 *   4. Retrieves the Mux playback_id
 *   5. Saves playback_id to MongoDB
 *   6. Leaves UploadThing files untouched (no deletion)
 * 
 * SAFETY FEATURES:
 *   - Idempotent: Safe to re-run multiple times
 *   - Skips videos already migrated
 *   - Continues on individual failures
 *   - Detailed logging with video IDs
 *   - Dry-run mode for testing
 *   - Batch processing with limits
 * 
 * REQUIREMENTS:
 *   - MUX_TOKEN_ID and MUX_TOKEN_SECRET in .env file
 *   - MongoDB connection configured
 *   - Videos have valid UploadThing URLs (https://utfs.io/f/...)
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
import path from 'path';

// Load .env file from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongoose';
import Video from '@/lib/models/video.model';
import MuxData from '@/lib/models/muxdata.model';
import Section from '@/lib/models/section.model';
import Course from '@/lib/models/course.model';
import { createMuxAsset } from '@/lib/mux';

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const limitArg = args.find(arg => arg.startsWith('--limit'));
const batchLimit = limitArg ? parseInt(limitArg.split('=')[1]) : null;

/**
 * Main migration function
 */
async function migrateVideosToMux() {
  try {
    console.log('════════════════════════════════════════════════════════════');
    console.log('🚀 UploadThing → Mux Migration Script');
    console.log('════════════════════════════════════════════════════════════\n');

    if (isDryRun) {
      console.log('⚠️  DRY RUN MODE - No changes will be made to database or Mux\n');
    }

    if (batchLimit) {
      console.log(`📦 Batch limit: ${batchLimit} videos\n`);
    }

    // Verify environment variables
    if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
      throw new Error(
        '❌ Missing Mux credentials!\n' +
        'Please add MUX_TOKEN_ID and MUX_TOKEN_SECRET to your .env file.\n' +
        'Get them from: https://dashboard.mux.com/settings/access-tokens'
      );
    }

    console.log('🔌 Connecting to MongoDB...');
    await connectToDatabase();
    
    // Ensure models are registered
    await Section.find().limit(1);
    await MuxData.find().limit(1);
    await Course.find().limit(1);
    
    console.log('✅ MongoDB connected successfully\n');

    // Find videos that need migration
    // Criteria: Has videoUrl BUT no muxData reference
    console.log('🔍 Searching for videos to migrate...');
    
    let videoQuery: any = {
      videoUrl: { $exists: true, $ne: '' },
      $or: [
        { muxData: { $exists: false } },
        { muxData: null }
      ]
    };

    let videosToMigrate = await Video.find(videoQuery)
      .limit(batchLimit || 0);

    console.log(`📊 Found ${videosToMigrate.length} section videos to migrate`);

    // Find FAQ videos from courses that need migration (NEW)
    console.log('🔍 Searching for FAQ videos to migrate...');
    
    let faqQuery: any = {
      faqVideo: { $exists: true, $ne: '' },
      $or: [
        { faqVideoMuxData: { $exists: false } },
        { faqVideoMuxData: null }
      ]
    };

    let coursesWithFaqVideos = await Course.find(faqQuery)
      .limit(batchLimit || 0);

    console.log(`📊 Found ${coursesWithFaqVideos.length} FAQ videos to migrate\n`);

    const totalToMigrate = videosToMigrate.length + coursesWithFaqVideos.length;

    if (totalToMigrate === 0) {
      console.log('════════════════════════════════════════════════════════════');
      console.log('✅ MIGRATION COMPLETE');
      console.log('════════════════════════════════════════════════════════════');
      console.log('No videos need migration. All videos are using Mux!\n');
      return;
    }

    // Display preview table
    if (videosToMigrate.length > 0) {
      console.log('Section Videos to migrate:');
      console.log('────────────────────────────────────────────────────────────');
      videosToMigrate.forEach((video, index) => {
        console.log(`${index + 1}. ${video.title}`);
        console.log(`   ID: ${video._id}`);
        console.log(`   URL: ${video.videoUrl.substring(0, 50)}...`);
      });
      console.log('────────────────────────────────────────────────────────────\n');
    }

    if (coursesWithFaqVideos.length > 0) {
      console.log('FAQ Videos to migrate:');
      console.log('────────────────────────────────────────────────────────────');
      coursesWithFaqVideos.forEach((course, index) => {
        console.log(`${index + 1}. ${course.title} (Course FAQ)`);
        console.log(`   ID: ${course._id}`);
        console.log(`   URL: ${course.faqVideo!.substring(0, 50)}...`);
      });
      console.log('────────────────────────────────────────────────────────────\n');
    }

    if (isDryRun) {
      console.log('════════════════════════════════════════════════════════════');
      console.log('✅ DRY RUN COMPLETE');
      console.log('════════════════════════════════════════════════════════════');
      console.log(`Would migrate ${videosToMigrate.length} section videos.`);
      console.log(`Would migrate ${coursesWithFaqVideos.length} FAQ videos.`);
      console.log(`Total: ${totalToMigrate} videos`);
      console.log('Run without --dry-run to execute migration.\n');
      return;
    }

    // Confirm before proceeding
    console.log('⚠️  Starting migration in 3 seconds...');
    console.log('   Press Ctrl+C to cancel\n');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Migration tracking
    let successCount = 0;
    let skipCount = 0;
    let failCount = 0;
    const failures: Array<{ 
      videoId: string; 
      title: string; 
      error: string;
      url: string;
    }> = [];

    const startTime = Date.now();

    // Process each section video
    console.log('════════════════════════════════════════════════════════════');
    console.log('🎬 PROCESSING SECTION VIDEOS');
    console.log('════════════════════════════════════════════════════════════\n');
    
    for (let i = 0; i < videosToMigrate.length; i++) {
      const video = videosToMigrate[i];
      const progress = `[${i + 1}/${videosToMigrate.length}]`;

      console.log('────────────────────────────────────────────────────────────');
      console.log(`${progress} Processing: "${video.title}"`);
      console.log(`   Video ID: ${video._id}`);
      console.log(`   URL: ${video.videoUrl}`);

      try {
        // Validation: Check if URL is from UploadThing
        if (!video.videoUrl.includes('utfs.io')) {
          console.log(`   ⚠️  SKIPPED: Not an UploadThing URL`);
          console.log(`   This video uses a different storage provider\n`);
          skipCount++;
          failures.push({
            videoId: video._id.toString(),
            title: video.title,
            error: 'Not an UploadThing URL',
            url: video.videoUrl
          });
          continue;
        }

        // Double-check: Ensure video doesn't already have muxData
        // (in case database was updated since query)
        if (video.muxData) {
          console.log(`   ⚠️  SKIPPED: Already has Mux data`);
          console.log(`   This video was already migrated\n`);
          skipCount++;
          continue;
        }

        // Step 1: Create Mux Asset
        // Mux will fetch the video from UploadThing URL
        console.log(`   📤 Creating Mux asset (Mux will fetch from UploadThing)...`);
        
        const { assetId, playbackId } = await createMuxAsset(
          video.videoUrl,
          video._id.toString()
        );

        console.log(`   ✅ Mux asset created successfully`);
        console.log(`      Asset ID: ${assetId}`);
        console.log(`      Playback ID: ${playbackId}`);

        // Step 2: Save to MongoDB
        console.log(`   💾 Saving to database...`);
        
        // Create MuxData document
        const muxData = await MuxData.create({
          assetId: assetId,
          playbackId: playbackId,
          video: video._id,
        });

        // Update Video document with muxData reference
        await Video.findByIdAndUpdate(video._id, {
          muxData: muxData._id,
          // Keep videoUrl for backward compatibility
          // videoUrl is left intact (not deleted)
        });

        console.log(`   ✅ Database updated successfully`);
        console.log(`      MuxData ID: ${muxData._id}`);
        console.log(`   🎬 Video can now stream from: https://stream.mux.com/${playbackId}.m3u8\n`);
        
        successCount++;

        // Rate limiting: Small delay between requests to avoid API throttling
        if (i < videosToMigrate.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

      } catch (error: any) {
        console.error(`   ❌ FAILED: ${error.message}`);
        
        // Log additional error details if available
        if (error.response?.data) {
          console.error(`   Response: ${JSON.stringify(error.response.data)}`);
        }
        
        console.log(''); // Empty line for readability
        
        failCount++;
        failures.push({
          videoId: video._id.toString(),
          title: video.title,
          error: error.message,
          url: video.videoUrl
        });
        
        // Continue with next video (don't stop entire migration)
        continue;
      }
    }

    // Process each FAQ video (NEW)
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('📚 PROCESSING FAQ VIDEOS');
    console.log('════════════════════════════════════════════════════════════\n');

    for (let i = 0; i < coursesWithFaqVideos.length; i++) {
      const course = coursesWithFaqVideos[i];
      const progress = `[${i + 1}/${coursesWithFaqVideos.length}]`;

      console.log('────────────────────────────────────────────────────────────');
      console.log(`${progress} Processing FAQ: "${course.title}"`);
      console.log(`   Course ID: ${course._id}`);
      console.log(`   FAQ URL: ${course.faqVideo}`);

      try {
        // Validation: Check if URL is from UploadThing
        if (!course.faqVideo!.includes('utfs.io')) {
          console.log(`   ⚠️  SKIPPED: Not an UploadThing URL`);
          console.log(`   This FAQ video uses a different storage provider\n`);
          skipCount++;
          failures.push({
            videoId: course._id.toString(),
            title: `${course.title} (FAQ)`,
            error: 'Not an UploadThing URL',
            url: course.faqVideo!
          });
          continue;
        }

        // Double-check: Ensure course doesn't already have faqVideoMuxData
        if (course.faqVideoMuxData) {
          console.log(`   ⚠️  SKIPPED: Already has Mux data`);
          console.log(`   This FAQ video was already migrated\n`);
          skipCount++;
          continue;
        }

        // Step 1: Create Mux Asset
        console.log(`   📤 Creating Mux asset (Mux will fetch from UploadThing)...`);
        
        const { assetId, playbackId } = await createMuxAsset(
          course.faqVideo!,
          `faq-${course._id.toString()}`
        );

        console.log(`   ✅ Mux asset created successfully`);
        console.log(`      Asset ID: ${assetId}`);
        console.log(`      Playback ID: ${playbackId}`);

        // Step 2: Save to MongoDB
        console.log(`   💾 Saving to database...`);
        
        // Create MuxData document (without video reference, for FAQ)
        const muxData = await MuxData.create({
          assetId: assetId,
          playbackId: playbackId,
          // Note: No video field since this is a course FAQ video
        });

        // Update Course document with faqVideoMuxData reference
        await Course.findByIdAndUpdate(course._id, {
          faqVideoMuxData: muxData._id,
          // Keep faqVideo for backward compatibility
        });

        console.log(`   ✅ Database updated successfully`);
        console.log(`      MuxData ID: ${muxData._id}`);
        console.log(`   🎬 FAQ video can now stream from: https://stream.mux.com/${playbackId}.m3u8\n`);
        
        successCount++;

        // Rate limiting: Small delay between requests
        if (i < coursesWithFaqVideos.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

      } catch (error: any) {
        console.error(`   ❌ FAILED: ${error.message}`);
        
        if (error.response?.data) {
          console.error(`   Response: ${JSON.stringify(error.response.data)}`);
        }
        
        console.log('');
        
        failCount++;
        failures.push({
          videoId: course._id.toString(),
          title: `${course.title} (FAQ)`,
          error: error.message,
          url: course.faqVideo!
        });
        
        continue;
      }
    }

    const endTime = Date.now();
    const durationSeconds = Math.round((endTime - startTime) / 1000);

    // Final Summary
    console.log('════════════════════════════════════════════════════════════');
    console.log('📊 MIGRATION SUMMARY');
    console.log('════════════════════════════════════════════════════════════');
    console.log(`Section videos processed: ${videosToMigrate.length}`);
    console.log(`FAQ videos processed:     ${coursesWithFaqVideos.length}`);
    console.log(`Total videos processed:   ${totalToMigrate}`);
    console.log(`✅ Successful:             ${successCount}`);
    console.log(`⚠️  Skipped:                ${skipCount}`);
    console.log(`❌ Failed:                 ${failCount}`);
    console.log(`⏱️  Duration:               ${durationSeconds}s`);
    console.log('════════════════════════════════════════════════════════════\n');

    // Detailed failure report
    if (failures.length > 0) {
      console.log('❌ FAILED VIDEOS - DETAILS:');
      console.log('────────────────────────────────────────────────────────────');
      failures.forEach((failure, index) => {
        console.log(`${index + 1}. "${failure.title}"`);
        console.log(`   Video ID: ${failure.videoId}`);
        console.log(`   Error: ${failure.error}`);
        console.log(`   URL: ${failure.url}`);
        console.log('');
      });
      console.log('💡 TIP: Review errors above and re-run migration to retry failed videos.\n');
    }

    // Success message
    if (successCount > 0) {
      console.log('✨ MIGRATION COMPLETE!');
      console.log(`${successCount} video(s) successfully migrated to Mux.\n`);
      console.log('NEXT STEPS:');
      console.log('  1. Check Mux Dashboard: https://dashboard.mux.com/video/assets');
      console.log('  2. Videos will process in 1-3 minutes (Mux creates multiple resolutions)');
      console.log('  3. Once ready, videos will stream with adaptive bitrate automatically');
      console.log('  4. UploadThing files remain as backups (not deleted)\n');
    }

    // Warning if all failed
    if (failCount > 0 && successCount === 0) {
      console.log('⚠️  WARNING: All migrations failed!');
      console.log('Please check:');
      console.log('  - Mux credentials are correct (MUX_TOKEN_ID, MUX_TOKEN_SECRET)');
      console.log('  - Video URLs are accessible from Mux servers');
      console.log('  - MongoDB connection is stable');
      console.log('  - Mux API is operational: https://status.mux.com/\n');
    }

  } catch (error: any) {
    console.error('\n════════════════════════════════════════════════════════════');
    console.error('💥 FATAL ERROR');
    console.error('════════════════════════════════════════════════════════════');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    console.error('');
    throw error;
  } finally {
    // Always close database connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Run migration
if (require.main === module) {
  migrateVideosToMux()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default migrateVideosToMux;
